import { AutoTrackerPortfolio } from "./types"
import { DbPortfolio } from "./types"
import { DbChainBalances } from "./types"
import { ChainBalances } from "./types"
import { PortfolioTokenBalance } from "./types"
import { DbPortfolioTokenBalance } from "./types"

export const convertPortfolioTokenBalanceToDbPortfolioTokenBalance = (portfolioTokenBalance: PortfolioTokenBalance): DbPortfolioTokenBalance => {
    return {
        balance: portfolioTokenBalance.balance,
        usdValue: portfolioTokenBalance.usdValue,
        tokenAddress: portfolioTokenBalance.token.address
    }
}

const convertChainTokens = (
    chainTokens: { [tokenAddress: string]: PortfolioTokenBalance }
): { [tokenAddress: string]: DbPortfolioTokenBalance } => {
    return Object.keys(chainTokens).reduce((acc, tokenAddress) => {
        acc[tokenAddress] = convertPortfolioTokenBalanceToDbPortfolioTokenBalance(chainTokens[tokenAddress])
        return acc
    }, {} as { [tokenAddress: string]: DbPortfolioTokenBalance })
}

const convertChain = (
    chainData: ChainBalances[string]
): DbChainBalances[string] => {
    return {
        usdAmount: chainData.usdAmount,
        tokens: convertChainTokens(chainData.tokens)
    }
}

const convertChains = (chains: ChainBalances): DbChainBalances => {
    return Object.keys(chains).reduce((acc, chainId) => {
        acc[chainId] = convertChain(chains[chainId])
        return acc
    }, {} as DbChainBalances)
}

export const convertPortfolioToDbPortfolio = (portfolio: AutoTrackerPortfolio): DbPortfolio => {
    return {
        totalUsdValue: portfolio.totalUsdValue,
        chains: convertChains(portfolio.chains)
    }
}