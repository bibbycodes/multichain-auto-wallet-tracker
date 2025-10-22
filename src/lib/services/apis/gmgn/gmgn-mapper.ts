import { TokenDataSource } from "@prisma/client";
import { GmGnEvmTokenSecurity, GmGnMultiWindowTokenInfo, GmGnSolanaTokenSecurity, GmGnTokenHolder, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainFactory } from "../../../chains/chain-factory";
import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains";
import { MIN_BURN_RATIO } from "../../../../shared/constants";
import { getTwitterUrlFromUsername } from "../../../../utils/links";
import { isNullOrUndefined, safeParseBoolean, safeParseNumber } from "../../../../utils/object";
import { SocialMedia } from "../../../models/socials/types";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenData, TokenDataWithMarketCap, TokenSecurity } from "../../../models/token/types";
import { isSolanaAddress } from "../../util/common";
import { getTwitterHandleUrl } from "../../telegram-message-formatter/utils";
import { TokenHolder } from "../../token-context/token-distribution/types";
import { CHAIN_ID_TO_GMGN_CHAIN, GMGN_CHAIN_TO_CHAIN_ID, GmGnChain } from "./gmgn-chain-map";

export class GmGnMapper {
    public static extractPrice(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return parseFloat(tokenInfo.price.price);
    }

    public static extractMarketCap(tokenInfo: GmGnMultiWindowTokenInfo): number {
        const circulatingSupply = parseFloat(tokenInfo.circulating_supply);
        const price = parseFloat(tokenInfo.price.price);
        return circulatingSupply * price;
    }

    public static extractLiquidity(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return parseFloat(tokenInfo.liquidity);
    }

    public static extractSupply(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return parseFloat(tokenInfo.circulating_supply);
    }

    public static extractDecimals(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return tokenInfo.decimals;
    }

    public static extractName(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.name;
    }

    public static extractSymbol(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.symbol;
    }

    public static extractLogoUrl(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.logo;
    }

    public static extractDescription(socials: GmGnTokenSocials): string | undefined {
        return socials.link.description ?? undefined;
    }

    public static extractSocials(socials: GmGnTokenSocials): SocialMedia {
        return {
            twitter: socials.link.twitter_username 
                ? getTwitterUrlFromUsername(socials.link.twitter_username) 
                : undefined,
            telegram: socials.link.telegram || undefined, 
            discord: socials.link.discord || undefined,
            website: socials.link.website || undefined,
            instagram: socials.link.instagram || undefined,
            facebook: socials.link.facebook || undefined,
            youtube: socials.link.youtube || undefined,
            tiktok: socials.link.tiktok || undefined,
            linkedin: socials.link.linkedin || undefined,
            github: socials.link.github || undefined,
            reddit: socials.link.reddit || undefined,
        };
    }

    public static extractCreatedBy(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.dev.creator_address;
    }

