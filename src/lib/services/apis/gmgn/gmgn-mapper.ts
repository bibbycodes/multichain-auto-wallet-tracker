import { TokenDataSource } from "@prisma/client";
import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains";
import { getTwitterUrlFromUsername } from "../../../../utils/links";
import { SocialMedia } from "../../../models/socials/types";
import { AutoTrackerToken } from "../../../models/token";
import { TokenData, TokenDataWithMarketCap } from "../../../models/token/types";
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
    ): TokenData {
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
}