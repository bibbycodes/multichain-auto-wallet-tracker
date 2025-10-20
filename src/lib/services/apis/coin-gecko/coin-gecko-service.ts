import axios from 'axios'
import {Chain} from "../../../../shared/chains";
import { GeckoTerminalApiClient, GeckoTerminalTokenDetails } from 'python-proxy-scraper-client';

const GECKO_TERMINAL_API_BASE = 'https://api.geckoterminal.com/api/v2'

export interface TradeAttributes {
  block_number: number
  tx_hash: string
  tx_from_address: string
  from_token_amount: string
  to_token_amount: string
  price_from_in_currency_token: string
  price_to_in_currency_token: string
  price_from_in_usd: string
  price_to_in_usd: string
  block_timestamp: string
  kind: string
  volume_in_usd: string
  from_token_address: string
  to_token_address: string
}

export interface TradesResponse {
  id: string
  type: string
  attributes: TradeAttributes
}

export class CoingeckoService {
  private baseUrl: string

  constructor() {
    this.baseUrl = GECKO_TERMINAL_API_BASE
  }

  async fetchBiggestBuyersForToken(
    tokenAddress: string,
    chain: Chain,
    largeTradeDollarThreshold: number = 1000
  ): Promise<string[] | null> {
    try {
      const tokenDetails = await axios.get(
        `${this.baseUrl}/networks/${chain}/tokens/${tokenAddress}`
      )
      const topPool = tokenDetails?.data?.relationships?.top_pools?.data[0]

      if (!topPool) {
        console.warn(`No top pool found for token ${tokenAddress}`)
        return null
      }

      const pairAddress = topPool.id.split('_')[1]

      if (!pairAddress) {
        console.warn(`Could not extract pair address from ${topPool.id}`)
        return null
      }
      const trades = await axios.get<TradesResponse[]>(
        `${this.baseUrl}/networks/${chain}/pools/${pairAddress}/trades?trade_volume_in_usd_greater_than=${largeTradeDollarThreshold}`
      )

      if (!trades?.data) {
        console.log(`No big trades found for pair ${pairAddress}`)
        return null
      }

      return trades.data.map((trade) => trade.attributes.tx_from_address)
    } catch (error) {
      console.error('Error fetching large trades:', error)
      return null
    }
  }
}
