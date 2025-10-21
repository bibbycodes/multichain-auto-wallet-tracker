import { ChainId } from "../../../shared/chains"
import { AutoTrackerTokenData, TokenDataWithMarketCap } from "../../models/token/types"
import { Singleton } from "../util/singleton"

export interface TokenFetcherService {
    fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<{token: TokenDataWithMarketCap, rawData: any}>
    fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<AutoTrackerTokenData>
    // fetchPriceDetails(tokenAddress: string, chainId: ChainId): Promise<TokenPriceDetails>
    // fetchVolumeDetails(tokenAddress: string, chainId: ChainId): Promise<VolumeDetails>
    // fetchTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<TokenSecurity>
    // fetchTokenHolderDistribution(tokenAddress: string, chainId: ChainId): Promise<TokenHolderDistribution>
}

export abstract class BaseTokenFetcherService extends Singleton implements TokenFetcherService {
    abstract fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<{token: TokenDataWithMarketCap, rawData: any}>
    abstract fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<AutoTrackerTokenData>
}