import { GoPlusSolanaTokenSecurity, GoPlusTokenSecurity } from "python-proxy-scraper-client";
import { ChainId, isEvmChainId } from "../../../shared/chains";
import { deepMergeAll } from "../../../utils/data-aggregator";
import { TokenSecurity } from "../../models/token/types";
import { BirdeyeMapper } from "../apis/birdeye/birdeye-mapper";
import { GmGnMapper } from "../apis/gmgn/gmgn-mapper";
import { GoPlusMapper } from "../apis/goplus/goplus-mapper";
import { RawTokenDataCache } from "../raw-data/raw-data";

export class TokenSecurityBuilder {
    constructor(
        private readonly tokenAddress: string,
        private chainId: ChainId,
        private rawData: RawTokenDataCache,
    ) {}

    async collect(): Promise<{
        birdeyeTokenSecurity: TokenSecurity | null;
        gmgnTokenSecurity: TokenSecurity | null;
        goPlusTokenSecurity: TokenSecurity | null;
    }> {
        await this.rawData.collect();

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

    async getBirdeyeTokenSecurity(): Promise<TokenSecurity | null> {
        const birdeyeSecurityData = await this.rawData.birdeye.getTokenSecurity();
        if (!birdeyeSecurityData) {
            return null;
        }

        return BirdeyeMapper.extractTokenSecurity(birdeyeSecurityData);
    }

    async getGmgnTokenSecurity(): Promise<TokenSecurity | null> {
        const gmgnSecurityData = await this.rawData.gmgn.getTokenSecurityAndLaunchpad();
        if (!gmgnSecurityData) {
            return null;
        }

        return GmGnMapper.extractTokenSecurity(gmgnSecurityData.security);
    }

    async getGoPlusTokenSecurity(): Promise<TokenSecurity | null> {
        const goPlusSecurityData = await this.rawData.goPlus.getTokenSecurity();
        if (!goPlusSecurityData) {
            return null;
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
        ].filter((s): s is TokenSecurity => s !== null);

        return this.mergeTokenSecurity(securitySources);
    }


    private mergeTokenSecurity(securities: TokenSecurity[]): TokenSecurity {
        if (securities.length === 0) {
            // Return default TokenSecurity when no data available
            return {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: false,
            };
        }

        if (securities.length === 1) {
            return securities[0];
        }

        // Start with the first security as base
        const merged: TokenSecurity = { ...securities[0] };

        // Merge remaining securities
        for (let i = 1; i < securities.length; i++) {
            const security = securities[i];

            // Boolean fields: use OR logic (if any source says true, it's true)
            merged.isHoneypot = merged.isHoneypot || security.isHoneypot;
            merged.isMintable = merged.isMintable || security.isMintable;
            merged.isPausable = merged.isPausable || security.isPausable;
            merged.isFreezable = merged.isFreezable || security.isFreezable;
            merged.isLpTokenBurned = merged.isLpTokenBurned || security.isLpTokenBurned;
            merged.isRenounced = merged.isRenounced || security.isRenounced;

            // Optional boolean fields: use OR logic
            if (security.isBlacklist !== undefined) {
                merged.isBlacklist = (merged.isBlacklist || false) || security.isBlacklist;
            }
            if (security.transferFeeUpgradeable !== undefined) {
                merged.transferFeeUpgradeable = (merged.transferFeeUpgradeable || false) || security.transferFeeUpgradeable;
            }

            // Tax fields: use maximum value (worst case)
            if (security.buyTax !== undefined) {
                merged.buyTax = Math.max(merged.buyTax || 0, security.buyTax);
            }
            if (security.sellTax !== undefined) {
                merged.sellTax = Math.max(merged.sellTax || 0, security.sellTax);
            }
            if (security.transferTax !== undefined) {
                merged.transferTax = Math.max(merged.transferTax || 0, security.transferTax);
            }
            if (security.transferFee !== undefined) {
                merged.transferFee = Math.max(merged.transferFee || 0, security.transferFee);
            }
        }

        return merged;
    }
}
