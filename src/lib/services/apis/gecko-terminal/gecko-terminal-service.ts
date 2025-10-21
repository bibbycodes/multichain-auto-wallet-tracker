import { GeckoTerminalApiClient, GeckoTerminalTokenDetails, Pool, SimpleTokenPrice, Token, Trade } from "python-proxy-scraper-client";
import { ChainId } from "../../../../shared/chains";
import { GeckoTerminalMapper } from "./gecko-terminal-mapper";
import { Singleton } from "../../util/singleton";

export class GeckoTerminalService extends Singleton {
    constructor(
        private readonly geckoTerminalApiClient: GeckoTerminalApiClient = new GeckoTerminalApiClient()
    ) {
        super()
    }

    async getTokenDetails(tokenAddress: string, chain: ChainId): Promise<GeckoTerminalTokenDetails> {
        const chainId = GeckoTerminalMapper.chainIdToGeckoTerminalChainId(chain)
        return this.geckoTerminalApiClient.getTokenDetails(chainId, tokenAddress)
    }

    async getTokenPrice(tokenAddress: string, chain: ChainId): Promise<SimpleTokenPrice> {
        const chainId = GeckoTerminalMapper.chainIdToGeckoTerminalChainId(chain)
        return this.geckoTerminalApiClient.getTokenPrice(chainId, tokenAddress)
    }

    async getTrendingPools(chain: ChainId): Promise<Pool[]> {
        const chainId = GeckoTerminalMapper.chainIdToGeckoTerminalChainId(chain)
        return this.geckoTerminalApiClient.getTrendingPools(chainId)
    }

    async getTokenPools(tokenAddress: string, chain: ChainId): Promise<Pool[]> {
        const chainId = GeckoTerminalMapper.chainIdToGeckoTerminalChainId(chain)
        return this.geckoTerminalApiClient.getTokenPools(chainId, tokenAddress)
    }

    async getPoolInfo(poolAddress: string, chain: ChainId): Promise<Token[]> {
        const chainId = GeckoTerminalMapper.chainIdToGeckoTerminalChainId(chain)
        return this.geckoTerminalApiClient.getPoolInfo(chainId, poolAddress)
    }

    async getTrades(poolAddress: string, chain: ChainId): Promise<Trade[]> {
        const chainId = GeckoTerminalMapper.chainIdToGeckoTerminalChainId(chain)
        return this.geckoTerminalApiClient.getTrades(chainId, poolAddress)
    }   
}