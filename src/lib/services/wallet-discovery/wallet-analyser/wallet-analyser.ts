import { WalletAnalysis } from "./types";
import { ChainId } from "shared/chains";
import { GmGnService } from "../../apis/gmgn/gmgn-service";
import { SettingsService } from "../../settings/settings-service";

export class WalletAnalyserService {
    constructor(
        private gmgnService: GmGnService = new GmGnService(),
        private settings: SettingsService = new SettingsService()
    ) {
    }

    async analyseWallet(walletAddress: string, chainId: ChainId): Promise<WalletAnalysis> {
        const walletData = await this.gmgnService.getWalletData(walletAddress, chainId);
        return {
            address: walletAddress,
            totalDollarValue: walletData.total_value,
            pnl: walletData.pnl,
            winRate: walletData.winrate,
        }
    }

    async shouldTrackWallet(walletAddress: string, chainId: ChainId): Promise<boolean> {
        const walletData = await this.gmgnService.getWalletData(walletAddress, chainId);
        const settings = await this.settings.getSettings();
        const isHighPnl = walletData.pnl > settings.HIGH_PNL_VALUE;
        const isHighWinRate = walletData.winrate > settings.HIGH_WIN_RATE_VALUE;
        const isWhale = walletData.total_value > settings.MIN_USD_WHALE_WALLET_VALUE;
        return (isHighPnl || isHighWinRate) && isWhale;
    }
}
