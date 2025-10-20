import { ChainId, ChainsMap } from "../../../../shared/chains"
export type GeckoTerminalChain = 'eth' | 'bsc' | 'base' | 'solana' | 'arbitrum' | 'avax' | 'optimism' | 'polygon_pos' | 'zksync';
export const CHAIN_ID_TO_GECKO_TERMINAL_CHAIN_ID: Record<ChainId, GeckoTerminalChain> = {
    [ChainsMap.ethereum]: 'eth',    
    [ChainsMap.bsc]: 'bsc',
    [ChainsMap.base]: 'base',
    [ChainsMap.solana]: 'solana',
    [ChainsMap.arbitrum]: 'arbitrum',
    [ChainsMap.avalanche]: 'avax',
    [ChainsMap.optimism]: 'optimism',
    [ChainsMap.polygon]: 'polygon_pos',
    [ChainsMap.zksync]: 'zksync',
}

export const GECKO_TERMINAL_CHAIN_ID_TO_CHAIN_ID: Record<GeckoTerminalChain, ChainId> = {
    'eth': ChainsMap.ethereum,
    'bsc': ChainsMap.bsc,
    'base': ChainsMap.base,
    'solana': ChainsMap.solana,
    'arbitrum': ChainsMap.arbitrum,
    'avax': ChainsMap.avalanche,
    'optimism': ChainsMap.optimism,
    'polygon_pos': ChainsMap.polygon,
    'zksync': ChainsMap.zksync,
}