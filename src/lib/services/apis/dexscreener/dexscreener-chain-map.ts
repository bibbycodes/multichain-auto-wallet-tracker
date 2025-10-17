import { ChainsMap } from "../../../../shared/chains";
import { ChainId } from "../../../../shared/chains";

export type DexscreenerChain = "solana" | "ethereum" | "arbitrum" | "avalanche" | "bsc" | "optimism" | "polygon" | "base" | "zksync";

export const CHAIN_ID_TO_DEXSCREENER_CHAIN: Record<ChainId, DexscreenerChain> = {
    [ChainsMap.solana]: "solana",
    [ChainsMap.ethereum]: "ethereum",
    [ChainsMap.arbitrum]: "arbitrum",
    [ChainsMap.avalanche]: "avalanche",
    [ChainsMap.bsc]: "bsc",
    [ChainsMap.optimism]: "optimism",
    [ChainsMap.polygon]: "polygon",
    [ChainsMap.base]: "base",
    [ChainsMap.zksync]: "zksync",
};

export const DEXSCREENER_CHAIN_TO_CHAIN_ID: Record<DexscreenerChain, ChainId> = Object.entries(CHAIN_ID_TO_DEXSCREENER_CHAIN).reduce(
    (acc, [chainId, dexscreenerChain]) => {
        acc[dexscreenerChain] = chainId as ChainId;
        return acc;
    },
    {} as Record<DexscreenerChain, ChainId>
);
