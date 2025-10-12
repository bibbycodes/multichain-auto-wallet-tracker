import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenDataSource, TokenDataWithMarketCap } from "../../../models/token/types";
import { MoralisEvmTokenMetaData, MoralisSolanaTokenMetadata, MoralisSolanaTokenPrice, MoralisEvmTokenPrice, MoralisSolanaTokenPairResponseData } from "./types";

export class MoralisMapper {
    static chainIdToChain(chainId: ChainId): string {
        switch (chainId) {
            case ChainsMap.ethereum:
                return "eth";
            case ChainsMap.bsc:
                return "bsc";
            case ChainsMap.polygon:
                return "polygon";
            case ChainsMap.arbitrum:
                return "arbitrum";
            case ChainsMap.avalanche:
                return "avalanche";
            case ChainsMap.optimism:
                return "optimism";
            case ChainsMap.base:
                return "base";
            case ChainsMap.zksync:
                return "zksync";
            case ChainsMap.solana:
                return "solana";
            default:
                throw new Error(`Unsupported chain ID: ${chainId}`);
        }
    }

    static chainToChainId(chain: string): ChainId {
        switch (chain) {
            case "eth":
                return ChainsMap.ethereum;
            case "bsc":
                return ChainsMap.bsc;
            case "polygon":
                return ChainsMap.polygon;
            case "arbitrum":
                return ChainsMap.arbitrum;
            case "avalanche":
                return ChainsMap.avalanche;
            case "optimism":
                return ChainsMap.optimism;
            case "base":
                return ChainsMap.base;
            case "zksync":
                return ChainsMap.zksync;
            case "solana":
                return ChainsMap.solana;
            default:
                throw new Error(`Unsupported chain: ${chain}`);
        }
    }

    static getSupportedChains(): ChainId[] {
        return [
            ChainsMap.ethereum,
            ChainsMap.bsc,
            ChainsMap.polygon,
            ChainsMap.arbitrum,
            ChainsMap.avalanche,
            ChainsMap.optimism,
            ChainsMap.base,
            ChainsMap.zksync,
            ChainsMap.solana,
        ].filter(chainId => getInternallySupportedChainIds().includes(chainId))
    }

    static mapMoralisTokenToAutoTrackerToken(
        moralisToken: MoralisEvmTokenMetaData,
        tokenPrice: MoralisEvmTokenPrice,
        chainId: ChainId
    ): AutoTrackerToken {
        return new AutoTrackerToken({
            address: moralisToken.address,
            chainId,
            name: moralisToken.name,
            symbol: moralisToken.symbol,
            decimals: Number(moralisToken.decimals),
            totalSupply: Number(moralisToken.total_supply_formatted),
            socials: {
                twitter: moralisToken.links.twitter,
                telegram: moralisToken.links.telegram,
                discord: moralisToken.links.discord,
                website: moralisToken.links.website,
                reddit: moralisToken.links.reddit,
            },
            pairAddress: tokenPrice.pairAddress,
            description: moralisToken.description,
            creationTime: new Date(moralisToken.created_at),
            createdAt: new Date(moralisToken.created_at),
            updatedAt: new Date(moralisToken.created_at),
            dataSource: AutoTrackerTokenDataSource.MORALIS,
        });
    }

    static mapEvmTokenMetadataToTokenDataWithMarketCap(
        chainId: ChainId,
        tokenMetadata: MoralisEvmTokenMetaData, 
        tokenPrice: MoralisEvmTokenPrice
    ): TokenDataWithMarketCap {
        return {
            address: tokenMetadata.address,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            marketCap: Number(tokenMetadata.market_cap),
            chainId: chainId,
            decimals: Number(tokenMetadata.decimals),
            description: tokenMetadata.description,
            socials: {
                twitter: tokenMetadata.links.twitter,
                telegram: tokenMetadata.links.telegram,
                discord: tokenMetadata.links.discord,
                website: tokenMetadata.links.website,
                reddit: tokenMetadata.links.reddit,
                instagram: tokenMetadata.links.instagram,
            },
            totalSupply: Number(tokenMetadata.total_supply_formatted),
            pairAddress: tokenPrice.pairAddress,
            price: tokenPrice.usdPrice,
            liquidity: Number(tokenPrice.pairTotalLiquidityUsd),
            logoUrl: tokenMetadata.logo ?? tokenMetadata.thumbnail,
            dataSource: AutoTrackerTokenDataSource.MORALIS,
        }
    }

    static mapSolanaTokenMetadataToTokenDataWithMarketCap(
        tokenMetadata: MoralisSolanaTokenMetadata, 
        price: MoralisSolanaTokenPrice,
        pair: MoralisSolanaTokenPairResponseData
    ): TokenDataWithMarketCap {
        return {
            address: tokenMetadata.mint,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            marketCap: Number(tokenMetadata.fullyDilutedValue),
            totalSupply: Number(tokenMetadata.totalSupplyFormatted),
            chainId: ChainsMap.solana,
            decimals: Number(tokenMetadata.decimals),
            description: tokenMetadata.description,
            socials: {
                twitter: tokenMetadata.links.twitter,
                telegram: tokenMetadata.links.telegram,
                discord: tokenMetadata.links.discord,
                website: tokenMetadata.links.website,
                reddit: tokenMetadata.links.reddit,
            },
            price: price.usdPrice,
            liquidity: pair.liquidityUsd,
            pairAddress: pair.pairAddress,
            dataSource: AutoTrackerTokenDataSource.MORALIS,
        }
    }
}
