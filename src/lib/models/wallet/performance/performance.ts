import { ChainId } from "shared/chains";
import { Prisma } from "@prisma/client";
import { AutoTrackerWalletPerformanceData } from "./types";
import { GmGnSmartMoneyWalletData } from "python-proxy-scraper-client";
import { AutoTrackerWallet } from "../tracked-wallet";
import { Database } from "../../../db/database";

export class AutoTrackerWalletPerformance {
    id?: string;
    address: string;
    chainId: ChainId;
    pnl: number;
    winRate: number;
    totalProfit: number;
    num5xProfitableTrades: number;
    num2xProfitableTrades: number;
    num1xProfitableTrades: number;
    numLosses: number;
    numWins: number;
    pnl1d: number;
    pnl7d: number;
    pnl30d: number;
    realizedProfit: number;
    unrealizedProfit: number;
    wallet?: AutoTrackerWallet;
    db: Database;
    constructor(data: AutoTrackerWalletPerformanceData) {
        this.id = data.id;
        this.address = data.address;
        this.chainId = data.chainId;
        this.pnl = data.pnl;
        this.winRate = data.winRate;
        this.totalProfit = data.totalProfit;
        this.num5xProfitableTrades = data.num5xProfitableTrades;
        this.num2xProfitableTrades = data.num2xProfitableTrades;
        this.num1xProfitableTrades = data.num1xProfitableTrades;
        this.numLosses = data.numLosses;
        this.numWins = data.numWins;
        this.pnl1d = data.pnl1dPercentage;
        this.pnl7d = data.pnl7dPercentage;
        this.pnl30d = data.pnl30dPercentage;
        this.realizedProfit = data.realizedProfit;
        this.unrealizedProfit = data.unrealizedProfit;
        this.db = Database.getInstance()
    }

    toDb(): Prisma.WalletPerformanceCreateInput {
        if (!this.wallet) {
            throw new Error("Wallet is not connected")
        }
        return {
            wallet_address: this.address,
            chain: {
                connect: {
                    chain_id: this.chainId.toString(),
                }
            },
            wallet: {
                connect: {
                    id: this.wallet.walletData.id
                }
            },
            pnl: this.pnl,
            win_rate: this.winRate,
            total_profit: this.totalProfit,
            num_5x_profitable_trades: this.num5xProfitableTrades,
            num_2x_profitable_trades: this.num2xProfitableTrades,
            num_1x_profitable_trades: this.num1xProfitableTrades,
            num_losses: this.numLosses,
            num_wins: this.numWins,
            pnl_1d_percentage: this.pnl1d,
            pnl_7d_percentage: this.pnl7d,
            pnl_30d_percentage: this.pnl30d,
            realized_profit: this.realizedProfit,
            unrealized_profit: this.unrealizedProfit,
        }
    }

    static fromGmGn({
        address,
        data,
        chainId
    }: {
        address: string,
        data: GmGnSmartMoneyWalletData,
        chainId: ChainId
    }): AutoTrackerWalletPerformance {
        const numWins = data.profit_num
        const numTrades = data.token_num
        const numLosses = numTrades - numWins
        return new AutoTrackerWalletPerformance({
            chainId,
            address,
            pnl: data.pnl,
            pnl1dPercentage: data.pnl_1d,
            pnl7dPercentage: data.pnl_7d,
            pnl30dPercentage: data.pnl_30d,
            winRate: data.winrate,
            totalProfit: data.total_profit,
            num5xProfitableTrades: data.pnl_gt_5x_num,
            num2xProfitableTrades: data.pnl_2x_5x_num,
            num1xProfitableTrades: data.pnl_lt_2x_num,
            numLosses: numLosses,
            numWins: numWins,
            realizedProfit: data.realized_profit,
            unrealizedProfit: data.unrealized_profit,
        })
    }

    async save(wallet?: AutoTrackerWallet) {
        if (!wallet) {
            throw new Error("Wallet is not connected")
        }
        
        this.connectToWallet(wallet)
        const record = await this.db.performance.create(this.toDb())
        this.id = record.id
        return this
    }

    connectToWallet(wallet: AutoTrackerWallet) {
        this.wallet = wallet
    }
}