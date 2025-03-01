import axios from 'axios'
import {TrendingToken} from '../../../../shared/types'
import {Chain} from '../../../../shared/chains'
import {env} from "../../util/env/env";

type BirdEyeToken = {
  address: string
  name: string
  symbol: string
  price: number
  liquidity: number
  volume24hUSD: number
  rank: number
}

export type MultiChainPortfolioResponse = {
  success: boolean
  data: {
    totalUsd: number
  }
}

export class BirdEyeService {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    this.apiKey = env.birdeye.apikey || ''
    if (!this.apiKey) {
      throw new Error('BIRD_EYE_KEY is missing from environment variables')
    }
    this.baseUrl = 'https://public-api.birdeye.so'
  }

  private async get<T>(
    endpoint: string,
    headers: Record<string, string>,
    params?: Record<string, any>
  ): Promise<T | null> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers,
        params,
      })

      if (response.status !== 200 || !response.data.success) {
        console.error(`BirdEye API error: ${response.statusText}`)
        return null
      }

      return response.data
    } catch (error) {
      console.error('Error fetching data:', error)
      return null
    }
  }
  
  getHeaders = (extraParams: Record<string, any> = {}) => {
    return {
      'X-API-KEY': this.apiKey,
      accept: 'application/json',
      ...extraParams,
    }
  }

  async getTrendingCryptos(
    chain: Chain,
    limit: number = 20,
    offset: number = 0
  ): Promise<Omit<TrendingToken, 'id'>[]> {
    const headers = this.getHeaders({ 'x-chain': chain })

    const params = {
      sort_by: 'rank',
      sort_type: 'asc',
      offset,
      limit,
    }

    const data = await this.get<{ data: { tokens: BirdEyeToken[] } }>(
      `/defi/token_trending`,
      headers,
      params
    )

    if (!data) {
      return []
    }

    return data.data.tokens.map(
      (token: BirdEyeToken) =>
        ({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          chainType: chain,
          trendingAt: new Date(),
        }) as Omit<TrendingToken, 'id'>
    )
  }

  async getTopTraders(
    tokenAddress: string,
    chain: Chain,
    timeFrame: string = '24h'
  ): Promise<string[] | null> {
    const headers = this.getHeaders({ 'x-chain': chain })

    const params = {
      address: tokenAddress,
      time_frame: timeFrame,
      sort_type: 'desc',
      sort_by: 'volume',
    }

    const data = await this.get<{ data: { items: { owner: string }[] } }>(
      `/defi/v2/tokens/top_traders`,
      headers,
      params
    )

    if (!data) {
      return null
    }

    return data.data.items.map((item) => item.owner)
  }

  async getMultiChainPortfolioValueUsd(
    walletAddress: string,
    chains: Chain[]
  ): Promise<number | null> {
    const headers = this.getHeaders({ 'x-chain': chains.join(',') })

    const params = {
      wallet_address: walletAddress,
    }

    const data = await this.get<MultiChainPortfolioResponse>(
      `/v1/wallet/multichain_token_list?wallet=${walletAddress}`,
      headers,
      params
    )

    if (!data) {
      return null
    }

    return data.data.totalUsd
  }
}
