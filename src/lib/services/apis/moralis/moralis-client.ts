import axios, { AxiosResponse } from "axios";
import Moralis from "moralis";
import { ChainId, ChainsMap, isEvmChainId, isSolanaChainId } from "../../../../shared/chains";
import { env } from "../../util/env/env";
import { toHex } from "./moralis-utils";
import { CreateStreamParams, MoralisEvmTokenMetaData, MoralisSolanaTokenMetadata, MoralisSolanaTokenPrice, MoralisEvmTokenPrice, MoralisSolanaTokenPairResponseData } from "./types";

export class MoralisClient {
  private isInitialized = false;
  private evmBaseUrl: string = 'https://deep-index.moralis.io/api/v2.2/';
  private solanaBaseUrl: string = 'https://solana-gateway.moralis.io';
  constructor(private apiKey: string = env.moralis.apiKey) {
  }

  isStarted() {
    return this.isInitialized
  }
  
  async init() {
    if (this.isStarted()) {
      return;
    }

    await Moralis.start({
      apiKey: this.apiKey,
    });

    this.isInitialized = true;
  }

  private async get<T>(url: string, params: Record<string, any> = {}): Promise<T> {
    const response: AxiosResponse<T> = await axios.get(url, { ...this.getApiOptions(), params });
    return response.data;
  }

  private async makeEvmRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const url = `${this.evmBaseUrl}${endpoint}`;
      return this.get<T>(url, params);
    } catch (err) {
      console.error('Error making GET request:', err);
      throw err;
    }
  }

  private async makeSolanaRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = `${this.solanaBaseUrl}${endpoint}`;
    return this.get<T>(url, params);
  }
  
  async createStream({
                       webhookUrl,
                       description,
                       tag,
                       chains,
                       includeNativeTxs,
                     }: CreateStreamParams) {
    await this.init();
    return Moralis.Streams.add({
      webhookUrl,
      description,
      tag,
      chains,
      includeNativeTxs,
    });
  }

  async updateStream({
                       id,
                       abi,
                       includeContractLogs,
                       topic0,
                       description,
                     }: {
    id: string;
    abi: any[];
    topic0: string[];
    includeContractLogs?: boolean;
    description?: string;
  }) {
    await this.init();
    return Moralis.Streams.update({
      id,
      abi,
      includeContractLogs,
      topic0,
      description,
    });
  }

  async deleteStream(id: string) {
    await this.init();
    return Moralis.Streams.delete({
      id,
    });
  }

  async addAddressesToStream({
                               id,
                               addresses,
                             }: {
    id: string;
    addresses: string[];
  }) {
    await this.init();
    return Moralis.Streams.addAddress({
      id,
      address: addresses,
    });
  }

  async pauseStream(id: string) {
    await this.init();
    return Moralis.Streams.updateStatus({
      id,
      status: "paused",
    });
  }

  async resumeStream(id: string) {
    await this.init();
    return Moralis.Streams.updateStatus({
      id,
      status: "active",
    });
  }

  async getTopTradersForToken({
                                address,
                                chainId,
                              }: {
    address: string;
    chainId: ChainId;
  }) {
    await this.init();
    return Moralis.EvmApi.token.getTopProfitableWalletPerToken({
      address: address,
      chain: this.getEvmChainId(chainId),
      days: 'all'
    });
  }
  
  async getTopHoldersForToken({
                                address,
                                chainId,
                              }: {
    address: string;
    chainId: ChainId;
  }) {
    const endpoint = `erc20/${address}/owners`;
    const params = {
      chain: this.getEvmChainId(chainId),
      order: 'DESC',
      page_size: 100,
    };
    return this.makeEvmRequest(endpoint, params);  // 
  }

  async getWalletPnlSummary({address, chainId}: { address: string, chainId: ChainId }) {
    await this.init()
    return Moralis.EvmApi.wallets.getWalletProfitabilitySummary({
      chain: this.getEvmChainId(chainId),
      address
    });
  }

  async getSolanaTokenPrice(tokenAddress: string): Promise<MoralisSolanaTokenPrice> {
    await this.init();

    const response = Moralis.SolApi.token.getTokenPrice({
      "network": "mainnet",
      "address": tokenAddress
    });
    return (await response).toJSON() as MoralisSolanaTokenPrice;
  }

  async getEvmTokenPrice(tokenAddress: string, chainId: ChainId): Promise<MoralisEvmTokenPrice> {
    await this.init();
    const response = Moralis.EvmApi.token.getTokenPrice({
      chain: this.getEvmChainId(chainId),
      address: tokenAddress
    });
    return (await response).toJSON() as unknown as MoralisEvmTokenPrice;
  } 
  

  async getTokenMetadata({address, chainId}: { address: string, chainId: ChainId }) : Promise<MoralisEvmTokenMetaData | MoralisSolanaTokenMetadata> {
    if (isEvmChainId(chainId)) {
      const data = await this.getEvmTokenMetadata({address, chainId})
      return (data as any).toJSON()[0]
    } else if (isSolanaChainId(chainId)) {
      const data = await this.getSolanaTokenMetadata({address})
      return data
    } else {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }
  }

  async getEvmTokenMetadata({address, chainId}: { address: string, chainId: ChainId }) {
    await this.init()
    return Moralis.EvmApi.token.getTokenMetadata({
      addresses: [address],
      chain: this.getEvmChainId(chainId)
    });
  }

  async getSolanaTokenMetadata({address}: { address: string }): Promise<MoralisEvmTokenMetaData> {
    await this.init()
    return this.makeSolanaRequest<MoralisEvmTokenMetaData>(`/token/mainnet/${address}/metadata`);
  }

  async getSolanaPairsForToken({address}: { address: string }): Promise<MoralisSolanaTokenPairResponseData[]> {
    await this.init()
    const res = await this.makeSolanaRequest<any>(`/token/mainnet/${address}/pairs?sort=liquidity`);
    return res.pairs as MoralisSolanaTokenPairResponseData[]
  }

  async getWalletNetWorth({address}: { address: string }) {
    await this.init()
    return Moralis.EvmApi.wallets.getWalletNetWorth({
      excludeSpam: true,
      excludeUnverifiedContracts: true,
      address
    });
  }

  async getWalletTokenBalances({address, chainId}: { address: string, chainId: ChainId }) {
    await this.init()
    return Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: this.getEvmChainId(chainId),
      address
    });
  }
  
  async getSnipersForToken({ address, chainId, blocksAfterCreation = 3 }: { address: string, chainId: ChainId, blocksAfterCreation: number }) {
    const endpoint = `pairs/${address}/snipers`;
    const params = {
      chain: this.getEvmChainId(chainId),
      blocksAfterCreation,
    };
    return this.makeEvmRequest(endpoint, params);  // Use the generic get method for this specific endpoint
  }

  getEvmChainId(chain: ChainId) {
    return toHex(Number(chain));
  }
  
  getApiOptions() {
    return {
      headers: {
        accept: 'application/json',
        'X-API-Key': this.apiKey,
      },
    };
  }
}