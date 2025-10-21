import { ChainId, ChainsMap } from "../../../../shared/chains";

/**
 * Moralis chain identifiers
 */
export type MoralisChain = "eth" | "bsc" | "polygon" | "arbitrum" | "avalanche" | "optimism" | "base" | "zksync" | "solana";

/**
 * Bidirectional mapping between internal ChainId and Moralis chain identifiers
 */
export const CHAIN_ID_TO_MORALIS_CHAIN: Record<ChainId, MoralisChain> = {
    [ChainsMap.ethereum]: "eth",
    [ChainsMap.bsc]: "bsc",
    [ChainsMap.polygon]: "polygon",
    [ChainsMap.arbitrum]: "arbitrum",
    [ChainsMap.avalanche]: "avalanche",
    [ChainsMap.optimism]: "optimism",
    [ChainsMap.base]: "base",
    [ChainsMap.zksync]: "zksync",
    [ChainsMap.solana]: "solana",
};

export const MORALIS_CHAIN_TO_CHAIN_ID = Object.entries(CHAIN_ID_TO_MORALIS_CHAIN).reduce(
    (acc, [chainId, moralisChain]) => {
        acc[moralisChain] = chainId as ChainId;
        return acc;
    },
    {} as Record<MoralisChain, ChainId>
);

