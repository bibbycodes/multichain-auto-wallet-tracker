import { ChainId } from "../../../../shared/chains";


export interface AutoTrackerWalletPerformanceData {
    id?: string;
    chainId: ChainId;
    address: string;
    pnl: number;
    winRate: number;
    totalProfit: number;
    num5xProfitableTrades: number;
    num2xProfitableTrades: number;
    num1xProfitableTrades: number;
    numLosses: number;
    numWins: number;
    pnl1dPercentage: number;
    pnl7dPercentage: number;
    pnl30dPercentage: number;
    realizedProfit: number;
    unrealizedProfit: number;
}