import axios from 'axios'
import {Chain, getChainId} from "../../../../shared/chains";
import {ApiKeyRotator} from "../../util/api-key-rotator/api-key-rotator";

const API_KEY = process.env.CHAIN_BASE_KEY
const CHAIN_BASE_API_BASE = 'https://api.chainbase.online'

type ChainBaseTopHolder = {
  amount: string
  original_amount: string
  usd_value: string
  wallet_address: string
}

export class ChainBaseService {
  private readonly apiKey: string
  private readonly baseUrl: string
  private apiKeyRotator: ApiKeyRotator

  constructor() {
    this.apiKey = API_KEY || ''
    if (!this.apiKey) {
      throw new Error('BIRD_EYE_KEY is missing from environment variables')
    }
    this.baseUrl = CHAIN_BASE_API_BASE
    this.apiKeyRotator = ApiKeyRotator.getInstance()
  }

  async fetchTopHoldersForToken(
    tokenAddress: string,
    chain: Chain
  ): Promise<string[] | null> {
    try {
      const chainId = getChainId(chain)
      if (!chainId) {
        console.error('Invalid chain')
        return null
      }

      const response = await axios.get(
        `${this.baseUrl}/v1/token/top-holders?chain_id=${chainId}&contract_address=${tokenAddress}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            accept: 'application/json',
          },
        }
      )

      if (response.status !== 200 || response.data.code !== 0) {
        console.error(`ChainBase API error: ${response.statusText}`)
        return null
      }

      // Map over the response data and extract the wallet_address fields
      const holders: ChainBaseTopHolder[] = response.data.data
      return holders.map((holder) => holder.wallet_address)
    } catch (error) {
      console.error(
        `Error fetching top holders for token ${tokenAddress}:`,
        error
      )
      return null
    }
  }
}
