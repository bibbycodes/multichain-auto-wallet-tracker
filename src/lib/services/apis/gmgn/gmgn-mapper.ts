import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenDataSource, TokenDataWithMarketCap } from "../../../models/token/types";
import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from "python-proxy-scraper-client";
import { getTwitterUrlFromUsername } from "../../../../utils/links";

export class GmGnMapper {
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
            name: gmGnToken.name,
            symbol: gmGnToken.symbol,
            decimals: gmGnToken.decimals,
            totalSupply: Number(gmGnToken.total_supply),
            socials: {
                telegram: gmGnSocials.link.telegram,
                twitter: gmGnSocials.link.twitter_username 
                    ? getTwitterUrlFromUsername(gmGnSocials.link.twitter_username) 
                    : undefined,
                website: gmGnSocials.link.website,
                instagram: gmGnSocials.link.instagram,
                facebook: gmGnSocials.link.facebook,
                youtube: gmGnSocials.link.youtube,
                tiktok: gmGnSocials.link.tiktok,
                linkedin: gmGnSocials.link.linkedin,
                github: gmGnSocials.link.github,
                reddit: gmGnSocials.link.reddit,
            },
            pairAddress: gmGnToken.biggest_pool_address,
            description: gmGnSocials.link.description,
            logoUrl: gmGnToken.logo,
            creationTime: new Date(gmGnToken.creation_timestamp * 1000),
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
        const circulatingSupply = parseFloat(gmGnToken.circulating_supply);
        const price = parseFloat(gmGnToken.price.price);
        const marketCap = circulatingSupply * price;

        return {
            address: gmGnToken.address,
            chainId,
            name: gmGnToken.name,
            symbol: gmGnToken.symbol,
            decimals: gmGnToken.decimals,
            totalSupply: circulatingSupply,
            socials: {
                twitter: gmGnSocials.link.twitter_username 
                    ? getTwitterUrlFromUsername(gmGnSocials.link.twitter_username) 
                    : undefined,
                telegram: gmGnSocials.link.telegram,
                website: gmGnSocials.link.website,
                instagram: gmGnSocials.link.instagram,
                facebook: gmGnSocials.link.facebook,
                youtube: gmGnSocials.link.youtube,
                tiktok: gmGnSocials.link.tiktok,
                linkedin: gmGnSocials.link.linkedin,
                github: gmGnSocials.link.github,
                reddit: gmGnSocials.link.reddit,
            },
            pairAddress: gmGnToken.biggest_pool_address,
            description: gmGnSocials.link.description,
            logoUrl: gmGnToken.logo,
            price,
            marketCap,
            liquidity: Number(gmGnToken.liquidity),
            dataSource: AutoTrackerTokenDataSource.GMGN,
        };
    }
}