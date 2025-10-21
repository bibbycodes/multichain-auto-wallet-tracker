import { TokenDataSource } from "@prisma/client";
import { ChainId, getInternallySupportedChainIds } from "../../../../shared/chains";
import { safeParseBoolean, safeParseNumber } from "../../../../utils/object";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenData, TokenDataWithMarketCap, TokenSecurity } from "../../../models/token/types";
import { SocialMedia } from "../../../models/socials/types";
import { BirdeyeChain } from "./client/index";
import { BirdTokenEyeOverview, BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from "./client/types";
import { CHAIN_ID_TO_BIRDEYE_CHAIN, BIRDEYE_CHAIN_TO_CHAIN_ID } from "./birdeye-chain-map";

export class BirdeyeMapper {
    static chainIdToChain(chainId: ChainId): BirdeyeChain {
        const chain = CHAIN_ID_TO_BIRDEYE_CHAIN[chainId];
        if (!chain) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }
        return chain;
    }

    static chainToChainId(chain: BirdeyeChain): ChainId {
        return BIRDEYE_CHAIN_TO_CHAIN_ID[chain];
    }

    static getSupportedChains(): ChainId[] {
        return (Object.keys(CHAIN_ID_TO_BIRDEYE_CHAIN) as ChainId[])
            .filter(chainId => getInternallySupportedChainIds().includes(chainId));
    }

    /**
     * Static helper functions for extracting data from Birdeye structures
     */
    public static extractPrice(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.price;
    }

    public static extractMarketCap(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.mc ?? tokenOverview.marketCap ?? tokenOverview.fdv;
    }

    public static extractLiquidity(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.liquidity;
    }

    public static extractSupply(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.supply ?? tokenOverview.circulatingSupply ?? tokenOverview.totalSuply;
    }

    public static extractTotalSupply(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.supply ?? tokenOverview.circulatingSupply ?? tokenOverview.totalSuply;
    }

    public static extractDecimals(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.decimals;
    }

    public static extractName(tokenOverview: BirdTokenEyeOverview): string {
        return tokenOverview.name;
    }

    public static extractSymbol(tokenOverview: BirdTokenEyeOverview): string {
        return tokenOverview.symbol;
    }

    public static extractLogoUrl(tokenOverview: BirdTokenEyeOverview): string {
        return tokenOverview.logoURI;
    }

    public static extractDescription(tokenOverview: BirdTokenEyeOverview): string | undefined {
        return tokenOverview.extensions?.description;
    }

    public static extractSocials(tokenOverview: BirdTokenEyeOverview): SocialMedia {
        return {
            twitter: tokenOverview.extensions?.twitter || undefined,
            telegram: tokenOverview.extensions?.telegram || undefined,
            discord: tokenOverview.extensions?.discord || undefined,
            website: tokenOverview.extensions?.website || undefined,
        };
    }

    public static extractCreatedBy(tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity): string | undefined {
        return tokenSecurity.creatorAddress ?? undefined;
    }

    private static buildTokenData(
        address: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): AutoTrackerTokenData {
        return {
            address,
            name: this.extractName(tokenOverview),
            symbol: this.extractSymbol(tokenOverview),
            chainId,
            decimals: this.extractDecimals(tokenOverview),
            totalSupply: this.extractTotalSupply(tokenOverview),
            socials: this.extractSocials(tokenOverview),
            pairAddress,
            logoUrl: this.extractLogoUrl(tokenOverview),
            description: this.extractDescription(tokenOverview),
            createdBy: this.extractCreatedBy(tokenSecurity),
            dataSource: TokenDataSource.BIRDEYE,
        };
    }

    static mapTokenOverviewToTokenDataWithMarketCap(
        tokenAddress: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): TokenDataWithMarketCap {
        const baseData = this.buildTokenData(tokenAddress, chainId, tokenOverview, tokenSecurity, pairAddress);
        return {
            ...baseData,
            marketCap: this.extractMarketCap(tokenOverview),
            price: this.extractPrice(tokenOverview),
            liquidity: this.extractLiquidity(tokenOverview),
        };
    }

    static mapTokenMetadataToTokenData(
        tokenAddress: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): AutoTrackerTokenData {
        return this.buildTokenData(tokenAddress, chainId, tokenOverview, tokenSecurity, pairAddress);
    }

    public static mapBirdeyeTokenToAutoTrackerToken(
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string,
        chainId: ChainId
    ): AutoTrackerToken {
        const tokenData = this.buildTokenData(
            tokenOverview.address,
            chainId,
            tokenOverview,
            tokenSecurity,
            pairAddress
        );

        return new AutoTrackerToken(tokenData);
    }

    public static isHoneypot(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            const isHoneypot = safeParseBoolean(tokenSecurity.isHoneypot);
            const cannotSellAll = safeParseBoolean(tokenSecurity.cannotSellAll);
            const honeypotWithSameCreator = safeParseBoolean(tokenSecurity.honeypotWithSameCreator);
            
            // If we have at least one value, return the OR of all
            if (isHoneypot !== undefined || cannotSellAll !== undefined || honeypotWithSameCreator !== undefined) {
                return Boolean(isHoneypot || cannotSellAll || honeypotWithSameCreator);
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    public static isMintable(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            return safeParseBoolean(tokenSecurity.isMintable);
        } catch {
            return undefined;
        }
    }

    public static isLpBurned(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            const lpHolders = tokenSecurity.lpHolders;
            if (!lpHolders || !Array.isArray(lpHolders) || lpHolders.length === 0) {
                return undefined;
            }
            
            const lockedLpHolders = lpHolders.filter(lpHolder => 
                lpHolder && safeParseBoolean(lpHolder.is_locked)
            );
            
            const lockedRatio = lockedLpHolders.reduce((acc: number, lpHolder: any) => {
                const percent = safeParseNumber(lpHolder.percent);
                return acc + (percent || 0);
            }, 0);
            
            return lockedRatio > 0.9;
        } catch {
            return undefined;
        }
    }

    public static isPausable(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            return safeParseBoolean(tokenSecurity.transferPausable);
        } catch {
            return undefined;
        }
    }

    public static isFreezable(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            return safeParseBoolean(tokenSecurity.transferPausable);
        } catch {
            return undefined;
        }
    }

    public static isRenounced(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            if (tokenSecurity.ownerAddress === null || 
                tokenSecurity.ownerAddress === '0x0000000000000000000000000000000000000000') {
                return true;
            }
            if (tokenSecurity.ownerAddress === undefined) {
                return undefined;
            }
            return false;
        } catch {
            return undefined;
        }
    }

    public static extractBuyTax(tokenSecurity: BirdeyeEvmTokenSecurity): number | undefined {
        return safeParseNumber(tokenSecurity.buyTax);
    }

    public static extractSellTax(tokenSecurity: BirdeyeEvmTokenSecurity): number | undefined {
        return safeParseNumber(tokenSecurity.sellTax);
    }

    public static isBlacklisted(tokenSecurity: BirdeyeEvmTokenSecurity): boolean | undefined {
        try {
            if (typeof tokenSecurity.isBlacklisted === 'boolean') {
                return tokenSecurity.isBlacklisted;
            }
            return safeParseBoolean(tokenSecurity.isBlacklisted);
        } catch {
            return undefined;
        }
    }

    /**
     * Helper to build partial TokenSecurity result from extracted values
     * Only includes fields that are not undefined
     */
    private static buildPartialTokenSecurity(fields: Partial<TokenSecurity>): Partial<TokenSecurity> {
        const result: Partial<TokenSecurity> = {};
        
        if (fields.isHoneypot !== undefined) result.isHoneypot = fields.isHoneypot;
        if (fields.isMintable !== undefined) result.isMintable = fields.isMintable;
        if (fields.isLpTokenBurned !== undefined) result.isLpTokenBurned = fields.isLpTokenBurned;
        if (fields.isPausable !== undefined) result.isPausable = fields.isPausable;
        if (fields.isFreezable !== undefined) result.isFreezable = fields.isFreezable;
        if (fields.isRenounced !== undefined) result.isRenounced = fields.isRenounced;
        if (fields.buyTax !== undefined) result.buyTax = fields.buyTax;
        if (fields.sellTax !== undefined) result.sellTax = fields.sellTax;
        if (fields.isBlacklist !== undefined) result.isBlacklist = fields.isBlacklist;
        if (fields.transferFee !== undefined) result.transferFee = fields.transferFee;
        if (fields.transferTax !== undefined) result.transferTax = fields.transferTax;
        if (fields.transferFeeUpgradeable !== undefined) result.transferFeeUpgradeable = fields.transferFeeUpgradeable;
        
        return result;
    }

    /**
     * Extract TokenSecurity from Birdeye EVM token security data
     * Returns partial data - only fields that can be determined are included
     */
    // TODO, use chain specific burn addresses
    public static extractTokenSecurityFromEvm(tokenSecurity: BirdeyeEvmTokenSecurity): Partial<TokenSecurity> {
        return this.buildPartialTokenSecurity({
            isHoneypot: this.isHoneypot(tokenSecurity),
            isMintable: this.isMintable(tokenSecurity),
            isLpTokenBurned: this.isLpBurned(tokenSecurity),
            isPausable: this.isPausable(tokenSecurity),
            isFreezable: this.isFreezable(tokenSecurity),
            isRenounced: this.isRenounced(tokenSecurity),
            buyTax: this.extractBuyTax(tokenSecurity),
            sellTax: this.extractSellTax(tokenSecurity),
            isBlacklist: this.isBlacklisted(tokenSecurity),
        });
    }

    /**
     * Extract TokenSecurity from Birdeye Solana token security data
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurityFromSolana(tokenSecurity: BirdeyeSolanaTokenSecurity): Partial<TokenSecurity> {
        try {
            const isToken2022 = tokenSecurity.isToken2022
            const transferFeeEnable = tokenSecurity.transferFeeEnable
            let isTransferFeeUpgradeable = undefined

            if (!isToken2022) {
                isTransferFeeUpgradeable = false
            }

            if (isToken2022 && transferFeeEnable) {
                isTransferFeeUpgradeable = true
            }

            return this.buildPartialTokenSecurity({
                // Check for fake token or not true token
                isHoneypot: (tokenSecurity.fakeToken !== undefined || tokenSecurity.isTrueToken !== undefined)
                    ? Boolean(tokenSecurity.fakeToken) || tokenSecurity.isTrueToken === false
                    : undefined,
                
                // Birdeye Solana doesn't expose mint authority directly
                isMintable: false,
                
                // Solana LP data needs different calculation - not available
                isLpTokenBurned: false,
                
                // Not directly available for Solana
                isPausable: false,
                
                // Check freeze authority
                isFreezable: (tokenSecurity.freezeAuthority !== undefined || tokenSecurity.freezeable !== undefined)
                    ? (tokenSecurity.freezeAuthority !== null) || Boolean(tokenSecurity.freezeable)
                    : undefined,
                
                // Check if owner is renounced
                isRenounced: tokenSecurity.ownerAddress !== undefined 
                    ? tokenSecurity.ownerAddress === null
                    : undefined,
                
                // Token 2022 transfer fee
                transferFeeUpgradeable: isTransferFeeUpgradeable,
                isBlacklist: false,
            });
        } catch (error) {
            console.warn('Error extracting Solana token security:', error);
            return {};
        }
    }

    /**
     * Extract TokenSecurity from Birdeye token security data (handles both EVM and Solana)
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurity(tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity): Partial<TokenSecurity> {
        // Check if it's EVM security data by checking for EVM-specific fields
        if ('isHoneypot' in tokenSecurity) {
            return this.extractTokenSecurityFromEvm(tokenSecurity as BirdeyeEvmTokenSecurity);
        } else {
            return this.extractTokenSecurityFromSolana(tokenSecurity as BirdeyeSolanaTokenSecurity);
        }
    }
}