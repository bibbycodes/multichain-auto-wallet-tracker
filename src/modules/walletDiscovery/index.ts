import cron from 'node-cron'
import { WalletDiscoveryConfig } from '@shared/types'
import { EventEmitter } from 'events'
import { TokenService } from '../../shared/services/tokenService'
import { TrendingTokenRepository } from '@shared/repositories/trendingTokenRepository'
import { WhaleAnalyzerService } from './services/whaleAnalyzerService'

export class WalletDiscovery {
  private eventEmitter = new EventEmitter()
  private config: WalletDiscoveryConfig
  private trendingTokenRepository: TrendingTokenRepository
  private trendingTokenService: TokenService
  private whaleAnalyzerService: WhaleAnalyzerService

  constructor(config: WalletDiscoveryConfig) {
    this.config = config
    this.trendingTokenService = new TokenService()
    this.trendingTokenRepository = new TrendingTokenRepository()
    this.whaleAnalyzerService = new WhaleAnalyzerService()
  }

  async fetchAndSaveTrendingCryptos(): Promise<void> {
    try {
      const trendingTokens =
        await this.trendingTokenService.fetchTrendingTokensForAllChains(20)

      for (const token of trendingTokens) {
        await this.trendingTokenRepository.upsertTrendingToken(token)
      }
      this.eventEmitter.emit('trendingCryptosUpdated', trendingTokens)

      const topHolders = new Set<string>()
      const topTraders = new Set<string>()
      const biggestBuyers = new Set<string>()
      for (const token of trendingTokens) {
        ;(
          await this.trendingTokenService.fetchTopHoldersForToken(
            token.address,
            token.chainType
          )
        ).forEach((holder) => topHolders.add(holder))
        ;(
          await this.trendingTokenService.fetchTopTradersForToken(
            token.address,
            token.chainType
          )
        ).forEach((trader) => topTraders.add(trader))
        ;(
          await this.trendingTokenService.fetchBiggestBuyersForToken(
            token.address,
            token.chainType
          )
        ).forEach((buyer) => biggestBuyers.add(buyer))
      }
      console.log('Top holders:', topHolders)
      console.log('Top traders:', topTraders)
      console.log('Biggest buyers:', biggestBuyers)

      // merged sets
      const allAddresses = new Set([
        ...topHolders,
        ...topTraders,
        ...biggestBuyers,
      ])

      for (let address of allAddresses) {
        const isWhale = await this.whaleAnalyzerService.isWhale(address)
        console.log(`Address ${address} is whale: ${isWhale}`)
      }

      console.log('Successfully fetched and saved trending tokens.')
    } catch (error) {
      console.error('Error fetching and saving trending cryptos:', error)
    }
  }

  startCronJob(): void {
    this.fetchAndSaveTrendingCryptos()
    cron.schedule(`*/${this.config.interval / 60000} * * * *`, () => {
      console.log('Fetching trending cryptos...')
      this.fetchAndSaveTrendingCryptos()
    })
  }
}
