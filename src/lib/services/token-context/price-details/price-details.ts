import { TokenPriceDetails } from "../../../models/token/types";
import { RawTokenDataCache } from "../../raw-data/raw-data";

export class PriceDetailsContext {
    public data: TokenPriceDetails = {} as TokenPriceDetails
    constructor(
        private rawData: RawTokenDataCache,
    ) {
    }

    async getPrice(): Promise<number> {
        const price = await this.rawData.getTokenPrice()
        if (!price) {
            throw new Error('Price is not available')
        }
        return price
    }

    async getMarketCap(): Promise<number> {
        const marketCap = await this.rawData.getTokenMarketCap()
        if (!marketCap) {
            throw new Error('Market cap is not available')
        }
        return marketCap
    }

    async getLiquidity(): Promise<number> {
        const liquidity = await this.rawData.getTokenLiquidity()
        if (!liquidity) {
            throw new Error('Liquidity is not available')
        }
        return liquidity
    }

    async toObject(): Promise<TokenPriceDetails> {
        this.data = {
            price: await this.getPrice(),
            marketCap: await this.getMarketCap(),
            liquidity: await this.getLiquidity(),
        }
        return this.data
    }
    
}