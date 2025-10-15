import { ChainId } from "shared/chains";
import { GmGnService } from "../apis/gmgn/gmgn-service";
import { GoPlusService } from "../apis/goplus/goplus-service";

export class TokenAnalyserService {
    constructor(
        private readonly goplusService: GoPlusService,
        private readonly gmgnService: GmGnService
    ) {
    }

    async shouldTrackToken(tokenAddress: string, chainId: ChainId): Promise<boolean> {
        // const tokenAnalysis = await this.getTokenAnalysis(tokenAddress, chainId)
        return true
    }

    async getTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<any> {
        
    }

    // async getTokenAnalysis(tokenAddress: string, chainId: ChainId): Promise<Partial<TokenAnalysis>> {
    //     const goPlusTokenSecurity = await this.goplusService.getTokenSecurity(tokenAddress, chainId)
    //     const gmgnTokenSecurity = await this.gmgnService.getTokenSecurity(tokenAddress, chainId)
    //     const tokenSecurity = await this.getTokenSecurity({
    //         tokenAddress,
    //         chainId,
    //         goPlusTokenSecurity,
    //         gmgnTokenSecurity
    //     })
    //     return {
    //         security: tokenSecurity
    //     }
    // }

    // async getTokenDistribution({
    //     tokenAddress,
    //     chainId,
    //     goPlusTokenSecurity,
    //     gmgnTokenSecurity
    // }: GetTokenSecurityParams): Promise<TokenHolderDistribution> {
    //     const gmgnToken = await this.gmgnService.getToken(tokenAddress, chainId)
    //     return gmgnToken.distribution
    // }

    // async getTokenSecurity({
    //     tokenAddress,
    //     chainId,
    //     goPlusTokenSecurity,
    //     gmgnTokenSecurity
    // }: GetTokenSecurityParams): Promise<TokenSecurity> {
    //     const gplusTokenSecurity = goPlusTokenSecurity ?? await this.goplusService.getTokenSecurity(tokenAddress, chainId)
    //     const gmTokenSecurity = gmgnTokenSecurity ?? await this.gmgnService.getTokenSecurity(tokenAddress, chainId)
    //     const gpPartialSecurityValues = await this.goplusService.getPartialSecurityValues(tokenAddress, chainId, gplusTokenSecurity)
    //     const gmPartialSecurityValues = await this.gmgnService.getPartialSecurityValues(tokenAddress, chainId, gmTokenSecurity)
    //     return {
    //         ...gpPartialSecurityValues,
    //         ...gmPartialSecurityValues
    //     } as TokenSecurity
    // }

    async getHolders(tokenAddress: string, chainId: ChainId): Promise<string[]> {
        const gmgnHolders = await this.gmgnService.getHolders(tokenAddress, chainId)
        return gmgnHolders.map(holder => holder.address)
    }
}
