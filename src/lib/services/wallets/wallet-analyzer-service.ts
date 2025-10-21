
import { TrackedWalletType } from "@prisma/client";
import { AutoTrackerWallet } from "../../models/wallet/tracked-wallet";
import { Singleton } from "../util/singleton";

export class WalletAnalyzerService extends Singleton {
  constructor() {
    super()
  }

  async shouldTrackWallet(wallet: AutoTrackerWallet) {
    const whalePortolioThreshold = 100000
    const isWhale = wallet.portfolio?.totalUsdValue && wallet.portfolio.totalUsdValue >= whalePortolioThreshold
    const isKOL = wallet.types.includes(TrackedWalletType.KOL)
    const isInstitutional = wallet.types.includes(TrackedWalletType.INSTITUTIONAL)
    const isSmartMoney = wallet.types.includes(TrackedWalletType.SMART_MONEY)
    const isSniper = wallet.types.includes(TrackedWalletType.SNIPER)
    const isBot = wallet.types.includes(TrackedWalletType.BOT)
    const hasHighPnl = wallet.performance?.pnl && wallet.performance.pnl > 0
    const hasHighWinRate = wallet.performance?.winRate && wallet.performance.winRate > 0.5

    if (isSniper || isBot || !hasHighPnl || !hasHighWinRate) {
      return false
    }

    if (isWhale || isKOL || isInstitutional || isSmartMoney) {
      return true
    }

    return false
  }
}