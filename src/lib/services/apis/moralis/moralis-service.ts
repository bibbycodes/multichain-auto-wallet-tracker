import { GetWalletNetWorthOperationResponseJSON } from "@moralisweb3/common-evm-utils";
import { ChainId, ChainsMap, isEvmChainId, isSolanaChainId } from "../../../../shared/chains";
import { AutoTrackerTokenData } from "../../../models/token/types";
import { BaseTokenFetcherService } from "../../tokens/token-fetcher-types";
import { MoralisClient } from "./moralis-client";
import { MoralisMapper } from "./moralis-mapper";
import { MoralisEvmTokenMetaData, MoralisEvmTokenPrice, MoralisSolanaTokenMetadata, MoralisTokenDataWithMarketCap } from "./types";

export class MoralisService extends BaseTokenFetcherService {
  constructor(private client = new MoralisClient()) {
    super();
  }

  async createStream({
    addresses,
    webhookUrl,
    topics,
    abi

  }: {
    addresses: string[],
    webhookUrl: string,
    topics: string[],
    abi: any[]
  }) {
    const stream = await this.client.createStream({
      webhookUrl,
      description: "Monitor Addresses Swaps and Transfers",
      tag: "addresses",
      chains: [ChainsMap.bsc.toString()],
      includeNativeTxs: true,
    })

    const jsonStream = await stream.toJSON()

    await this.client.updateStream({
      id: jsonStream.id,
      abi,
      includeContractLogs: true,
      topic0: topics,
    })

    await this.client.addAddressesToStream({
      id: jsonStream.id,
      addresses
    })

    if (jsonStream.status !== 'active') {
      await this.client.resumeStream(jsonStream.id)
    }

    return jsonStream
  }

  async getWalletPortfolioDetails(address: string): Promise<GetWalletNetWorthOperationResponseJSON> {
    return (await this.client.getWalletNetWorth({ address })).toJSON()
  }

  async fetchTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<MoralisTokenDataWithMarketCap> {
    let tokenData: MoralisTokenDataWithMarketCap

    if (isEvmChainId(chainId)) {
      tokenData = await this.fetchEvmTokenWithMarketCap(tokenAddress, chainId)
    } else if (isSolanaChainId(chainId)) {
      tokenData = await this.fetchSolanaTokenWithMarketCap(tokenAddress)
    } else {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    return tokenData
  }

  async getTokenWithMarketCapFromAddress(tokenAddress: string): Promise<MoralisTokenDataWithMarketCap> {
    const tokenMetadata = await this.getTokenMetadataFromAddress(tokenAddress)
    if (!tokenMetadata.chainId) {
      throw new Error(`Could not find chainId for token address: ${tokenAddress}`)
    }

    if (!tokenMetadata.token) {
      throw new Error(`Could not fetch token data for token address: ${tokenAddress}`)
    }

    const tokenPrice = await this.client.getEvmTokenPrice(tokenAddress, tokenMetadata.chainId)
    const tokenData = MoralisMapper.mapEvmTokenMetadataToTokenDataWithMarketCap(tokenMetadata.chainId, tokenMetadata.token as MoralisEvmTokenMetaData, tokenPrice as unknown as MoralisEvmTokenPrice)
    return {
      token: tokenData, rawData: {
        tokenMetadata: tokenMetadata.token,
        tokenPrice
      }
    }
  }

  private async fetchEvmTokenWithMarketCap(tokenAddress: string, chainId: ChainId): Promise<MoralisTokenDataWithMarketCap> {
    const tokenMetadata = await this.client.getTokenMetadata({ address: tokenAddress, chainId })
    const tokenPrice = await this.client.getEvmTokenPrice(tokenAddress, chainId)
    return {
      token: MoralisMapper.mapEvmTokenMetadataToTokenDataWithMarketCap(chainId, tokenMetadata as MoralisEvmTokenMetaData, tokenPrice as unknown as MoralisEvmTokenPrice), rawData: {
        tokenMetadata,
        tokenPrice
      }
    }
  }

  private async getEvmTokenWithMarketCapFromAddress(tokenAddress: string): Promise<MoralisTokenDataWithMarketCap> {
    const supportedChains = MoralisMapper.getSupportedChains()
    const promises = supportedChains.map(async (chainId) => ({
      token: await this.fetchEvmTokenWithMarketCap(tokenAddress, chainId),
      chainId
    }))
    const results = await Promise.allSettled(promises)
    type ReturnType = PromiseFulfilledResult<{ token: MoralisTokenDataWithMarketCap, chainId: ChainId }>
    const successfulResult = results.find((r): r is ReturnType =>
      r.status === 'fulfilled'
    )
    return (successfulResult as ReturnType)?.value.token
  }

  private async getTokenMetadataFromAddress(tokenAddress: string): Promise<{ token: MoralisEvmTokenMetaData | MoralisSolanaTokenMetadata, chainId: ChainId | null }> {
    const supportedChains = MoralisMapper.getSupportedChains()
    const promises = supportedChains.map(async (chainId) => ({
      token: await this.client.getTokenMetadata({ address: tokenAddress, chainId }),
      chainId
    }))

    const results = await Promise.allSettled(promises)
    const successfulResult = results.find((r): r is PromiseFulfilledResult<{ token: MoralisEvmTokenMetaData | MoralisSolanaTokenMetadata, chainId: ChainId }> =>
      r.status === 'fulfilled'
    )
    if (!successfulResult) {
      throw new Error(`Could not fetch token metadata for token address: ${tokenAddress}`)
    }
    return successfulResult.value
  }

  private async fetchSolanaTokenWithMarketCap(tokenAddress: string): Promise<MoralisTokenDataWithMarketCap> {
    const tokenMetadata = await this.client.getSolanaTokenMetadata({ address: tokenAddress })
    const tokenPrice = await this.client.getSolanaTokenPrice(tokenAddress)
    const pairs = await this.client.getSolanaPairsForToken({ address: tokenAddress })
    const highestLiquidityPair = pairs.sort((a, b) => b.liquidityUsd - a.liquidityUsd)[0]
    return {
      token: MoralisMapper.mapSolanaTokenMetadataToTokenDataWithMarketCap(tokenMetadata as unknown as MoralisSolanaTokenMetadata, tokenPrice, highestLiquidityPair), rawData: {
        tokenMetadata,
        tokenPrice
      }
    }
  }

  async fetchTokenData(tokenAddress: string, chainId: ChainId): Promise<AutoTrackerTokenData> {
    const tokenWithMarketCap = await this.fetchTokenWithMarketCap(tokenAddress, chainId)
    return tokenWithMarketCap.token
  }
}
