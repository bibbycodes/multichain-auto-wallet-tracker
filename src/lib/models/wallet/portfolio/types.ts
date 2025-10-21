import { GmGnWalletHoldings } from "python-proxy-scraper-client";
import { GmGnSmartMoneyWalletData } from "python-proxy-scraper-client";
import { ChainId } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../token";


export interface AutoTrackerPortfolio {
    chains: ChainBalances
    totalUsdValue: number
    data?: any // Optional data field for storing original data
}

export interface PortfolioTokenBalance {
    token: AutoTrackerToken,
    balance: number,
    usdValue: number
}

export interface ChainBalances {
    [chainId: string]: {
        usdAmount: number,
        tokens: {[tokenAddress: string]: PortfolioTokenBalance}
    }
}

export interface DbPortfolio {
    totalUsdValue: number
    chains: DbChainBalances,
}

export interface DbChainBalances {
    [chainId: string]: {
        usdAmount: number,
        tokens: {[tokenAddress: string]: DbPortfolioTokenBalance}
    }
}

export interface DbPortfolioTokenBalance {
    balance: number,
    usdValue: number,
    tokenAddress: string,
}


export interface GmGnPortfolioInput {
    gmGnPortfolio: GmGnWalletHoldings
    chainId: ChainId
    smartMoneyData: GmGnSmartMoneyWalletData
}