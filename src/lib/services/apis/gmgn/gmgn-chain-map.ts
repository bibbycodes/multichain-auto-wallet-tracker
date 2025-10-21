import { ChainId, ChainsMap } from "../../../../shared/chains";

/**
 * GmGn chain identifiers
 */
export type GmGnChain = "sol" | "eth" | "arb" | "avax" | "bsc" | "opt" | "polygon" | "base" | "zksync";

/**
 * Bidirectional mapping between internal ChainId and GmGn chain identifiers
 */
export const CHAIN_ID_TO_GMGN_CHAIN: Record<ChainId, GmGnChain> = {
    [ChainsMap.solana]: "sol",
    [ChainsMap.ethereum]: "eth",
    [ChainsMap.arbitrum]: "arb",
    [ChainsMap.avalanche]: "avax",
    [ChainsMap.bsc]: "bsc",
    [ChainsMap.optimism]: "opt",
    [ChainsMap.polygon]: "polygon",
    [ChainsMap.base]: "base",
    [ChainsMap.zksync]: "zksync",
};

export const GMGN_CHAIN_TO_CHAIN_ID = Object.entries(CHAIN_ID_TO_GMGN_CHAIN).reduce(
    (acc, [chainId, gmgnChain]) => {
        acc[gmgnChain] = chainId as ChainId;
        return acc;
    },
    {} as Record<GmGnChain, ChainId>
);

