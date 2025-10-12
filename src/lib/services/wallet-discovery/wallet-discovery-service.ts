import { ChainId } from "shared/chains"
import { WalletJobs } from "../../../queues/wallets/types"
import { EvaluateWalletJobData } from "../../../queues/wallets/wallet-job-service/types"
import { WalletsQueue } from "../../../queues/wallets/wallets-queue"
import { Database } from "../../db/database"
import { GmGnService } from "../apis/gmgn/gmgn-service"
import { Singleton } from "../util/singleton"

export class WalletDiscoveryService extends Singleton {
  constructor(
    private readonly gmgnService: GmGnService = GmGnService.getInstance(),
    private readonly database: Database = Database.getInstance(),
    private readonly walletsQueue: WalletsQueue = WalletsQueue.getInstance()
  ) {
    super()
  }

  async getWalletsToTrack(chainId: ChainId) {
    const trendingTokens = await this.getTrackableTrendingTokens(chainId)
    for (const tokenAddress of trendingTokens) {
      const gmGnTopTraders = await this.gmgnService.getTopTraders(tokenAddress, chainId)
      const gmGnTopHolders = await this.gmgnService.getTopHolders(tokenAddress, chainId)
      const uniqueWallets = new Set<string>([...gmGnTopTraders.map(trader => trader.address), ...gmGnTopHolders.map(holder => holder.address)])
      for (const trader of uniqueWallets) {
        try {
          const exists = await this.database.trackedWallets.existsByAddressAndChainId(trader, chainId)
          if (exists) {
            continue
        }

        this.walletsQueue.addJob<EvaluateWalletJobData>({
          name: WalletJobs.EVALUATE,
          data: {
            address: trader,
            chainId
          }
        })
        } catch (error) {
          console.error(`Error fetching wallet ${trader} on chain ${chainId}:`, error)
        }
      }
    }
  }

  async getTrackableTrendingTokens(chainId: ChainId) {
    const gmGnTrendingTokens = await this.gmgnService.getTrendingTokens(chainId, '24h')
    return gmGnTrendingTokens.rank.map(token => token.address)
  }
}
