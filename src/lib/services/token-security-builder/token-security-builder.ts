import { GoPlusSolanaTokenSecurity, GoPlusTokenSecurity } from "python-proxy-scraper-client";
import { ChainId, isEvmChainId } from "../../../shared/chains";
import { TokenSecurity, REQUIRED_TOKEN_SECURITY_FIELDS, RequiredTokenSecurityFields } from "../../models/token/types";
import { BirdeyeMapper } from "../apis/birdeye/birdeye-mapper";
import { GmGnMapper } from "../apis/gmgn/gmgn-mapper";
import { GoPlusMapper } from "../apis/goplus/goplus-mapper";
import { RawTokenDataCache } from "../raw-data/raw-data";

export class TokenSecurityBuilder {
    public rawData: RawTokenDataCache;

    constructor(
        private readonly tokenAddress: string,
        private chainId: ChainId,
        rawData?: RawTokenDataCache,
    ) {
        this.rawData = rawData || new RawTokenDataCache(tokenAddress, chainId);
    }

    async collect(): Promise<{
        birdeyeTokenSecurity: Partial<TokenSecurity>;
        gmgnTokenSecurity: Partial<TokenSecurity>;
        goPlusTokenSecurity: Partial<TokenSecurity>;
    }> {
        const [birdeyeTokenSecurity, gmgnTokenSecurity, goPlusTokenSecurity] = await Promise.all([
            this.getBirdeyeTokenSecurity(),
            this.getGmgnTokenSecurity(),
            this.getGoPlusTokenSecurity(),
        ]);

        return {
            birdeyeTokenSecurity,
            gmgnTokenSecurity,
            goPlusTokenSecurity,
        };
    }

    async getBirdeyeTokenSecurity(): Promise<Partial<TokenSecurity>> {
        const birdeyeSecurityData = await this.rawData.birdeye.getTokenSecurity();
        if (!birdeyeSecurityData) {
            return {};
        }

        return BirdeyeMapper.extractTokenSecurity(birdeyeSecurityData);
    }

    async getGmgnTokenSecurity(): Promise<Partial<TokenSecurity>> {
        const gmgnSecurityData = await this.rawData.gmgn.getTokenSecurityAndLaunchpad();
        if (!gmgnSecurityData) {
            return {};
        }

        return GmGnMapper.extractTokenSecurity(gmgnSecurityData.security);
    }

    async getGoPlusTokenSecurity(): Promise<Partial<TokenSecurity>> {
        const goPlusSecurityData = await this.rawData.goPlus.getTokenSecurity();
        if (!goPlusSecurityData) {
            return {};
        }


        if (isEvmChainId(this.chainId)) {
            return GoPlusMapper.extractTokenSecurityFromEvm(goPlusSecurityData as GoPlusTokenSecurity);
        } else {
            return GoPlusMapper.extractTokenSecurityFromSolana(goPlusSecurityData as GoPlusSolanaTokenSecurity);
        }
    }

    async getTokenSecurity(): Promise<TokenSecurity> {
        const { birdeyeTokenSecurity, gmgnTokenSecurity, goPlusTokenSecurity } =
            await this.collect();

        const securitySources = [
            goPlusTokenSecurity,
            birdeyeTokenSecurity,
            gmgnTokenSecurity,
        ];

        const mergedSecurity = this.mergeTokenSecurity(securitySources);
        const validatedSecurity = this.validate(mergedSecurity);
        return validatedSecurity;
    }

    /**
     * Validate that required fields are present in TokenSecurity
     * @param security - The TokenSecurity object to validate
     * @param requiredFields - Array of field names that must be defined
     * @throws Error if any required field is undefined
     */
    validate(
        security: Partial<TokenSecurity>,
        requiredFields: (keyof TokenSecurity)[] = ['isMintable', 'isRenounced', 'isLpTokenBurned', 'isHoneypot', 'isPausable']
    ): TokenSecurity {
        const missingFields: string[] = [];

        for (const field of requiredFields) {
            if (security[field] === undefined) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            throw new Error(
                `TokenSecurity validation failed: Missing required fields: ${missingFields.join(', ')}`
            );
        }

        return security as TokenSecurity;
    }




    /**
     * Merge partial token security data from multiple sources
     * Uses pessimistic approach for risks (OR) and optimistic for protections (OR)
     * Returns defaults for fields where no source provided data
     */
    private mergeTokenSecurity(securities: Partial<TokenSecurity>[]): Partial<TokenSecurity> {
        // Collect all defined values for boolean fields
        const isHoneypotValues = securities.map(s => s.isHoneypot).filter(v => v !== undefined) as boolean[];
        const isMintableValues = securities.map(s => s.isMintable).filter(v => v !== undefined) as boolean[];
        const isPausableValues = securities.map(s => s.isPausable).filter(v => v !== undefined) as boolean[];
        const isFreezableValues = securities.map(s => s.isFreezable).filter(v => v !== undefined) as boolean[];
        const isLpBurnedValues = securities.map(s => s.isLpTokenBurned).filter(v => v !== undefined) as boolean[];
        const isRenouncedValues = securities.map(s => s.isRenounced).filter(v => v !== undefined) as boolean[];
        const isBlacklistValues = securities.map(s => s.isBlacklist).filter(v => v !== undefined) as boolean[];

        // Collect all defined tax values
        const buyTaxValues = securities.map(s => s.buyTax).filter(v => v !== undefined) as number[];
        const sellTaxValues = securities.map(s => s.sellTax).filter(v => v !== undefined) as number[];
        const transferTaxValues = securities.map(s => s.transferTax).filter(v => v !== undefined) as number[];
        const transferFeeValues = securities.map(s => s.transferFee).filter(v => v !== undefined) as number[];
        const transferFeeUpgradeableValues = securities.map(s => s.transferFeeUpgradeable).filter(v => v !== undefined) as boolean[];

        // Merge boolean fields - pessimistic for risks, optimistic for protections
        const result: Partial<TokenSecurity> = {
            // Pessimistic: if ANY source says true, it's risky
            isHoneypot: isHoneypotValues.length > 0 ? isHoneypotValues.some(v => v) : undefined,
            isMintable: isMintableValues.length > 0 ? isMintableValues.some(v => v) : undefined,
            isPausable: isPausableValues.length > 0 ? isPausableValues.some(v => v) : undefined,
            isFreezable: isFreezableValues.length > 0 ? isFreezableValues.some(v => v) : undefined,
            
            // Optimistic: if ANY source says true, we have protection
            isLpTokenBurned: isLpBurnedValues.length > 0 ? isLpBurnedValues.some(v => v) : undefined,
            isRenounced: isRenouncedValues.length > 0 ? isRenouncedValues.some(v => v) : undefined,
        };

        // Optional boolean fields
        if (isBlacklistValues.length > 0) {
            result.isBlacklist = isBlacklistValues.some(v => v);
        }
        if (transferFeeUpgradeableValues.length > 0) {
            result.transferFeeUpgradeable = transferFeeUpgradeableValues.some(v => v);
        }

        // Tax fields: use maximum (worst case)
        if (buyTaxValues.length > 0) {
            result.buyTax = Math.max(...buyTaxValues);
        }
        if (sellTaxValues.length > 0) {
            result.sellTax = Math.max(...sellTaxValues);
        }
        if (transferTaxValues.length > 0) {
            result.transferTax = Math.max(...transferTaxValues);
        }
        if (transferFeeValues.length > 0) {
            result.transferFee = Math.max(...transferFeeValues);
        }

        return result;
    }
}
