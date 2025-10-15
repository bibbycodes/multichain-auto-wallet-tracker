import { ChainId, ChainsMap } from "../../../../shared/chains";
import { BirdeyeChain } from "./client/index";

/**
 * Bidirectional mapping between internal ChainId and Birdeye chain identifiers
 */
export const CHAIN_ID_TO_BIRDEYE_CHAIN: Record<ChainId, BirdeyeChain> = {
    [ChainsMap.ethereum]: "ethereum",
    [ChainsMap.bsc]: "bsc",
    [ChainsMap.polygon]: "polygon",
    [ChainsMap.arbitrum]: "arbitrum",
    [ChainsMap.avalanche]: "avalanche",
    [ChainsMap.optimism]: "optimism",
    [ChainsMap.base]: "base",
    [ChainsMap.zksync]: "zksync",
    [ChainsMap.solana]: "solana",
};

export const BIRDEYE_CHAIN_TO_CHAIN_ID = Object.entries(CHAIN_ID_TO_BIRDEYE_CHAIN).reduce(
    (acc, [chainId, birdeyeChain]) => {
        acc[birdeyeChain] = chainId as ChainId;
        return acc;
    },
    {} as Record<BirdeyeChain, ChainId>
);
