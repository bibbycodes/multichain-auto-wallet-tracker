import axios from 'axios'
import * as dotenv from 'dotenv'
import { TrendingToken } from '../types'
import { Chain } from '@shared/chains'

dotenv.config()

const BIRD_EYE_API_BASE = 'https://public-api.birdeye.so'
const API_KEY = process.env.BIRD_EYE_KEY

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
    this.apiKey = API_KEY || ''
    if (!this.apiKey) {
      throw new Error('BIRD_EYE_KEY is missing from environment variables')
    }
    this.baseUrl = BIRD_EYE_API_BASE
  }

  async getTrendingCryptos(
    chain: Chain,
    limit: number = 20,
    offset: number = 0
  ): Promise<Omit<TrendingToken, 'id'>[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/defi/token_trending`, {
        headers: {
          'X-API-KEY': this.apiKey,
          accept: 'application/json',
          'x-chain': chain,
        },
        params: {
          sort_by: 'rank',
          sort_type: 'asc',
          offset,
          limit,
        },
      })

      if (response.status !== 200) {
        throw new Error(`BirdEye API error: ${response.statusText}`)
      }

      return response.data?.data?.tokens.map(
        (token: BirdEyeToken) =>
          ({
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            chainType: chain,
            trendingAt: new Date(),
          }) as Omit<TrendingToken, 'id'>
      )
    } catch (error) {
      throw error
    }
  }

  async getTopTraders(
    tokenAddress: string,
    chain: Chain,
    timeFrame: string = '24h'
  ): Promise<string[] | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/defi/v2/tokens/top_traders`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            accept: 'application/json',
            'x-chain': chain,
          },
          params: {
            address: tokenAddress,
            time_frame: timeFrame,
            sort_type: 'desc',
            sort_by: 'volume',
          },
        }
      )

      if (response.status !== 200 || !response.data.success) {
        console.error(`BirdEye API error: ${response.statusText}`)
        return null
      }

      return response.data.data.items.map((item: any) => item.owner)
    } catch (error) {
      console.error('Error fetching top traders:', error)
      return null
    }
  }

  async getMultiChainPortfolioValueUsd(
    walletAddress: string,
    chains: Chain[]
  ): Promise<number | null> {
    try {
      const response = await axios.get<MultiChainPortfolioResponse>(
        `${this.baseUrl}/v1/wallet/multichain_token_list?wallet=${walletAddress}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            accept: 'application/json',
            'x-chain': chains.join(','),
          },
          params: {
            wallet_address: walletAddress,
          },
        }
      )

      if (response.status !== 200 || !response.data.success) {
        console.error(`BirdEye API error: ${response.statusText}`)
        return null
      }

      return response.data.data.totalUsd
    } catch (error) {
      console.error('Error fetching multi-chain portfolio:', error)
      return null
    }
  }
}
