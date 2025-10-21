import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains"

export class ChainBaseMapper {
    static getSupportedChains(): ChainId[] {
        return [
            ChainsMap.ethereum,
            ChainsMap.polygon,
            ChainsMap.bsc,
            ChainsMap.avalanche,
            ChainsMap.arbitrum,
            ChainsMap.optimism,
            ChainsMap.base,
            ChainsMap.zksync,
        ].filter(chainId => getInternallySupportedChainIds().includes(chainId))
    }

    static chainIdToChain(chainId: ChainId): ChainId {
        return chainId
    }
}