    static chainIdToChain(chainId: ChainId): GmGnChain {
        const chain = CHAIN_ID_TO_GMGN_CHAIN[chainId];
        if (!chain) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }
        return chain;
    }

    static chainToChainId(chain: GmGnChain): ChainId {
        return GMGN_CHAIN_TO_CHAIN_ID[chain];
    }

    static getSupportedChains(): ChainId[] {
        return (Object.keys(CHAIN_ID_TO_GMGN_CHAIN) as ChainId[])
            .filter(chainId => getInternallySupportedChainIds().includes(chainId));
    }

    private static buildTokenData(
        gmGnToken: GmGnMultiWindowTokenInfo,
        gmGnSocials: GmGnTokenSocials,
        chainId: ChainId
    ): AutoTrackerTokenData {
        return {
            address: gmGnToken.address,
            chainId,
            name: this.extractName(gmGnToken),
            symbol: this.extractSymbol(gmGnToken),
            decimals: this.extractDecimals(gmGnToken),
            totalSupply: Number(gmGnToken.total_supply),
            socials: this.extractSocials(gmGnSocials),
            pairAddress: gmGnToken.biggest_pool_address,
            description: this.extractDescription(gmGnSocials),
            logoUrl: this.extractLogoUrl(gmGnToken),
            creationTime: new Date(gmGnToken.creation_timestamp * 1000),
            createdBy: this.extractCreatedBy(gmGnToken),
            dataSource: TokenDataSource.GMGN,
        };
    }

    static mapGmGnTokenToTokenDataWithMarketCap(
        gmGnToken: GmGnMultiWindowTokenInfo,
        gmGnSocials: GmGnTokenSocials,
        chainId: ChainId
    ): TokenDataWithMarketCap {
        const baseData = this.buildTokenData(gmGnToken, gmGnSocials, chainId);
        return {
            ...baseData,
            price: this.extractPrice(gmGnToken),
            marketCap: this.extractMarketCap(gmGnToken),
            liquidity: this.extractLiquidity(gmGnToken),
        };
    }

    static mapGmGnTokenToAutoTrackerToken(
        gmGnToken: GmGnMultiWindowTokenInfo,
        gmGnSocials: GmGnTokenSocials,
        chainId: ChainId
    ): AutoTrackerToken {
        const tokenData = this.buildTokenData(gmGnToken, gmGnSocials, chainId);
        return new AutoTrackerToken(tokenData);
    }

    public static isHoneyPot(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean | undefined {
        try {
            const isHoneypot = safeParseBoolean(security.is_honeypot);
            const honeypot = safeParseNumber(security.honeypot);
            const canNotSell = safeParseNumber(security.can_not_sell);
            
            if (isHoneypot !== undefined || honeypot !== undefined || canNotSell !== undefined) {
                return Boolean(isHoneypot || honeypot === 1 || canNotSell === 1);
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    public static isMintable(security: GmGnEvmTokenSecurity): boolean | undefined {
        const isRenounced = this.isRenounced(security);
        return isRenounced !== undefined ? !isRenounced : undefined;
    }

    public static isFreezable(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean | undefined {
        const isRenounced = this.isRenounced(security);
        return isRenounced !== undefined ? !isRenounced : undefined;
    }

    public static isSolanaFreezable(security: GmGnSolanaTokenSecurity): boolean | undefined {
        try {
            if (security.renounced_freeze_account !== undefined) {
                return !security.renounced_freeze_account;
            }
            return safeParseBoolean(security.is_renounced);
        } catch {
            return undefined;
        }
    }

    public static isBurned(security: GmGnEvmTokenSecurity): boolean | undefined {
        try {
            let isLocked = false;
            if (security.lock_summary?.lock_detail && Array.isArray(security.lock_summary.lock_detail)) {
                const lockedRatio = security.lock_summary.lock_detail.reduce((acc: number, detail: any) => {
                    const percent = safeParseNumber(detail.percent);
                    return acc + (percent || 0);
                }, 0);
                isLocked = lockedRatio > 0.9;
            }
            
            const burnRatio = safeParseNumber(security.burn_ratio);
            if (burnRatio !== undefined || isLocked) {
                return (burnRatio || 0) > MIN_BURN_RATIO || isLocked;
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    public static isSolanaBurned(security: GmGnSolanaTokenSecurity): boolean | undefined {
        try {
            const burnRatio = safeParseNumber(security.burn_ratio);
            if (burnRatio !== undefined) {
                return burnRatio > MIN_BURN_RATIO || security.burn_status === "burned";
            }
            if (security.burn_status !== undefined) {
                return security.burn_status === "burned";
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    public static isPausable(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean | undefined {
        const isRenounced = this.isRenounced(security);
        return isRenounced !== undefined ? !isRenounced : undefined;
    }

    public static isRenounced(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean | undefined {
        try {
            const isRenounced = safeParseBoolean(security.is_renounced);
            const renounced = safeParseNumber(security.renounced);
            
            if (isRenounced !== undefined) return isRenounced;
            if (renounced !== undefined) return renounced === 1;
            return undefined;
        } catch {
            return undefined;
        }
    }

    public static isBlackList(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean | undefined {
        try {
            if (security.is_blacklist !== undefined && security.is_blacklist !== null) {
                return safeParseBoolean(security.is_blacklist);
            }
            const blacklist = safeParseNumber(security.blacklist);
            if (blacklist !== undefined) {
                return blacklist === 1;
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    public static extractBuyTax(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): number | undefined {
        return safeParseNumber(security.buy_tax);
    }

    public static extractSellTax(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): number | undefined {
        return safeParseNumber(security.sell_tax);
    }

    /**
     * Helper to build partial TokenSecurity result from extracted values
     * Only includes fields that are not undefined
     */
    private static buildPartialTokenSecurity(fields: {
        isHoneypot?: boolean;
        isMintable?: boolean;
        isLpTokenBurned?: boolean;
        isPausable?: boolean;
        isFreezable?: boolean;
        isRenounced?: boolean;
        buyTax?: number;
        sellTax?: number;
        isBlacklist?: boolean;
    }): Partial<TokenSecurity> {
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
        
        return result;
    }

    /**
     * Extract TokenSecurity from GmGn EVM token security data
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurityFromEvm(security: GmGnEvmTokenSecurity): Partial<TokenSecurity> {
        return this.buildPartialTokenSecurity({
            isHoneypot: this.isHoneyPot(security),
            isMintable: this.isMintable(security),
            isLpTokenBurned: this.isBurned(security),
            isPausable: this.isPausable(security),
            isFreezable: this.isFreezable(security),
            isRenounced: this.isRenounced(security),
            buyTax: this.extractBuyTax(security),
            sellTax: this.extractSellTax(security),
            isBlacklist: this.isBlackList(security),
        });
    }

    /**
     * Extract TokenSecurity from GmGn Solana token security data
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurityFromSolana(security: GmGnSolanaTokenSecurity): Partial<TokenSecurity> {
        return this.buildPartialTokenSecurity({
            isHoneypot: this.isHoneyPot(security),
            isMintable: security.renounced_mint !== undefined ? !security.renounced_mint : undefined,
            isLpTokenBurned: this.isSolanaBurned(security),
            isPausable: this.isPausable(security),
            isFreezable: this.isFreezable(security),
            isRenounced: this.isRenounced(security),
            buyTax: this.extractBuyTax(security),
            sellTax: this.extractSellTax(security),
            isBlacklist: this.isBlackList(security),
        });
    }

    /**
     * Extract TokenSecurity from GmGn token security data (handles both EVM and Solana)
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurity(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): Partial<TokenSecurity> {
        // Check if it's Solana security data by checking for Solana-specific fields
        if (isSolanaAddress(security.address)) {
            return this.extractTokenSecurityFromSolana(security as GmGnSolanaTokenSecurity);
        } else {
            return this.extractTokenSecurityFromEvm(security as GmGnEvmTokenSecurity);
        }
    }


    public static isPool(gmGnTokenHolder: GmGnTokenHolder, chainId: ChainId): boolean {
        const chain = ChainFactory.getChain(chainId);
        if (chain.isPoolOrLiquidityAddress(gmGnTokenHolder.address)) {
            return true;
        }
        if (!gmGnTokenHolder.addr_type) {
            return false;
        }
        return Number(gmGnTokenHolder.addr_type) === 2;
    }

    /**
     * Check if a holder should be excluded from analysis
     * Excludes pools, burn addresses, and other non-meaningful holders
     * Delegates to chain-specific logic via ChainFactory
     * @param holder - The holder to check
     * @param chainId - Optional chain ID (defaults to BSC)
     */
    public static shouldExcludeHolder(
        holder: { address: string; isPool?: boolean; percentage?: number },
        chainId: ChainId = ChainsMap.bsc
    ): boolean {
        try {
            const chain = ChainFactory.getChain(chainId);
            
            // Check if it's a burn address using chain method
            if (chain.isBurnAddress(holder.address)) {
                return true;
            }
        } catch (error) {
            // Fallback to common burn addresses if chain not supported
            const lowerAddress = holder.address.toLowerCase();
            const commonBurnAddresses = [
                '0x0000000000000000000000000000000000000000',
                '0x000000000000000000000000000000000000dead',
            ];
            if (commonBurnAddresses.includes(lowerAddress)) {
                return true;
            }
        }
        
        // Exclude pools
        if (holder.isPool) {
            return true;
        }
        
        return false;
    }

    /**
     * Parse GmGn top holders into TokenHolder format
     * Filters out pools and burn addresses
     * @param holders - Array of GmGn token holders
     * @param tokenSupply - Total token supply
     * @param tokenCreator - Token creator address
     * @param chainId - Optional chain ID (defaults to BSC)
     */
    public static parseTopHolders(
        holders: GmGnTokenHolder[],
        tokenSupply: number,
        tokenCreator: string,
        chainId: ChainId = ChainsMap.bsc
    ): TokenHolder[] {
        const tokenHolders = holders.map(holder => {
            const percentage = Number(((Number(holder.amount_cur) / tokenSupply) * 100).toFixed(2));
            const dollarValue = Number(holder.usd_value);
            const isPool = this.isPool(holder, chainId);
            const isCreator = holder.address.toLowerCase() === tokenCreator.toLowerCase();
            
            const tokenHolder: TokenHolder = {
                address: holder.address,
                amount: Number(holder.amount_cur),
                percentage: percentage,
                dollarValue: dollarValue,
                isKOL: !!(holder.twitter_username || holder.twitter_name),
                isWhale: false, // This should be determined by comparing to other holdings
                significantHolderIn: [], // This should be populated separately
                isPool: isPool,
                isCreator: isCreator,
            };
            
            // Add socials if available
            if (holder.twitter_username) {
                tokenHolder.socials = {
                    twitter: getTwitterHandleUrl(holder.name || holder.twitter_username)
                };
            }
            
            return tokenHolder;
        });
        
        return tokenHolders.filter(holder => !this.shouldExcludeHolder(holder, chainId));
    }
}