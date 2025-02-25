export const ChainToId = {
  ethereum: 1,
  arbitrum: 42161,
  avalanche: 43114,
  bsc: 56,
  optimism: 10,
  polygon: 137,
  base: 8453,
  zksync: 324,
  solana: 'solana',
} as const

export type Chain = keyof typeof ChainToId
export type ChainId = typeof ChainToId[Chain]

export function getChainId(chain: Chain): number | string {
  return ChainToId[chain]
}

export function getActiveEVMChains(): Chain[] {
  const chains = Object.keys(ChainToId) as Chain[]
  return chains.filter((chain) => ChainToId[chain] !== null && typeof ChainToId[chain] === 'number')
}

export const getAllChainIds = (): ChainId[] => {
  return Object.values(ChainToId).filter((id) => id !== null) as ChainId[]
}

export const isEvmChain = (chain: Chain): boolean => {
  return getActiveEVMChains().includes(chain)
}
