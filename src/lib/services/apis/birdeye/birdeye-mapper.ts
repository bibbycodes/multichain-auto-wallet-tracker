import { ChainId, getInternallySupportedChainIds } from "../../../../shared/chains";
import { ChainsMap } from "../../../../shared/chains";
import { TokenData, AutoTrackerTokenDataSource, TokenDataWithMarketCap } from "../../../models/token/types";
import { BirdeyeChain } from "./client/index";
import { BirdTokenEyeOverview, BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from "./client/types";

export class BirdeyeMapper {
    static chainIdToChain(chainId: ChainId): BirdeyeChain {
        switch (chainId) {
            case ChainsMap.ethereum:
                return "ethereum";
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

    static chainToChainId(chain: BirdeyeChain): ChainId {
        switch (chain) {
            case "ethereum":
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

    static mapTokenOverviewToTokenDataWithMarketCap(
        tokenAddress: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): TokenDataWithMarketCap {
        return {
            address: tokenAddress,
            name: tokenOverview.name,
            symbol: tokenOverview.symbol,
            marketCap: tokenOverview.mc ?? tokenOverview.marketCap ?? tokenOverview.fdv,
            chainId: chainId,
            decimals: tokenOverview.decimals,
            totalSupply: tokenOverview.supply ?? tokenOverview.circulatingSupply ?? tokenOverview.totalSuply,
            socials: {
                twitter: tokenOverview.extensions?.twitter ?? undefined,
                telegram: tokenOverview.extensions?.telegram ?? undefined,
                discord: tokenOverview.extensions?.discord ?? undefined,
                website: tokenOverview.extensions?.website ?? undefined,
                reddit: undefined,
                instagram: undefined,
            },
            createdBy: tokenSecurity.creatorAddress,
            pairAddress: pairAddress,
            price: tokenOverview.price,
            liquidity: tokenOverview.liquidity,
            logoUrl: tokenOverview.logoURI,
            description: tokenOverview.extensions?.description ?? undefined,
            dataSource: AutoTrackerTokenDataSource.BIRDEYE,
        }
    }

    static mapTokenMetadataToTokenData(
        tokenAddress: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): TokenData {
        return {
            address: tokenAddress,
            name: tokenOverview.name,
            symbol: tokenOverview.symbol,
            chainId: chainId,
            decimals: tokenOverview.decimals,
            totalSupply: tokenOverview.supply ?? tokenOverview.circulatingSupply ?? tokenOverview.totalSuply,
            socials: {
                twitter: tokenOverview.extensions?.twitter ?? undefined,
                telegram: tokenOverview.extensions?.telegram ?? undefined,
                discord: tokenOverview.extensions?.discord ?? undefined,
                website: tokenOverview.extensions?.website ?? undefined,
                reddit: undefined,
                instagram: undefined,
            },
            pairAddress: pairAddress,
            logoUrl: tokenOverview.logoURI,
            description: tokenOverview.extensions?.description ?? undefined,
            createdBy: tokenSecurity.creatorAddress,
            dataSource: AutoTrackerTokenDataSource.BIRDEYE,
        }
    }
}