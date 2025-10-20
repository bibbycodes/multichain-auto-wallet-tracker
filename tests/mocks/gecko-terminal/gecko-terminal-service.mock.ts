import { GeckoTerminalTokenDetails, Pool, SimpleTokenPrice, Token, Trade } from "python-proxy-scraper-client";

// Import fixture data
const tokenDetailsFixture = require("../../fixtures/gecko-terminal/tokenDetails-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json");
const tokenPoolsFixture = require("../../fixtures/gecko-terminal/tokenPools-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json");

export class GeckoTerminalServiceMock {
    // Mock methods using real fixture data
    getTokenDetails = jest.fn().mockResolvedValue(tokenDetailsFixture as unknown as GeckoTerminalTokenDetails);

    getTokenPrice = jest.fn().mockResolvedValue({
        price: "0.000006559165138",
        price_usd: "0.000006559165138",
        price_native_currency: "0.00000000570977849001069"
    } as unknown as SimpleTokenPrice);

    getTrendingPools = jest.fn().mockResolvedValue(tokenPoolsFixture as unknown as Pool[]);

    getTokenPools = jest.fn().mockResolvedValue(tokenPoolsFixture as unknown as Pool[]);

    getPoolInfo = jest.fn().mockResolvedValue([] as Token[]);

    getTrades = jest.fn().mockResolvedValue([] as Trade[]);

    // Static method to get instance (following Singleton pattern)
    static getInstance(): GeckoTerminalServiceMock {
        return new GeckoTerminalServiceMock();
    }
}
