import { ChainId, ChainsMap } from "../../shared/chains";
import { BSC_CONFIG } from "./chain-configs/bsc/bsc";
import { EvmChain } from "./evm";

export class ChainFactory {
    private static instances: Map<ChainId, EvmChain> = new Map()

    static getChain(chainId: ChainId): EvmChain {
        if (this.instances.has(chainId)) {
            return this.instances.get(chainId)!
        }

        switch (chainId) {
            case ChainsMap.bsc:
                return new EvmChain(BSC_CONFIG)
            default:
                throw new Error(`Unsupported chain ID: ${chainId}`)
        }
    }
}