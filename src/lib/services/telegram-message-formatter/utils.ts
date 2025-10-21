import { ChainId, ChainsMap } from "../../../shared/chains"
import { BirdeyeMapper } from "../apis/birdeye/birdeye-mapper"
import { GmGnMapper } from "../apis/gmgn/gmgn-mapper"

export const getPhotonLink = (tokenAddress: string) => {
    return `https://photon.network/token/${tokenAddress}`
}

export const linkify = (url: string, text: string) => {
    return `<a href="${url}">${text}</a>`
}

export const getTwitterHandleUrl = (username: string) => {
    if (username.startsWith('http://') || username.startsWith('https://')) {
        return username
    }
    return `https://x.com/${username}`
}

export function generateDexScreenerUrl(pair: string | string): string {
    return `https://dexscreener.com/solana/${pair}`;
}

export function generateBirdeyeUrl(tokenAddress: string, chainId: ChainId): string {
    const birdeyeChainId = BirdeyeMapper.chainIdToChain(chainId)
    return `https://birdeye.so/${birdeyeChainId}/token/${tokenAddress}`;
}

export function generateGmgnUrl(tokenAddress: string, chainId: ChainId): string {
    const gmgnChainId = GmGnMapper.chainIdToChain(chainId)
    return `https://gmgn.ai/${gmgnChainId}/token/${tokenAddress}`
}

export function generateExplorerUrl(tokenAddress: string, chainId: ChainId): string {
    switch (chainId) {
        case ChainsMap.bsc:
            return `https://bscscan.com/token/${tokenAddress}`
        case ChainsMap.ethereum:
            return `https://etherscan.io/token/${tokenAddress}`
        case ChainsMap.polygon:
            return `https://polygonscan.com/token/${tokenAddress}`
        case ChainsMap.arbitrum:
            return `https://arbiscan.io/token/${tokenAddress}`
        case ChainsMap.avalanche:
            return `https://snowtrace.io/token/${tokenAddress}`
        case ChainsMap.optimism:
            return `https://optimistic.etherscan.io/token/${tokenAddress}`
        case ChainsMap.base:
            return `https://basescan.org/token/${tokenAddress}`
        case ChainsMap.zksync:
            return `https://zkscan.io/token/${tokenAddress}`
        case ChainsMap.solana:
            return `https://solscan.io/token/${tokenAddress}`
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`)
    }
}