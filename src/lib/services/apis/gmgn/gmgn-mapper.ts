import { TokenDataSource } from "@prisma/client";
import { GmGnEvmTokenSecurity, GmGnMultiWindowTokenInfo, GmGnSolanaTokenSecurity, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainId, getInternallySupportedChainIds } from "../../../../shared/chains";
import { MIN_BURN_RATIO } from "../../../../shared/constants";
import { getTwitterUrlFromUsername } from "../../../../utils/links";
import { isNullOrUndefined } from "../../../../utils/object";
import { SocialMedia } from "../../../models/socials/types";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenData, TokenDataWithMarketCap, TokenSecurity } from "../../../models/token/types";
import { isSolanaAddress } from "../../util/common";
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

    public static isHoneyPot(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean {
        return security.is_honeypot || 
               Number(security.honeypot) === 1 || 
               Number(security.can_not_sell) === 1 || 
               false;
    }

    public static isMintable(security: GmGnEvmTokenSecurity): boolean {
        return !security.is_renounced || security.renounced === 1;
    }

    public static isFreezable(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean {
        return !security.is_renounced ;
    }

    public static isSolanaFreezable(security: GmGnSolanaTokenSecurity): boolean {
        return !security.renounced_freeze_account || isNullOrUndefined(security.renounced_freeze_account) || Boolean(security.is_renounced);
    }

    public static isBurned(security: GmGnEvmTokenSecurity): boolean {
        const isLocked = security.lock_summary?.lock_detail?.reduce((acc: number, detail: any) => acc + Number(detail.percent), 0) > 0.9;
        const burnRatio = Number(security.burn_ratio);
        return burnRatio > MIN_BURN_RATIO || isLocked;
    }

    public static isSolanaBurned(security: GmGnSolanaTokenSecurity): boolean {
        return Number(security.burn_ratio) > MIN_BURN_RATIO || security.burn_status === "burned";
    }

    public static isPausable(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean {
        return !security.is_renounced || security.renounced === 1;
    }

    public static isRenounced(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean {
        return security.is_renounced || security.renounced === 1;
    }

    public static extractBlacklistStatus(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): boolean {
        return security.is_blacklist ?? Number(security.blacklist) === 1;
    }

    public static extractBuyTax(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): number {
        return Number(security.buy_tax);
    }

    public static extractSellTax(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): number {
        return Number(security.sell_tax);
    }

    public static extractTokenSecurityFromEvm(security: GmGnEvmTokenSecurity): TokenSecurity {
        return {
            isHoneypot: this.isHoneyPot(security),
            isMintable: this.isMintable(security),
            isLpTokenBurned: this.isBurned(security),
            isPausable: this.isPausable(security),
            isFreezable: this.isFreezable(security),
            isRenounced: this.isRenounced(security),
            buyTax: this.extractBuyTax(security),
            sellTax: this.extractSellTax(security),
            isBlacklist: this.extractBlacklistStatus(security),
        };
    }

    /**
     * Extract TokenSecurity from GmGn Solana token security data
     */
    public static extractTokenSecurityFromSolana(security: GmGnSolanaTokenSecurity): TokenSecurity {
        return {
            isHoneypot: this.isHoneyPot(security),
            isMintable: !security.renounced_mint, // If mint is not renounced, it's mintable
            isLpTokenBurned: this.isSolanaBurned(security),
            isPausable: this.isPausable(security),
            isFreezable: this.isFreezable(security),
            isRenounced: this.isRenounced(security),
            buyTax: this.extractBuyTax(security),
            sellTax: this.extractSellTax(security),
            isBlacklist: this.extractBlacklistStatus(security),
        };
    }

    /**
     * Extract TokenSecurity from GmGn token security data (handles both EVM and Solana)
     */
    public static extractTokenSecurity(security: GmGnEvmTokenSecurity | GmGnSolanaTokenSecurity): TokenSecurity {
        // Check if it's Solana security data by checking for Solana-specific fields
        if (isSolanaAddress(security.address)) {
            return this.extractTokenSecurityFromSolana(security as GmGnSolanaTokenSecurity);
        } else {
            return this.extractTokenSecurityFromEvm(security as GmGnEvmTokenSecurity);
        }
    }
}