import { GmGnTokenHolder } from "python-proxy-scraper-client";
import { isEvmChainId } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { BirdeyeEvmTokenSecurity } from "../../apis/birdeye/client/types";
import { ChainBaseTopHolder } from "../../apis/chain-base/types";
import { RawTokenDataCache } from "../../raw-data/raw-data";
import { TokenDistributionContextData, TokenDistributionStats, TokenHolder } from "./types";
import { getTwitterHandleUrl } from "../../telegram-message-formatter/utils";
import { EvmChain } from "../../../chains/evm";
import { ChainFactory } from "../../../chains/chain-factory";

export class TokenDistributionContext {
    private data: TokenDistributionContextData = {} as TokenDistributionContextData
    private chain: EvmChain
    
    constructor(
        private rawData: RawTokenDataCache,
        private token: AutoTrackerToken,
    ) {
        this.chain = ChainFactory.getChain(this.token.chainId)
    }

    async getChainBaseTopHolders(): Promise<ChainBaseTopHolder[] | null> {
        return await this.rawData.chainBase.getTopHolders()
    }

    async getParsedChainBaseTopHolders(): Promise<TokenHolder[]> {
        const tokenPrice = await this.rawData.getTokenPrice()
        const tokenSupply = await this.rawData.getTokenSupply()
        const tokenCreator = await this.rawData.getTokenCreatedBy()
        const chainBaseTopHolders = await this.getChainBaseTopHolders()
        
        if (!chainBaseTopHolders || !tokenPrice || !tokenSupply || !tokenCreator) {
            return []
        }
        
        const tokenHolders = chainBaseTopHolders.map(holder => {
            const percentage = Number(((Number(holder.amount) / tokenSupply) * 100).toFixed(2))
            const dollarValue = Number(holder.amount) * tokenPrice
            const isWhale = false
            const significantHolderIn: AutoTrackerToken[] = []
            return {
                address: holder.wallet_address,
                amount: Number(holder.amount),
                percentage: percentage,
                dollarValue: dollarValue,
                isKOL: false,
                isWhale: isWhale,
                significantHolderIn: significantHolderIn,
                isPool: holder.wallet_address.toLowerCase() === this.token.pairAddress.toLowerCase() || this.chain.isKnownLiquidityAddress(holder.wallet_address),
                isCreator: holder.wallet_address.toLowerCase() === tokenCreator.toLowerCase(),
            }
        })
        return tokenHolders.filter(holder => !this.chain.isKnownAddress(holder.address))
    }

    async getKols(): Promise<TokenHolder[]> {
        const tokenHolders = await this.getTopHolders()
        return tokenHolders.filter(holder => holder.isKOL)
    }

    shouldExcludeHolder(holder: TokenHolder) : boolean {
        return this.chain.isKnownAddress(holder.address) && !this.chain.isKnownLiquidityAddress(holder.address)
    }

    isPool(address: string) : boolean {
        return address.toLowerCase() === this.token.pairAddress.toLowerCase() || this.chain.isKnownLiquidityAddress(address)
    }

    async getParsedGmGnTopHolders(): Promise<TokenHolder[]> {
        const tokenSupply = await this.rawData.getTokenSupply()
        const tokenCreator = await this.rawData.getTokenCreatedBy()
        const gmgnTopHolders = await this.getGmGnTopHolders()
        
        if (!gmgnTopHolders || !tokenSupply || !tokenCreator) {
            return []
        }
        
        const tokenHolders = gmgnTopHolders.map(holder => {
            const percentage = Number(((Number(holder.amount_cur) / tokenSupply) * 100).toFixed(2))
            const dollarValue = Number(holder.usd_value)
            const isWhale = false
            const significantHolderIn: AutoTrackerToken[] = []
            const returnValue: TokenHolder = {
                address: holder.address,
                amount: Number(holder.amount_cur),
                percentage: percentage,
                dollarValue: dollarValue,
                isKOL: !!(holder.twitter_username || holder.twitter_name),
                isWhale: isWhale,
                significantHolderIn: significantHolderIn,
                isPool: this.isPool(holder.address),
                isCreator: holder.address.toLowerCase() === tokenCreator.toLowerCase(),
            }
            if (holder.twitter_username) {
                returnValue.socials = {
                    twitter: getTwitterHandleUrl(holder.name)
                }
            }
            return returnValue
        })
        return tokenHolders.filter(holder => !this.shouldExcludeHolder(holder))
    }

