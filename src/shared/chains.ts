export const ChainsMap = {
  ethereum: '1',
  arbitrum: '42161',
  avalanche: '43114',
  bsc: '56',
  optimism: '10',
  polygon: '137',
  base: '8453',
  zksync: '324',
  solana: 'solana',
} as const

export type Chain = keyof typeof ChainsMap
export type ChainId = typeof ChainsMap[Chain]

export function getChainId(chain: Chain): ChainId {
  return ChainsMap[chain]
}

export function getActiveEVMChains(): Chain[] {
  const chains = Object.keys(ChainsMap) as Chain[]
  return chains.filter((chain) => ChainsMap[chain] !== null && ChainsMap[chain] !== 'solana')
}

export function getActiveEVMChainIds(): ChainId[] {
  return getActiveEVMChains().map((chain) => getChainId(chain))
}

export const getAllChainIds = (): ChainId[] => {
  return Object.values(ChainsMap).filter((id) => id !== null) as ChainId[]
}

export const isEvmChain = (chain: Chain): boolean => {
  return getActiveEVMChains().includes(chain)
}

export const isEvmChainId = (chainId: ChainId): boolean => {
  return getActiveEVMChainIds().includes(chainId)
}

export const isSolanaChainId = (chainId: ChainId): boolean => {
  return chainId === 'solana'
}
