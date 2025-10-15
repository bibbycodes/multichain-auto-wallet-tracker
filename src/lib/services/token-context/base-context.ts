import { AutoTrackerToken } from "../../models/token";
import { TokenPriceDetails, TokenSecurity } from "../../models/token/types";
import { TokenSecurityContext } from "./token-security/token-security-context";
import { RawTokenDataCache } from "../raw-data/raw-data";
import { TokenDistributionContext } from "./token-distribution/token-distribution-context";
import { BaseContextData } from "./types";
import { TokenDistributionContextData, TokenHolder } from "./token-distribution/types";
import { PriceDetailsContext } from "./price-details/price-details";

export class BaseContext {
    public tokenSecurityContext: TokenSecurityContext
    public tokenDistributionContext: TokenDistributionContext
    public priceDetailsContext: PriceDetailsContext
    constructor(
        private token: AutoTrackerToken,
        private rawData: RawTokenDataCache,
    ) {
        this.tokenSecurityContext = new TokenSecurityContext(this.rawData, this.token)
        this.tokenDistributionContext = new TokenDistributionContext(this.rawData, this.token)
        this.priceDetailsContext = new PriceDetailsContext(this.rawData)
    }

    async getTopHolders(): Promise<TokenHolder[]> {
        return await this.tokenDistributionContext.getTopHolders()
    }

    async getTokenDistribution(): Promise<TokenDistributionContextData> {
        return await this.tokenDistributionContext.toObject()
    }

    async getTokenSecurity(): Promise<TokenSecurity> {
        return await this.tokenSecurityContext.getTokenSecurity()
    }

    async getPriceDetails(): Promise<TokenPriceDetails> {
        return await this.priceDetailsContext.toObject()
    }

    async toObject(): Promise<BaseContextData> {
        // token security
        // previous alerts
        // mention history
        // Get notable wallets
        // token distribution
        // top holders
        // top traders
        // fresh wallets
        // same balance wallets
        // bundles
        // locked wallets
        const [
            tokenDistribution,
            tokenSecurity,
            priceDetails,
        ] = await Promise.all([
            this.getTokenDistribution(),
            this.getTokenSecurity(),
            this.getPriceDetails(),
        ])

        return {
            tokenDistribution,
            tokenSecurity,
            priceDetails,
            rawData: this.rawData.toObject(),
            token: this.token,
        }
    }

    static fromJson(json: string): BaseContext {
        const baseContextData = JSON.parse(json)
        return new BaseContext(baseContextData.token, new RawTokenDataCache(baseContextData.token, baseContextData.rawData))
    }

    static fromObject(baseContextData: BaseContextData): BaseContext {
        return new BaseContext(baseContextData.token, new RawTokenDataCache(baseContextData.token.address, baseContextData.token.chainId, baseContextData.rawData))
    }

    async toJson(): Promise<string> {
        const baseContextData = await this.toObject()
        return JSON.stringify(baseContextData)
    }
}