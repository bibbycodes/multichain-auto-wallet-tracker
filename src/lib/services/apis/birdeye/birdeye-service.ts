import { ChainId } from "../../../../shared/chains"
import { TokenData, TokenDataWithMarketCapAndRawData } from "../../../models/token/types"
import { BaseTokenFetcherService } from "../../tokens/token-fetcher-types"
import { BirdeyeMapper } from "./birdeye-mapper"
import { BirdEyeClient } from "./client/index"
import { BirdEyeTokenDataRawData } from "./types"

export class BirdEyeFetcherService extends BaseTokenFetcherService {
  constructor(private client: BirdEyeClient = new BirdEyeClient()) {
    super()
  }

  async fetchTokenDataWithMarketCapFromAddress(tokenAddress: string): Promise<TokenDataWithMarketCapAndRawData<BirdEyeTokenDataRawData>> {
    const supportedChains = BirdeyeMapper.getSupportedChains()
    const tokenDataWithMarketCaps = await Promise.allSettled(supportedChains.map(chainId => this.fetchTokenWithMarketCap(tokenAddress, chainId)))
    const successfulResult = tokenDataWithMarketCaps.find((r): r is PromiseFulfilledResult<TokenDataWithMarketCapAndRawData<BirdEyeTokenDataRawData>> => 
      r.status === 'fulfilled'
    )
    if (!successfulResult) {
      throw new Error(`No token data with market cap found for token address: ${tokenAddress}`)
    }
    return successfulResult.value
  }


  async fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<TokenDataWithMarketCapAndRawData<BirdEyeTokenDataRawData>> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const  [
      tokenOverview,
      tokenSecurity
    ] = await Promise.all([
      this.client.getTokenOverview(tokenAddress, ['1H'], chain),
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
    
    this.validateTokenDataWithMarketCap(tokenData)
    
    return {token: tokenData, rawData: {tokenOverview, tokenSecurity: tokenSecurity.data, marketsResponse}}
  }

  async fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<TokenData> {
    const chain = BirdeyeMapper.chainIdToChain(chainId)
    const tokenOverview = await this.client.getTokenOverview(tokenAddress, ['1H'], chain)
    const tokenSecurity = await this.client.getTokenSecurity(tokenAddress, chain)
    return BirdeyeMapper.mapTokenMetadataToTokenData(tokenAddress, chainId, tokenOverview, tokenSecurity.data, '')
  }
}
