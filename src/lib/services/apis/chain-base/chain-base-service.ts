import axios from 'axios';
import { ChainId } from "../../../../shared/chains";
import { ApiKeyRotator } from "../../util/api-key-rotator/api-key-rotator";
import { ApiService } from '../../util/api-key-rotator/types';
import { Singleton } from '../../util/singleton';
import { ChainBaseMapper } from './chain-base-mapper';
import { ChainBaseTopHolder } from './types';
const CHAIN_BASE_API_BASE = 'https://api.chainbase.online'

export class ChainBaseService extends Singleton {
  private readonly baseUrl: string
  private apiKeyRotator: ApiKeyRotator

  constructor() {
    super()
    this.baseUrl = CHAIN_BASE_API_BASE
    this.apiKeyRotator = ApiKeyRotator.getInstance()
  }

  async fetchTopHoldersForToken(
    tokenAddress: string,
    chain: ChainId
  ): Promise<ChainBaseTopHolder[]> {
    try {
      const chainId = ChainBaseMapper.chainIdToChain(chain)
      if (!chainId) {
        throw new Error('Invalid chain')
      }

      const response = await axios.get(
        `${this.baseUrl}/v1/token/top-holders?chain_id=${chainId}&contract_address=${tokenAddress}`,
        {
          headers: {
            'X-API-KEY': this.apiKeyRotator.getNextAndUpdateKey(ApiService.ChainBase),
            accept: 'application/json',
          },
        }
      )

      if (response.status !== 200 || response.data.code !== 0) {
        throw new Error(`ChainBase API error: ${response.statusText}`)
      }


      const holders: ChainBaseTopHolder[] = response.data.data
      return Boolean(holders) ? holders.map((holder) => holder).sort((a, b) => Number(b.amount) - Number(a.amount)) : []
    } catch (error) {
      console.error(
        `Error fetching top holders for token ${tokenAddress}:`,
        error
      )
      throw new Error(`Error fetching top holders for token ${tokenAddress}: ${error}`)
    }
  }
}
