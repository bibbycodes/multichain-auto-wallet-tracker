import axios, { AxiosResponse } from 'axios';
import { sleep } from "telegram/Helpers";
import { env } from "../../../util/env/env";
import { intervalToMilliseconds } from "../utils/interval-utils";
import {
  BirdEyeHistoricalPriceDataResponse,
  BirdEyeOverviewResponse,
  BirdEyeResponse,
  BirdeyeSearchResponse,
  BirdeyeTokenListResponse,
  BirdeyeTokenMetadataResponse,
  BirdeyeTokenSecurityResponse,
  BirdeyeTrendingTokenListResponse,
  BirdTokenEyeOverview,
  CreationData,
  HistoricalPriceItem,
  MarketsResponse,
  OhlcDataResponse,
  OhlcvItem,
  BirdeyeTimeInterval,
  TokenListItem,
  TokenPriceResponse,
  TopHolder,
  TopHolderResponse,
  Trade,
  TradesResponse,
  TrendingTokenListItem,
  WalletPnlResponse
} from "./types";

export type BirdeyeChain = 'solana' | 'ethereum' | 'bsc' | 'polygon' | 'base' | 'arbitrum' | 'avalanche' | 'optimism' | 'zksync';

export class BirdEyeClient {
  private readonly apiKey: string;
  private baseUrl: string = 'https://public-api.birdeye.so';

  constructor(apiKey: string = env.birdeye.apikey) {
    this.apiKey = apiKey;
  }

