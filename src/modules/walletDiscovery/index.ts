import cron from 'node-cron'
import { EventEmitter } from 'events'
import { TokenService } from '../../lib/services/tokens/token-service'
import { WalletAnalyzerService } from '../../lib/services/wallets/walletAnalyzerService'
import {WalletDiscoveryConfig} from "../../shared/types";
import {TrendingTokenRepository} from "../../lib/db/repositories/trendingTokenRepository";
import {WalletsQueue} from "../../queues/wallets/wallets-queue";
import {WalletJobs} from "../../queues/wallets/types";
import {EvaluateWalletJobData} from "../../queues/wallets/wallet-job-service/types";

export class WalletDiscoveryService {
  private eventEmitter = new EventEmitter()
  private config: WalletDiscoveryConfig
  private trendingTokenRepository: TrendingTokenRepository
  private trendingTokenService: TokenService
  private whaleAnalyzerService: WalletAnalyzerService
  private walletsQueue: WalletsQueue 

  constructor(config: WalletDiscoveryConfig) {
    this.config = config
    this.trendingTokenService = new TokenService()
    this.trendingTokenRepository = new TrendingTokenRepository()
    this.whaleAnalyzerService = new WalletAnalyzerService()
    this.walletsQueue = WalletsQueue.getInstance()
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
        await this.walletsQueue.addJob<EvaluateWalletJobData>({
          name: WalletJobs.EVALUATE,
          data: { address },
        })
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
