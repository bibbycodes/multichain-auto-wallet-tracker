import { ChainId, ChainsMap } from "../../../src/shared/chains"
import { TokenSecurityBuilder } from "../../../src/lib/services/token-security-builder/token-security-builder"

export const tokenSecurityBuilderTest = async (tokenAddress: string, chainId: ChainId) => {
    const tokenSecurityBuilder = new TokenSecurityBuilder(tokenAddress, chainId)
    return tokenSecurityBuilder.getTokenSecurity()
}
tokenSecurityBuilderTest('0x4444c1aC17b779b221E410a94F218f44b8862101', ChainsMap.bsc).then(console.log)