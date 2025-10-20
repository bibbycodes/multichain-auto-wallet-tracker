import { GoPlusClient, GoPlusSolanaTokenSecurity, GoPlusSolanaTokenSecurityResponse, GoPlusTokenSecurity, TokenSecurityResponse, GoPlusRugpullDetection } from "python-proxy-scraper-client"
import { ChainId, isEvmChainId, isSolanaChainId } from "../../../../shared/chains"
import { TokenSecurity } from "../../../models/token/types"
import { Singleton } from "../../util/singleton"

export class GoPlusService extends Singleton {
    constructor(

        private readonly goplusClient: GoPlusClient
    ) {
        super()
    }

    async getTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<GoPlusTokenSecurity | GoPlusSolanaTokenSecurity> {
        let tokenSecurity
        if (isEvmChainId(chainId)) {
            const response = await this.goplusClient.getTokenSecurity(tokenAddress, Number(chainId))
            tokenSecurity = response.result[tokenAddress]
        } else {
            const response = await this.goplusClient.getSolanaTokenSecurity(tokenAddress)
            tokenSecurity = response.result[tokenAddress]
        }
        return tokenSecurity
    }

    async getPartialSecurityValues(tokenAddress: string, chainId: ChainId, tokenSecurity?: GoPlusTokenSecurity | GoPlusSolanaTokenSecurity): Promise<Partial<TokenSecurity>> {
        const gplusTokenSecurity = tokenSecurity ?? await this.getTokenSecurity(tokenAddress, chainId)
        let isFreezable = false
        let isHoneypot = false
        let isMintable = false
        let isLpTokenBurned = true
        let isPausable = false
        let sellTax = 0
        let isBlacklist = false

        if (isEvmChainId(chainId)) {
            const goPlusEvmTokenSecurity = gplusTokenSecurity as GoPlusTokenSecurity
            sellTax = Number(goPlusEvmTokenSecurity.sell_tax)
            isPausable = Boolean(goPlusEvmTokenSecurity.transfer_pausable)
            isLpTokenBurned = Number(goPlusEvmTokenSecurity.lp_total_supply) === 0
        }

        if (isSolanaChainId(chainId)) {
            const goPlusSolanaTokenSecurity = gplusTokenSecurity as GoPlusSolanaTokenSecurity
            isPausable = Boolean(goPlusSolanaTokenSecurity.closable.authority.some(authority => Boolean(authority.address)))
            isFreezable = Boolean(goPlusSolanaTokenSecurity.freezable.authority.some(authority => Boolean(authority.address)))
            isMintable = Boolean(goPlusSolanaTokenSecurity.mintable.authority.some(authority => Boolean(authority.address)))
            isBlacklist = Boolean(!goPlusSolanaTokenSecurity.trusted_token)
        }

        return {
            isFreezable,
            isHoneypot,
            isMintable,
            isPausable,
            isLpTokenBurned,
            sellTax,
            isBlacklist
        }
    }

    async getRugpullDetection(tokenAddress: string, chainId: ChainId): Promise<GoPlusRugpullDetection> {
        return this.goplusClient.getRugpullDetection(Number(chainId), tokenAddress);
    }
}
