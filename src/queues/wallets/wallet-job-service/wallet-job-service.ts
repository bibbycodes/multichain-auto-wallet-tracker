import {Singleton} from "../../../lib/services/util/singleton";
import { WalletService } from "../../../lib/services/wallets/wallet-service";
import {EvaluateWalletJobData} from "./types";
import { WalletAnalyzerService } from "../../../lib/services/wallets/wallet-analyzer-service";

export class WalletJobService extends Singleton {
  constructor(
    private walletService: WalletService = WalletService.getInstance(),
    private walletAnalyzerService: WalletAnalyzerService = WalletAnalyzerService.getInstance()
  ) {
    super()
  }
  
  async evaluateWallet({address, chainId}: EvaluateWalletJobData) {
    const wallet = await this.walletService.fetchWallet(address, chainId)
    const shouldSave = await this.walletAnalyzerService.shouldTrackWallet(wallet)
    if (shouldSave) {
        await wallet.save()
      }
    return true
  }
}
