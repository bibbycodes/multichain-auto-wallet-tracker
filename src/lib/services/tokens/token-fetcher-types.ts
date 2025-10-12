import { ChainId } from "../../../shared/chains"
import { TokenDataWithMarketCap, TokenPriceDetails, VolumeDetails, TokenSecurity, TokenHolderDistribution, TokenData } from "../../models/token/types"
import { Singleton } from "../util/singleton"

export interface TokenFetcherService {
    fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<{token: TokenDataWithMarketCap, rawData: any}>
    fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<TokenData>
    // fetchPriceDetails(tokenAddress: string, chainId: ChainId): Promise<TokenPriceDetails>
    // fetchVolumeDetails(tokenAddress: string, chainId: ChainId): Promise<VolumeDetails>
    // fetchTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<TokenSecurity>
    // fetchTokenHolderDistribution(tokenAddress: string, chainId: ChainId): Promise<TokenHolderDistribution>
}

export abstract class BaseTokenFetcherService extends Singleton implements TokenFetcherService {
    abstract fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<{token: TokenDataWithMarketCap, rawData: any}>

    protected validateTokenDataWithMarketCap(data: TokenDataWithMarketCap): void {
        const missingFields: string[] = []

        // Validate required string fields
        if (!data.address || typeof data.address !== 'string') missingFields.push('address')
        if (!data.name || typeof data.name !== 'string') missingFields.push('name')
        if (!data.symbol || typeof data.symbol !== 'string') missingFields.push('symbol')
        if (!data.chainId || typeof data.chainId !== 'string') missingFields.push('chainId')
        if (!data.pairAddress || typeof data.pairAddress !== 'string') missingFields.push('pairAddress')

        // Validate required number fields
        if (typeof data.decimals !== 'number' || data.decimals < 0) missingFields.push('decimals')
        if (typeof data.totalSupply !== 'number' || data.totalSupply < 0) missingFields.push('totalSupply')
        if (typeof data.price !== 'number' || data.price < 0) missingFields.push('price')
        if (typeof data.marketCap !== 'number' || data.marketCap < 0) missingFields.push('marketCap')
        if (typeof data.liquidity !== 'number' || data.liquidity < 0) missingFields.push('liquidity')

        // Validate socials object exists
        if (!data.socials || typeof data.socials !== 'object') missingFields.push('socials')

        if (missingFields.length > 0) {
            throw new Error(
                `Invalid TokenDataWithMarketCap for ${data.address || 'unknown'}: missing or invalid fields: ${missingFields.join(', ')}`
            )
        }
    }

    abstract fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<TokenData>
}