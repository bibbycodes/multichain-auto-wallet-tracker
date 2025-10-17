import { ChainId } from "../../../../shared/chains"
import { AutoTrackerTokenData, TokenDataWithMarketCapAndRawData } from "../../../models/token/types"
import { RawDataData } from "../../raw-data/types"
import { BaseTokenFetcherService } from "../../tokens/token-fetcher-types"
import { BirdeyeMapper } from "./birdeye-mapper"
import { BirdEyeClient } from "./client/index"
import { BirdeyeEvmTokenSecurity, BirdeyeSearchResponse, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview, MarketsData, MarketsResponse } from "./client/types"

export class BirdEyeFetcherService extends BaseTokenFetcherService {
  constructor(private client: BirdEyeClient = new BirdEyeClient()) {
    super()
  }

  async fetchTokenDataWithMarketCapFromAddress(tokenAddress: string): Promise<TokenDataWithMarketCapAndRawData<RawDataData>> {
    const supportedChains = BirdeyeMapper.getSupportedChains()
    const tokenDataWithMarketCaps = await Promise.allSettled(supportedChains.map(chainId => this.fetchTokenWithMarketCap(tokenAddress, chainId)))
    const successfulResult = tokenDataWithMarketCaps.find((r): r is PromiseFulfilledResult<TokenDataWithMarketCapAndRawData<RawDataData>> => 
      r.status === 'fulfilled'
    )
    if (!successfulResult) {
      throw new Error(`No token data with market cap found for token address: ${tokenAddress}`)
    }
    return successfulResult.value
  }

  async getMarkets(tokenAddress: string, chainId: ChainId): Promise<MarketsData> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const marketsResponse = await this.client.getMarkets(tokenAddress, {
      chain,
      limit: 1,
      sortBy: 'liquidity',
      sortType: 'desc'
    })
    return marketsResponse.data
  }

  async fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<TokenDataWithMarketCapAndRawData<RawDataData>> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const  [
      tokenOverview,
      tokenSecurity
    ] = await Promise.all([
      this.client.getTokenOverview(tokenAddress, ['1h'], chain),
      this.client.getTokenSecurity(tokenAddress, chain)
    ])
    
    // Get markets to extract pair address - sorted by liquidity by default
    const marketsResponse = await this.client.getMarkets(tokenAddress, { 
      limit: 1, 
      chain,
      sortBy: 'liquidity',
      sortType: 'desc'
    })
    
    const pairAddress = marketsResponse.data?.items?.[0]?.address ?? ''
    
    const tokenData = BirdeyeMapper.mapTokenOverviewToTokenDataWithMarketCap(
      tokenAddress,
      chainId,
      tokenOverview,
      tokenSecurity.data,
      pairAddress
    )
    
    return {token: tokenData, rawData: {birdeye: {tokenOverview, tokenSecurity: tokenSecurity.data, markets: marketsResponse.data}}}
  }

  async getTokenOverview(tokenAddress: string, chainId: ChainId): Promise<BirdTokenEyeOverview> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const tokenOverview = await this.client.getTokenOverview(tokenAddress, ['1h'], chain)
    return tokenOverview
  }

  async getTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const tokenSecurity = await this.client.getTokenSecurity(tokenAddress, chain)
    return tokenSecurity.data
  }

  async fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<AutoTrackerTokenData> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const [tokenOverview, tokenSecurity] = await Promise.all([
      this.client.getTokenOverview(tokenAddress, ['1h'], chain),
      this.client.getTokenSecurity(tokenAddress, chain)
    ])
    return BirdeyeMapper.mapTokenMetadataToTokenData(tokenAddress, chainId, tokenOverview, tokenSecurity.data, '')
  }

  async search(
    query: string,
    chainId?: ChainId,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<BirdeyeSearchResponse> {
    return this.client.search(query, { ...options, chain: chainId ? BirdeyeMapper.chainIdToChain(chainId) : undefined })
  }
}
