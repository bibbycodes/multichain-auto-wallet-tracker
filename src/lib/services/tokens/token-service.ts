import { BirdEyeService } from '../apis/birdeye/birdeye-service'
import { TrendingToken } from '../../../shared/types'
import { Chain, ChainToId } from '../../../shared/chains'
import { ChainBaseService } from '../apis/chain-base/chain-base-service'
import { CoingeckoService } from '../apis/coin-gecko/coin-gecko-service'

const supportedChains: Chain[] = Object.keys(ChainToId) as Chain[]

export class TokenService {
  private birdEyeService: BirdEyeService
  private chainBaseService: ChainBaseService
  private coinGeckoService: CoingeckoService

  constructor() {
    this.birdEyeService = new BirdEyeService()
    this.chainBaseService = new ChainBaseService()
    this.coinGeckoService = new CoingeckoService()
  }

  async fetchTrendingTokensForAllChains(
    limit: number = 20
  ): Promise<Omit<TrendingToken, 'id'>[]> {
    const promises = supportedChains.map((chain) =>
      this.birdEyeService.getTrendingCryptos(chain, limit)
    )

    try {
      const results = await Promise.allSettled(promises)

      const successfulResults = results
        .filter((result) => result.status === 'fulfilled')
        .map(
          (result) =>
            (result as PromiseFulfilledResult<Omit<TrendingToken, 'id'>[]>)
              .value
        )

      const allTrendingTokens = successfulResults.flat()

      console.log(
        `Successfully fetched trending tokens for ${successfulResults.length} chains.`
      )

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `Error fetching trending tokens for chain ${supportedChains[index]}:`,
            result.reason
          )
        }
      })

      return allTrendingTokens
    } catch (error) {
      console.error('Unexpected error fetching trending tokens:', error)
      throw error
    }
  }

  async fetchTopTradersForToken(
    tokenAddress: string,
    chain: Chain,
    timeFrame: string = '24h'
  ): Promise<string[]> {
    try {
      const topTraders = await this.birdEyeService.getTopTraders(
        tokenAddress,
        chain,
        timeFrame
      )

      if (!topTraders) {
        console.info(`No top traders found for token ${tokenAddress}.`)
        return []
      }

      console.log(`Fetched top traders for token ${tokenAddress}.`)
      return topTraders
    } catch (error) {
      console.error(
        `Error fetching top traders for token ${tokenAddress}:`,
        error
      )
      throw error
    }
  }

  async fetchTopHoldersForToken(
    tokenAddress: string,
    chain: Chain
  ): Promise<string[]> {
    try {
      const topHolders = await this.chainBaseService.fetchTopHoldersForToken(
        tokenAddress,
        chain
      )
      if (!topHolders) {
        console.info(`No top holders found for token ${tokenAddress}.`)
        return []
      }
      console.log(`Fetched top holders for token ${tokenAddress}.`)
      return topHolders
    } catch (error) {
      throw error
    }
  }

  async fetchBiggestBuyersForToken(
    tokenAddress: string,
    chain: Chain
  ): Promise<string[]> {
    try {
      const topBuyers = await this.coinGeckoService.fetchBiggestBuyersForToken(
        tokenAddress,
        chain
      )
      if (!topBuyers) {
        console.info(`No biggest buyers found for token ${tokenAddress}.`)
        return []
      }
      console.log(`Fetched biggest buyers for token ${tokenAddress}.`)
      return topBuyers
    } catch (error) {
      throw error
    }
  }
}
