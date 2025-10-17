import { ChainId } from "../../../../shared/chains";
import { CHAIN_ID_TO_DEXSCREENER_CHAIN, DEXSCREENER_CHAIN_TO_CHAIN_ID, DexscreenerChain } from "./dexscreener-chain-map";

export class DexscreenerMapper {
    static chainIdToChain(chainId: ChainId): DexscreenerChain {
        const chain = CHAIN_ID_TO_DEXSCREENER_CHAIN[chainId];
        if (!chain) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }
        return chain;
    }

    static chainToChainId(chain: DexscreenerChain): ChainId {
        const chainId = DEXSCREENER_CHAIN_TO_CHAIN_ID[chain];
        if (!chainId) {
            throw new Error(`Unsupported chain: ${chain}`);
        }
        return chainId;
    }
}