    async getGmGnTopHolders(): Promise<GmGnTokenHolder[] | null> {
        return await this.rawData.gmgn.getHolders()
    }

    async getTopHolders(): Promise<TokenHolder[]> {
        const [chainBaseHoldersResult, gmgnHoldersResult] = await Promise.allSettled([
            this.getParsedChainBaseTopHolders(),
            this.getParsedGmGnTopHolders()
        ])
        const chainBaseHolders = chainBaseHoldersResult.status === 'fulfilled' ? chainBaseHoldersResult.value : []
        const gmgnHolders = gmgnHoldersResult.status === 'fulfilled' ? gmgnHoldersResult.value : []
        return this.mergeHolders(chainBaseHolders, gmgnHolders)
    }

    mergeHolders(chainBaseHolders: TokenHolder[], gmgnHolders: TokenHolder[]): TokenHolder[] {
        const holdersMap = new Map<string, TokenHolder>()
        chainBaseHolders.forEach(holder => {
            holdersMap.set(holder.address, holder)
        })
        gmgnHolders.forEach(holder => {
            if (holdersMap.has(holder.address)) {
                const cachedHolder = holdersMap.get(holder.address)
                if (cachedHolder) {
                    holdersMap.set(holder.address, {
                        ...cachedHolder,
                        ...holder
                    })
                }
            } else {
                holdersMap.set(holder.address, holder)
            }
        })
        return Array.from(holdersMap.values())
    }

    async getDistributionStats(): Promise<TokenDistributionStats> {
        return {
            top10Percentage: await this.getTopHoldersPercentage(10),
            top20Percentage: await this.getTopHoldersPercentage(20),
            creatorTokenPercentage: await this.getCreatorTokenPercentage(),
            numberOfHolders: await this.getNumberOfHolders(),
        }
    }

    async getTopHoldersPercentage(nHolders: number = 10): Promise<number> {
        const topHolders = await this.getTopHolders()
        const topHoldersPercentage = topHolders.slice(0, nHolders).reduce((acc, holder) => acc + holder.percentage, 0)
        return Number(topHoldersPercentage.toFixed(2))
    }

    async getCreatorTokenPercentage(): Promise<number> {
        const tokenSecurity = await this.rawData.birdeye.getTokenSecurity()
        if (!tokenSecurity) {
            return 0
        }
        return Number((Number(tokenSecurity.creatorPercentage) * 100).toFixed(2))
    }

    async getNumberOfHolders(): Promise<number> {
        if (!isEvmChainId(this.token.chainId)) {
            throw new Error('Chain not supported')
        }
        const topHolders = await this.rawData.birdeye.getTokenSecurity() as BirdeyeEvmTokenSecurity | null
        if (!topHolders) {
            return 0
        }
        return Number(topHolders.holderCount)
    }

    async collect(): Promise<void> {
        const [tokenDistributionStats, tokenHolders] = await Promise.all([
            this.getDistributionStats(),
            this.getTopHolders(),
        ])
        this.data = {
            tokenDistributionStats,
            tokenHolders,
        }
    }

    toJson(): string {
        return JSON.stringify(this.data)
    }

    async toObject(): Promise<TokenDistributionContextData> {
        this.data = {
            tokenDistributionStats: await this.getDistributionStats(),
            tokenHolders: await this.getTopHolders(),
        }
        return this.data
    }
}