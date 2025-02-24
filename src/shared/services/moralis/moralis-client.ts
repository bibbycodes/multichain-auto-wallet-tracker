import Moralis from "moralis";
import {env} from "../../env";
import {CreateStreamParams} from "../../../shared/services/moralis/types";
import {ChainId, ChainToId} from "../../../shared/chains";
import {toHex} from "./moralis-utils";
import axios, {AxiosResponse} from "axios";

export class MoralisClient {
  private isInitialized = false;
  private BaseUrl: string = 'https://deep-index.moralis.io/api/v2.2/';

  constructor(private apiKey: string = env.moralis.apikey) {
  }

  async init() {
    if (this.isInitialized) {
      return;
    }

    await Moralis.start({
      apiKey: this.apiKey,
    });

    this.isInitialized = true;
  }

  private async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const url = `${this.BaseUrl}${endpoint}`;
      const response: AxiosResponse<T> = await axios.get(url, { ...this.getApiOptions(), params });
      return response.data;  // Return the data from the response
    } catch (err) {
      console.error('Error making GET request:', err);
      throw err;
    }
  }

  isStarted() {
    return this.isInitialized
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
      chain: this.getChainId(chainId),
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
      chain: this.getChainId(chainId),
      order: 'DESC',
      page_size: 100,
    };
    return this.get(endpoint, params);  // 
  }

  async getWalletPnlSummary({address, chainId}: { address: string, chainId: ChainId }) {
    await this.init()
    return Moralis.EvmApi.wallets.getWalletProfitabilitySummary({
      chain: this.getChainId(chainId),
      address
    });
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
      chain: this.getChainId(chainId),
      address
    });
  }
  
  async getSnipersForToken({ address, chainId, blocksAfterCreation = 3 }: { address: string, chainId: ChainId, blocksAfterCreation: number }) {
    const endpoint = `pairs/${address}/snipers`;
    const params = {
      chain: this.getChainId(chainId),
      blocksAfterCreation,
    };
    return this.get(endpoint, params);  // Use the generic get method for this specific endpoint
  }

  getChainId(chain: ChainId) {
    return toHex(chain);
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

const moralis = new MoralisClient();
moralis.getTopHoldersForToken({address: '0x98d0baa52b2D063E780DE12F615f963Fe8537553', chainId: ChainToId.base}).then((r) => console.log(JSON.stringify(r))).catch(console.error);
