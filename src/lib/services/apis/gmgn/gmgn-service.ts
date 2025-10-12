import { GmGnClient, GmGnEvmTokenSecurity, GmGnMultiWindowTokenInfo, GmGnSmartMoneyWalletData, GmGnSolanaTokenSecurity, GmGnTokenSecurityAndLaunchpad, GmGnTokenSocials, GmGnTopHolder, GmGnTopTrader, GmGnTrendingTokenResponse, GmGnWalletHoldings } from "python-proxy-scraper-client"
import { ChainId, isEvmChainId, isSolanaChainId } from "../../../../shared/chains"
import { withRetryOrFail } from "../../../../utils/fetch"
import { TokenData, TokenSecurity } from "../../../models/token/types"
import { GmGnMapper } from "./gmgn-mapper"
import { BaseTokenFetcherService } from "../../tokens/token-fetcher-types"
import { GmGnTokenDataWithMarketCap } from "./types"

export class GmGnService extends BaseTokenFetcherService {
  public static readonly SUPPORTED_CHAIN_IDS = GmGnMapper.getSupportedChains()
  constructor(private gmgnClient: GmGnClient = new GmGnClient()) {
    super()
  }

  async getTrendingTokens(chainId: ChainId, timeframe: '1h' | '24h' = '1h'): Promise<GmGnTrendingTokenResponse> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getTrendingTokens(chain, timeframe))
  }

  async getTokenSecurity(tokenAddress: string, chainId: ChainId): Promise<GmGnTokenSecurityAndLaunchpad> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getTokenSecurityAndLaunchpad(tokenAddress, chain))
  }

  async getPartialSecurityValues(tokenAddress: string, chainId: ChainId, tokenSecurity?: GmGnTokenSecurityAndLaunchpad): Promise<Partial<TokenSecurity>> {
    let isFreezable = false
    let isHoneypot = false
    let isMintable = false
    let isLpTokenBurned = true
    let buyTax = 0
    let sellTax = 0
    let isBlacklist = false
    const gmTokenSecurity = tokenSecurity ?? await this.getTokenSecurity(tokenAddress, chainId)
    
    if (isEvmChainId(chainId)) {
      const gmgnEvmTokenSecurity = gmTokenSecurity.security as GmGnEvmTokenSecurity
      const burnRatio = gmgnEvmTokenSecurity.burn_ratio
      isLpTokenBurned = Number(burnRatio) > 0.9
      isBlacklist = gmgnEvmTokenSecurity.is_blacklist ?? gmgnEvmTokenSecurity.blacklist === 1
      isHoneypot = gmgnEvmTokenSecurity.is_honeypot
      isMintable = !gmgnEvmTokenSecurity.is_renounced
      isFreezable = !gmgnEvmTokenSecurity.is_renounced
      buyTax = Number(gmgnEvmTokenSecurity.buy_tax)
      sellTax = Number(gmgnEvmTokenSecurity.sell_tax)
    }

    if (isSolanaChainId(chainId)) {
      const gmgnSolanaTokenSecurity = gmTokenSecurity.security as GmGnSolanaTokenSecurity
      isFreezable = !gmgnSolanaTokenSecurity.renounced_freeze_account
      isHoneypot = gmgnSolanaTokenSecurity.is_honeypot ?? false
      isMintable = !gmgnSolanaTokenSecurity.renounced_mint
      isLpTokenBurned = gmgnSolanaTokenSecurity.burn_status === "burned"
      buyTax = Number(gmgnSolanaTokenSecurity.buy_tax)
      sellTax = Number(gmgnSolanaTokenSecurity.sell_tax)
    }

    return {
      isFreezable,
      isHoneypot,
      isMintable,
      isLpTokenBurned,
      buyTax,
      sellTax,
      isBlacklist
    }
  }

  async getTopTraders(tokenAddress: string, chainId: ChainId): Promise<GmGnTopTrader[]> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getTopTraders(tokenAddress, chain))
  }

  async getTopHolders(tokenAddress: string, chainId: ChainId): Promise<GmGnTopHolder[]> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getTopHolders(tokenAddress, chain))
  }

  async getWalletData(walletAddress: string, chainId: ChainId): Promise<GmGnSmartMoneyWalletData> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getSmartMoneyWalletData(walletAddress, chain))
  }

  async getWalletHoldings(walletAddress: string, chainId: ChainId): Promise<GmGnWalletHoldings> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getWalletHoldings(walletAddress, chain))
  }

  async getMultiWindowTokenInfo(tokenAddress: string, chainId: ChainId): Promise<GmGnMultiWindowTokenInfo> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    const res = await withRetryOrFail(() => this.gmgnClient.getMultiWindowTokenInfo([tokenAddress], chain))
    return res[0]
  }

  async getTokenAndSocialsByTokenAddressAndChainId(tokenAddress: string, chainId: ChainId): Promise<{
    token: GmGnMultiWindowTokenInfo
    socials: GmGnTokenSocials
  }> {
    const [gmGnToken, socials] = await Promise.all([
      this.getMultiWindowTokenInfo(tokenAddress, chainId),
      this.getTokenSocials(tokenAddress, chainId),
    ])
    return { token: gmGnToken, socials }
  }

  async getTokenAndSocialsByTokenAddress(tokenAddress: string): Promise<{
    token: GmGnMultiWindowTokenInfo
    socials: GmGnTokenSocials,
    chainId: ChainId
  }> {
    const { token, chainId } = await this.getTokenAndChainId(tokenAddress)
    const socials = await this.getTokenSocials(tokenAddress, chainId)
    return {token, socials, chainId}
  }

  async getTokenAndChainId(tokenAddress: string): Promise<{token: GmGnMultiWindowTokenInfo, chainId: ChainId}> {
    const supportedChains = GmGnMapper.getSupportedChains()
    const promises = supportedChains.map(chainId => 
      this.getMultiWindowTokenInfo(tokenAddress, chainId).then(token => ({ token, chainId }))
    )
    const results = await Promise.allSettled(promises)
    const successfulResult = results.find((r): r is PromiseFulfilledResult<{token: GmGnMultiWindowTokenInfo, chainId: ChainId}> => 
      r.status === 'fulfilled'
    )
    
    if (!successfulResult) {
      throw new Error(`No GMGN token found for token address: ${tokenAddress}`)
    }
    
    return successfulResult.value
  }

  async fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<GmGnTokenDataWithMarketCap> {
    const [gmGnToken, socials] = await Promise.all([
      this.getMultiWindowTokenInfo(tokenAddress, chainId),
      this.getTokenSocials(tokenAddress, chainId),
    ])
    
    const tokenData = GmGnMapper.mapGmGnTokenToTokenDataWithMarketCap(gmGnToken, socials, chainId)
    
    this.validateTokenDataWithMarketCap(tokenData)
    
    return {
      token: tokenData,
      rawData: {
        tokenInfo: gmGnToken,
        socials
      }
    }
  }

  async fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<TokenData> {
    const [gmGnToken, socials] = await Promise.all([
      this.getMultiWindowTokenInfo(tokenAddress, chainId),
      this.getTokenSocials(tokenAddress, chainId),
    ])
    
    return GmGnMapper.mapGmGnTokenToTokenDataWithMarketCap(gmGnToken, socials, chainId)
  }

  async getTokenSocials(tokenAddress: string, chainId: ChainId): Promise<GmGnTokenSocials> {
    const chain = GmGnMapper.chainIdToChain(chainId)
    return withRetryOrFail(() => this.gmgnClient.getTokenSocials(tokenAddress, chain))
  }
}