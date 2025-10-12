import { GmGnSmartMoneyWalletData } from "python-proxy-scraper-client"
import { ChainId } from "../../../shared/chains"
import { AutoTrackerWalletPerformance } from "../../models/wallet/performance/performance"
import { AutoTrackerPortfolioModel } from "../../models/wallet/portfolio/portfolio"
import { PortfolioTokenBalance } from "../../models/wallet/portfolio/types"
import { AutoTrackerWallet } from "../../models/wallet/tracked-wallet"
import { GmGnService } from "../apis/gmgn/gmgn-service"
import { gmgnWalletTagToWalletType } from "../apis/gmgn/utils"
import { TokenService } from "../token-service/token-service"
import { Singleton } from "../util/singleton"

export class WalletService extends Singleton {
    constructor(
        private readonly gmgnService: GmGnService = GmGnService.getInstance(),
        private readonly tokenService: TokenService = TokenService.getInstance()
    ) {
        super()
    }

    async getWalletPerformance(
        walletAddress: string,
        chainId: ChainId,
        gmgnSmartMoneyData?: GmGnSmartMoneyWalletData
    ): Promise<AutoTrackerWalletPerformance> {
        if (!gmgnSmartMoneyData) {
            gmgnSmartMoneyData = await this.gmgnService.getWalletData(walletAddress, chainId)
        }
        return AutoTrackerWalletPerformance.fromGmGn({
            address: walletAddress,
            data: gmgnSmartMoneyData,
            chainId,
        })
    }

    async getMultiChainWalletPerformance(walletAddress: string, chainIds: ChainId[]): Promise<AutoTrackerWalletPerformance[]> {
        const promises = chainIds.map(chainId => this.getWalletPerformance(walletAddress, chainId))
        const performances = await Promise.all(promises)
        return performances
    }

    async getWalletPortfolioForChain(
        walletAddress: string,
        chainId: ChainId,
        gmgnSmartMoneyData?: GmGnSmartMoneyWalletData
    ): Promise<AutoTrackerPortfolioModel> {
        if (!gmgnSmartMoneyData) {
            gmgnSmartMoneyData = await this.gmgnService.getWalletData(walletAddress, chainId)
        }
        const gmgnPortfolio = await this.gmgnService.getWalletHoldings(walletAddress, chainId)
        const totalUsdValue = gmgnSmartMoneyData.total_value
        const tokens = await this.tokenService.getOrCreateManyTokens(gmgnPortfolio.holdings.map(h => h.token.address), chainId)
        const tokenAddressToTokenMap = new Map(tokens.map(t => [t.address, t]))
        const data = {
            chains: {
                [chainId]: {
                    usdAmount: totalUsdValue,
                    tokens: gmgnPortfolio.holdings.reduce((acc, holding) => {
                        const token = tokenAddressToTokenMap.get(holding.token.address)
                        if (!token) {
                            return acc
                        }

                        acc[token.address] = {
                            token: token,
                            balance: Number(holding.balance),
                            usdValue: Number(holding.usd_value),
                        }
                        return acc
                    }, {} as { [tokenAddress: string]: PortfolioTokenBalance }),
                },
            },
            totalUsdValue: totalUsdValue,
        }
        return new AutoTrackerPortfolioModel(data)
    }

    async fetchWallet(walletAddress: string, chainId: ChainId): Promise<AutoTrackerWallet> {
        const gmgnSmartMoneyData = await this.gmgnService.getWalletData(walletAddress, chainId)
        const tags = gmgnSmartMoneyData.tags
        const portfolio = await this.getWalletPortfolioForChain(walletAddress, chainId, gmgnSmartMoneyData)
        const performance = await this.getWalletPerformance(walletAddress, chainId, gmgnSmartMoneyData)
        console.log({
            address: walletAddress,
            chainId,
            createdAt: new Date(),
            updatedAt: new Date(),
            types: tags.map(tag => gmgnWalletTagToWalletType(tag))
        })
        return new AutoTrackerWallet({
            walletData: {
                address: walletAddress,
                chainId,
                createdAt: new Date(),
                updatedAt: new Date(),
                types: tags.map(tag => gmgnWalletTagToWalletType(tag))
            },
            performance,
            portfolio,
        })
    }
}