  private async get<T>(url: string, apiKey: string = this.apiKey, chain?: BirdeyeChain): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'X-API-KEY': apiKey,
        'accept': 'application/json',
      };

      if (chain) {
        headers['x-chain'] = chain;
      }
      
      const response: AxiosResponse<T> = await axios.get(url, { headers });
      if (response.status !== 200) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(`Error fetching data: ${error.message}`);
    }
  }

  async getMultiplePrices(tokenAddresses: string[], chain: BirdeyeChain = 'solana'): Promise<{ [key: string]: number }> {
    if (tokenAddresses.length === 0) {
      throw new Error("Token addresses array cannot be empty");
    }

    const chunkSize = 100;
    const batches: string[][] = [];
    for (let i = 0; i < tokenAddresses.length; i += chunkSize) {
      batches.push(tokenAddresses.slice(i, i + chunkSize));
    }

    const prices: { [key: string]: number } = {};

    try {
      for (const batch of batches) {
        const formattedAddresses = batch.join(",");
        const url = `${this.baseUrl}/defi/multi_price?list_address=${encodeURIComponent(formattedAddresses)}`;
        const response = await this.get<{ data: { [key: string]: { value: number } } }>(url, this.apiKey, chain);

        for (const [address, priceData] of Object.entries(response.data)) {
          if (priceData?.value) {
            prices[address] = priceData.value;
          }
        }
      }

      return prices;
    } catch (error: any) {
      console.log(error)
      throw new Error(`Failed to fetch multiple prices: ${error.message}`);
    }
  }

  async getTokenPrice(tokenAddress: string, chain: BirdeyeChain = 'solana'): Promise<number> {
    const url = `${this.baseUrl}/defi/price?address=${encodeURIComponent(tokenAddress)}`;
    const {data} = await this.get<TokenPriceResponse>(url, this.apiKey, chain);
    return data?.value
  }

  async getTopHolders(tokenAddress: string, limit: number = 20, chain: BirdeyeChain = 'solana'): Promise<TopHolder[]> {
    const url = `${this.baseUrl}/defi/v3/token/holder?offset=0&limit=${limit}&address=${encodeURIComponent(tokenAddress)}`;
    const {data} = await this.get<TopHolderResponse>(url, this.apiKey, chain);
    return data.items.map(holder => (holder))
  }

  async getCreationData(tokenAddress: string, chain: BirdeyeChain = 'solana'): Promise<CreationData | null> {
    const url = `${this.baseUrl}/defi/token_creation_info?address=${encodeURIComponent(tokenAddress)}`;
    let {data, success} = await this.get<BirdEyeResponse<CreationData>>(url, this.apiKey, chain);
    if (!data || !success) {
      return null
    }
    data.blockUnixTime = data.blockUnixTime * 1000;
    return data
  }

  async getTokenSecurity(tokenAddress: string, chain: BirdeyeChain = 'solana'): Promise<BirdeyeTokenSecurityResponse> {
    const url = `${this.baseUrl}/defi/token_security?address=${encodeURIComponent(tokenAddress)}`;
    return await this.get<BirdeyeTokenSecurityResponse>(url, this.apiKey, chain);
  }

  async getTokenMetadata(tokenAddress: string, chain: BirdeyeChain = 'solana'): Promise<BirdeyeTokenMetadataResponse> {
    const url = `${this.baseUrl}/defi/v3/token/meta-data/single?address=${encodeURIComponent(tokenAddress)}`;
    return await this.get<BirdeyeTokenMetadataResponse>(url, this.apiKey, chain);
  }

  async getTokenPriceWithApiKey(tokenAddress: string, apiKey: string, chain: BirdeyeChain = 'solana'): Promise<number> {
    const url = `${this.baseUrl}/defi/price?address=${encodeURIComponent(tokenAddress)}`;
    const {data} = await this.get<TokenPriceResponse>(url, apiKey, chain);
    return data.value
  }

  async getOhlcData(tokenAddress: string, to: number, from: number, interval: BirdeyeTimeInterval = '30m', chain: BirdeyeChain = 'solana'): Promise<OhlcvItem[]> {
    const data = await this.get<OhlcDataResponse>(`${this.baseUrl}/defi/ohlcv?address=${encodeURIComponent(tokenAddress)}&type=${encodeURIComponent(interval)}&time_from=${from}&time_to=${to}`, this.apiKey, chain);
    return data.data.items.map(item => {
      const {unixTime, ...rest} = item;
      return {
        unixTime: unixTime * 1000,
        ...rest
      }
    });
  }

  async getAllTimeHighForTokenAfterDate(tokenAddress: string, from: Date, to: Date = new Date(), interval: BirdeyeTimeInterval = '30m', chain: BirdeyeChain = 'solana'): Promise<HistoricalPriceItem> {
    const fromInSeconds = Math.floor(from.getTime() / 1000);
    const toInSeconds = Math.floor(to.getTime() / 1000);
    const ohlcData = await this.getOhlcData(tokenAddress, toInSeconds, fromInSeconds, interval, chain);
    const allTimeHigh = ohlcData.reduce((acc, curr) => {
      if (curr.h > acc.h) {
        return curr
      }
      return acc
    }, ohlcData[0]);

    if (!allTimeHigh) {
      throw new Error('No all time high found')
    }

    const intervalInMilliseconds = intervalToMilliseconds(interval);
    const endOfAllTimeHigh = allTimeHigh.unixTime + intervalInMilliseconds;
    const startOfAllTimeHigh = allTimeHigh.unixTime - intervalInMilliseconds;
    const historyPriceData = await this.getHistoricalPriceData(tokenAddress, startOfAllTimeHigh, endOfAllTimeHigh, '1m', chain);
    const highestPriceRecord = historyPriceData.reduce((acc, curr) => {
      if (curr.value > acc.value) {
        return curr
      }
      return acc
    }, historyPriceData[0])
    return {
      value: highestPriceRecord.value,
      timestamp: highestPriceRecord.timestamp
    }
  }

  getLargestMarketCapTokens = async (limit: number, liquidityMin: number = 500, chain: BirdeyeChain = 'solana'): Promise<TokenListItem[]> => {
    const url = `${this.baseUrl}/defi/tokenlist?sort_by=mc&sort_type=desc&offset=0&limit=50&min_liquidity=1000000`;
    const {data} = await this.get<BirdeyeTokenListResponse>(url, this.apiKey, chain);
    return data.tokens;
  }

  async getTokenOverview(tokenAddress: string, timeFrames: BirdeyeTimeInterval[] = ['1h'], chain: BirdeyeChain = 'solana'): Promise<BirdTokenEyeOverview> {
    const frames = timeFrames.join(',');
    const url = `${this.baseUrl}/defi/token_overview?address=${encodeURIComponent(tokenAddress)}&frames=${encodeURIComponent(frames)}&ui_amount_mode=scaled`;

    const {data} = await this.get<BirdEyeOverviewResponse>(url, this.apiKey, chain);
    if (!data) {
      throw new Error('No data found')
    }

    return data
  }

  async getTrendingTokens(limit: number, offset: number, sortBy: 'liquidity' | 'rank' = 'liquidity', chain: BirdeyeChain = 'solana'): Promise<TrendingTokenListItem[]> {
    const url = `${this.baseUrl}/defi/token_trending?sort_by=${sortBy}&sort_type=desc&offset=${offset}&limit=${limit}`;
    const {data} = await this.get<BirdeyeTrendingTokenListResponse>(url, this.apiKey, chain);
    return data.tokens
  }

  async getTop100TrendingTokensByMarketCap(chain: BirdeyeChain = 'solana'): Promise<TrendingTokenListItem[]> {
    let offset = 0;
    let limit = 20
    let tokens: TrendingTokenListItem[] = [];
    while (offset < 100) {
      const currentTokens = await this.getTrendingTokens(limit, offset, 'liquidity', chain);
      tokens = tokens.concat(currentTokens);
      offset += limit;
      await sleep(500)
    }
    return tokens
  }

  async getTop100TrendingTokensByRank(chain: BirdeyeChain = 'solana'): Promise<TrendingTokenListItem[]> {
    let offset = 0;
    let limit = 20
    let tokens: TrendingTokenListItem[] = [];
    while (offset < 200) {
      const currentTokens = await this.getTrendingTokens(limit, offset, 'rank', chain);
      tokens = tokens.concat(currentTokens);
      offset += limit;
      await sleep(500)
    }
    return tokens
  }

  async getMarkets(tokenAddress: string, options: {
    timeFrame?: string;
    sortType?: 'asc' | 'desc';
    sortBy?: string;
    offset?: number;
    limit?: number;
    chain: BirdeyeChain;
  }): Promise<MarketsResponse> {
    const {
      timeFrame = '24h',
      sortType = 'desc',
      sortBy = 'liquidity',
      offset = 0,
      limit = 10,
      chain
    } = options;

    const url = `${this.baseUrl}/defi/v2/markets?address=${encodeURIComponent(tokenAddress)}&time_frame=${encodeURIComponent(timeFrame)}&sort_type=${encodeURIComponent(sortType)}&sort_by=${encodeURIComponent(sortBy)}&offset=${offset}&limit=${limit}`;

    return await this.get<MarketsResponse>(url, this.apiKey, chain);
  }

  

  async getTradesBetweenDates(
    tokenAddress: string, 
    afterTimestamp: number,
    beforeTimestamp: number,
    options: {
      offset?: number
      limit?: number
      sortBy?: string
      sortType?: 'asc' | 'desc'
      txType?: string
      uiAmountMode?: string
      chain?: BirdeyeChain
    } = {}
  ): Promise<TradesResponse> {
    const {
      offset = 0,
      limit = 100,
      sortBy = 'block_unix_time',
      sortType = 'desc',
      txType = 'swap',
      uiAmountMode = 'scaled',
      chain = 'solana'
    } = options
    const url = `${this.baseUrl}/defi/v3/txs?address=${encodeURIComponent(tokenAddress)}&offset=${offset}&limit=${limit}&sort_by=${encodeURIComponent(sortBy)}&sort_type=${encodeURIComponent(sortType)}&tx_type=${encodeURIComponent(txType)}&ui_amount_mode=${encodeURIComponent(uiAmountMode)}&before_time=${beforeTimestamp}&after_time=${afterTimestamp}`
    
    return await this.get<TradesResponse>(url, this.apiKey, chain)
  }

  async getAllTradesBetweenDates(
    tokenAddress: string,
    afterTimestamp: number,
    beforeTimestamp: number,
    options: {
      sortBy?: string
      sortType?: 'asc' | 'desc'
      txType?: string
      uiAmountMode?: string
      chain?: BirdeyeChain
    } = {}
  ): Promise<Trade[]> {
    const allTrades: Trade[] = []
    let offset = 0
    const limit = 100
    let hasNext = true

    while (hasNext) {
      const response = await this.getTradesBetweenDates(
        tokenAddress,
        afterTimestamp,
        beforeTimestamp,
        {
          ...options,
          sortBy: 'block_unix_time',
          sortType: 'asc',
          offset,
          limit
        }
      )

      if (response.success && response.data) {
        allTrades.push(...response.data.items)
        hasNext = response.data.has_next || false
        offset += limit
      } else {
        hasNext = false
      }
    }

    return allTrades
  }

  async getTradesSeekByTime(
    tokenAddress: string,
    options: {
      offset?: number
      limit?: number
      txType?: 'swap' | 'add' | 'remove' | 'all'
      uiAmountMode?: 'raw' | 'scaled'
      beforeTime?: number
      afterTime?: number
      chain?: BirdeyeChain
    } = {}
  ): Promise<TradesResponse> {
    const {
      offset = 0,
      limit = 100,
      txType = 'swap',
      uiAmountMode = 'scaled',
      beforeTime,
      afterTime,
      chain = 'solana'
    } = options

    let url = `${this.baseUrl}/defi/txs/token/seek_by_time?address=${encodeURIComponent(tokenAddress)}&offset=${offset}&limit=${limit}&tx_type=${encodeURIComponent(txType)}&ui_amount_mode=${encodeURIComponent(uiAmountMode)}`
    
    if (beforeTime) {
      url += `&before_time=${beforeTime}`
    }
    
    if (afterTime) {
      url += `&after_time=${afterTime}`
    }

    return await this.get<TradesResponse>(url, this.apiKey, chain)
  }

  async getWalletPnl(
    wallet: string,
    tokenAddresses: string[],
    chain: BirdeyeChain = 'solana'
  ): Promise<WalletPnlResponse> {
    const tokenAddressesParam = tokenAddresses.join(',')
    const url = `${this.baseUrl}/wallet/v2/pnl?wallet=${encodeURIComponent(wallet)}&token_addresses=${encodeURIComponent(tokenAddressesParam)}`
    return await this.get<WalletPnlResponse>(url, this.apiKey, chain)
  }

  async getHistoricalPriceData(tokenAddress: string, from: number, to: number, interval: BirdeyeTimeInterval = '5m', chain: BirdeyeChain = 'solana'): Promise<HistoricalPriceItem[]> {
    const fromInSeconds = Math.floor(from / 1000);
    const toInSeconds = Math.floor(to / 1000);
    const url = `${this.baseUrl}/defi/history_price?address=${encodeURIComponent(tokenAddress)}&address_type=token&type=${encodeURIComponent(interval)}&time_from=${fromInSeconds}&time_to=${toInSeconds}`;
    const data = await this.get<BirdEyeHistoricalPriceDataResponse>(url, this.apiKey, chain);
    return data.data.items.map(time => {
      const {timestamp, ...rest} = time;
      return {
        timestamp: timestamp * 1000,
        ...rest
      }
    });
  }

  async search(
    query: string,
    options: {
      limit?: number
      offset?: number
      chain?: BirdeyeChain
      searchBy?: 'name' | 'symbol' | 'address' | 'combination'
    } = {}
  ): Promise<BirdeyeSearchResponse> {
    const {
      limit = 20,
      offset = 0,
      chain,
      searchBy = 'address'
    } = options

    const url = `${this.baseUrl}/defi/v3/search?keyword=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}&search_by=${searchBy}`
    return await this.get<BirdeyeSearchResponse>(url, this.apiKey, chain)
  }
}
