import { Settings } from "./types";
export class SettingsService {
    constructor() {
    }

    async getSettings(): Promise<Settings> {
        return {
            MIN_USD_WHALE_WALLET_VALUE: await this.getWhaleMinUsdWalletValue(),
            HIGH_PNL_VALUE: await this.highPnlValue(),
            HIGH_WIN_RATE_VALUE: await this.highWinRateValue(),
        }
    }

    async getWhaleMinUsdWalletValue(): Promise<number> {
        return Promise.resolve(1000000);
    }

    async highPnlValue(): Promise<number> {
        return Promise.resolve(100000);
    }

    async highWinRateValue(): Promise<number> {
        return Promise.resolve(0.6);
    }
}