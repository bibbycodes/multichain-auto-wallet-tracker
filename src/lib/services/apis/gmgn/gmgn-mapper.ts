import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenDataSource, TokenDataWithMarketCap } from "../../../models/token/types";
import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from "python-proxy-scraper-client";
import { getTwitterUrlFromUsername } from "../../../../utils/links";
import { SocialMedia } from "../../../models/socials/types";

export class GmGnMapper {
    /**
     * Static helper functions for extracting data from GmGn structures
     */
    static extractPrice(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return parseFloat(tokenInfo.price.price);
    }

    static extractMarketCap(tokenInfo: GmGnMultiWindowTokenInfo): number {
        const circulatingSupply = parseFloat(tokenInfo.circulating_supply);
        const price = parseFloat(tokenInfo.price.price);
        return circulatingSupply * price;
    }

    static extractLiquidity(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return parseFloat(tokenInfo.liquidity);
    }

    static extractSupply(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return parseFloat(tokenInfo.circulating_supply);
    }

    static extractDecimals(tokenInfo: GmGnMultiWindowTokenInfo): number {
        return tokenInfo.decimals;
    }

    static extractName(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.name;
    }

    static extractSymbol(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.symbol;
    }

    static extractLogoUrl(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.logo;
    }

    static extractDescription(socials: GmGnTokenSocials): string | undefined {
        return socials.link.description ?? undefined;
    }

    static extractSocials(socials: GmGnTokenSocials): SocialMedia {
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

    static extractCreatedBy(tokenInfo: GmGnMultiWindowTokenInfo): string {
        return tokenInfo.dev.creator_address;
    }

    static chainIdToChain(chainId: ChainId): string {
        switch (chainId) {
            case 'solana': return 'sol';
            case '1': return 'eth';
            case '42161': return 'arb';
            case '43114': return 'avax';
            case '56': return 'bsc';
            case '10': return 'opt';
            case '137': return 'polygon';
            case '8453': return 'base';
            case '324': return 'zksync';
            default: throw new Error(`Unsupported chainId: ${chainId}`);
        }
    }

    static chainToChainId(chain: string): ChainId {
        switch (chain) {
            case 'sol': return ChainsMap.solana;
            case 'eth': return ChainsMap.ethereum;
            case 'bsc': return ChainsMap.bsc;
            case 'base': return ChainsMap.base;
            default: throw new Error(`Unsupported chain: ${chain}`);
        }
    }

    static getSupportedChains(): ChainId[] {
        return [
            ChainsMap.solana,
            ChainsMap.ethereum,
            ChainsMap.bsc,
            ChainsMap.base,
        ].filter(chainId => getInternallySupportedChainIds().includes(chainId))
    }

    static mapGmGnTokenToAutoTrackerToken(
        gmGnToken: GmGnMultiWindowTokenInfo,
        gmGnSocials: GmGnTokenSocials,
        chainId: ChainId
    ): AutoTrackerToken {
        return new AutoTrackerToken({
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
            createdAt: new Date(gmGnToken.creation_timestamp * 1000),
            updatedAt: new Date(),
            dataSource: AutoTrackerTokenDataSource.GMGN,
        });
    }

    static mapGmGnTokenToTokenDataWithMarketCap(
        gmGnToken: GmGnMultiWindowTokenInfo,
        gmGnSocials: GmGnTokenSocials,
        chainId: ChainId
    ): TokenDataWithMarketCap {
        return {
            address: gmGnToken.address,
            chainId,
            name: this.extractName(gmGnToken),
            symbol: this.extractSymbol(gmGnToken),
            decimals: this.extractDecimals(gmGnToken),
            creationTime: new Date(gmGnToken.creation_timestamp * 1000),
            totalSupply: this.extractSupply(gmGnToken),
            socials: this.extractSocials(gmGnSocials),
            pairAddress: gmGnToken.biggest_pool_address,
            description: this.extractDescription(gmGnSocials),
            logoUrl: this.extractLogoUrl(gmGnToken),
            price: this.extractPrice(gmGnToken),
            marketCap: this.extractMarketCap(gmGnToken),
            liquidity: this.extractLiquidity(gmGnToken),
            createdBy: this.extractCreatedBy(gmGnToken),
            dataSource: AutoTrackerTokenDataSource.GMGN,
        };
    }
}