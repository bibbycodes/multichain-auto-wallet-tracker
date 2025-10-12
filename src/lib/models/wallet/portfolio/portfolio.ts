import { Prisma } from "@prisma/client";
import { Database } from "../../../db/database";
import { AutoTrackerWallet } from "../tracked-wallet";
import { convertPortfolioToDbPortfolio } from "./helpers";
import { AutoTrackerPortfolio as AutoTrackerPortfolioData, ChainBalances, DbPortfolio, GmGnPortfolioInput } from "./types";

export class AutoTrackerPortfolioModel {
    public chains: ChainBalances
    public totalUsdValue: number
    public data: AutoTrackerPortfolioData
    public wallet?: AutoTrackerWallet
    private db: Database
    public id?: string
    constructor(public inputData: AutoTrackerPortfolioData) {
        this.data = inputData
        this.chains = inputData.chains
        this.totalUsdValue = inputData.totalUsdValue
        this.db = Database.getInstance()
    }

    toDb(): Prisma.PortfolioSnapshotCreateInput  {
        if (!this.wallet) {
            throw new Error("Wallet is not connected")
        }

        const jsonData =  convertPortfolioToDbPortfolio(this.data)
        return {
            data: JSON.stringify(jsonData),
            usd_value: this.totalUsdValue,
            wallet_address: this.wallet.walletData.address,
            wallet: {
                connect: {
                    id: this.wallet?.id
                }
            }
        }
    }

    async save(wallet?: AutoTrackerWallet) {
        if (!this.wallet || !wallet) {
            throw new Error("Wallet is not connected")
        }

        if (wallet) {
            this.connectToWallet(wallet)
        }

        const record = await this.db.portfolioSnapshots.create(this.toDb())
        this.id = record.id
        return this
    }

    connectToWallet(wallet: AutoTrackerWallet) {
        this.wallet = wallet
    }

    static fromGmGnData(input: GmGnPortfolioInput): AutoTrackerPortfolioModel {
        const { gmGnPortfolio, chainId, smartMoneyData } = input
        const totalUsdValue = smartMoneyData.total_value
        const tokensObject = gmGnPortfolio.holdings.reduce((acc, h) => ({
            ...acc,
            [h.token.address]: {
                token: h.token,
                balance: Number(h.balance),
                usdValue: Number(h.usd_value)
            }
        }), {})

        return new AutoTrackerPortfolioModel({
            chains: {
                [chainId]: {
                    usdAmount: totalUsdValue,
                    tokens: tokensObject,
                },
            },
            totalUsdValue,
        })
    }

    static fromGmGnPortfolios(holdings: GmGnPortfolioInput[]): AutoTrackerPortfolioModel {
        const chains: ChainBalances = {}
        let totalUsdValue = 0

        for (const { gmGnPortfolio, chainId, smartMoneyData } of holdings) {
            const chainUsdValue = gmGnPortfolio.holdings.reduce((acc, h) => acc + Number(h.usd_value), 0)
            totalUsdValue = smartMoneyData.total_value

            const tokensObject = gmGnPortfolio.holdings.reduce((acc, h) => ({
                ...acc,
                [h.token.address]: {
                    token: h.token,
                    balance: Number(h.balance),
                    usdValue: Number(h.usd_value)
                }
            }), {})

            chains[chainId] = {
                usdAmount: chainUsdValue,
                tokens: tokensObject,
            }
        }

        return new AutoTrackerPortfolioModel({
            chains,
            totalUsdValue,
            data: holdings
        })
    }
}