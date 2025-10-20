import { GeckoTerminalTokenDetails, Pool, SimpleTokenPrice, Token, Trade } from "python-proxy-scraper-client"

export interface GeckoTerminaTokenDataRawData {
    tokenDetails: GeckoTerminalTokenDetails
    tokenPools: Pool[]
}