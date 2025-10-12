import { TokenSecurity } from "lib/services/token-analyser"
import { ChainId, isEvmChainId, isSolanaChainId } from "shared/chains"
import { GoPlusClient } from "./goplus-client"
import { SolanaTokenSecurityInfo, TokenSecurityInfo } from "./types"
export class GoPlusService {
    constructor(
        private readonly goplusClient: GoPlusClient
    ) {
    }

    async getTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<TokenSecurityInfo | SolanaTokenSecurityInfo> {
        let tokenSecurity
        if (isEvmChainId(chainId)) {
            tokenSecurity = await this.goplusClient.getEvmTokenSecurity(chainId, tokenAddress)
        } else {
            tokenSecurity = await this.goplusClient.getSolanaTokenSecurity(tokenAddress)
        }
        return tokenSecurity
    }

    async getPartialSecurityValues(tokenAddress: string, chainId: ChainId, tokenSecurity?: TokenSecurityInfo | SolanaTokenSecurityInfo): Promise<Partial<TokenSecurity>> {
        const gplusTokenSecurity = tokenSecurity ?? await this.getTokenSecurity(tokenAddress, chainId)
        let isFreezable = false
        let isHoneypot = false
        let isMintable = false
        let isLpTokenBurned = true
        let isPausable = false
        let sellTax = 0
        let isBlacklist = false

        if (isEvmChainId(chainId)) {
            const goPlusEvmTokenSecurity = gplusTokenSecurity as TokenSecurityInfo
            sellTax = Number(goPlusEvmTokenSecurity.sell_tax)
            isPausable = Boolean(goPlusEvmTokenSecurity.transfer_pausable)
            isLpTokenBurned = Number(goPlusEvmTokenSecurity.lp_total_supply) === 0
        }

        if (isSolanaChainId(chainId)) {
            const goPlusSolanaTokenSecurity = gplusTokenSecurity as SolanaTokenSecurityInfo
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
}
