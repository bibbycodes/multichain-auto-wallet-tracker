import axios, {AxiosResponse} from 'axios';
import {
  BirdEyeHistoricalPriceDataResponse,
  BirdEyeResponse,
  BirdeyeTokenListResponse,
  BirdeyeTrendingTokenListResponse,
  CreationData,
  HistoricalPriceItem,
  OhlcDataResponse,
  OhlcvItem,
  TimeInterval,
  TokenListItem,
  TokenPriceResponse,
  TrendingTokenListItem
} from "./types";
import {env} from "../../../util/env/env";
import {sleep} from "../../../../../utils/async";

export class BirdEyeClient {
  private readonly apiKey: string;
  private baseUrl: string = 'https://public-api.birdeye.so';

  constructor(apiKey: string = env.birdeye.apikey) {
    this.apiKey = apiKey;
  }

  private async get<T>(url: string, apiKey: string = this.apiKey): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(url, {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      if (response.status !== 200) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(`Error fetching data: ${error.message}`);
    }
  }

  async getMultiplePrices(tokenAddresses: string[]): Promise<{ [key: string]: number }> {
    if (tokenAddresses.length === 0) {
      throw new Error("Token addresses array cannot be empty");
    }

    tokenAddresses = Array.from(new Set(tokenAddresses.map(address => {
      // TODO function to get wrapped version of native token for chain
      // if (address === SOL_ADDRESS) {
      //   return WRAPPED_SOL_ADDRESS
      // }
      return address
    })))

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
        const response = await this.get<{ data: { [key: string]: { value: number } } }>(url);

        for (const [address, priceData] of Object.entries(response.data)) {
          prices[address] = priceData.value;
        }
      }

      return prices;
    } catch (error: any) {
      throw new Error(`Failed to fetch multiple prices: ${error.message}`);
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<number> {
    // if (tokenAddress === SOL_ADDRESS) {
    //   tokenAddress = WRAPPED_SOL_ADDRESS
    // }
    const url = `${this.baseUrl}/defi/price?address=${tokenAddress}`;
    const {data} = await this.get<TokenPriceResponse>(url);
    return data?.value
  }

  async getCreationData(tokenAddress: string): Promise<CreationData | null> {
    const url = `${this.baseUrl}/defi/token_creation_info?address=${tokenAddress}`;
    let {data, success} = await this.get<BirdEyeResponse<CreationData>>(url);
    if (!data || !success) {
      return null
    }
    data.blockUnixTime = data.blockUnixTime * 1000;
    return data
  }


  async getTokenPriceWithApiKey(tokenAddress: string, apiKey: string): Promise<number> {
    const url = `${this.baseUrl}/defi/price?address=${tokenAddress}`;
    const {data} = await this.get<TokenPriceResponse>(url, apiKey);
    return data.value
  }

  async getOhlcData(tokenAddress: string, to: number, from: number, interval: TimeInterval = '30m'): Promise<OhlcvItem[]> {
    const data = await this.get<OhlcDataResponse>(`${this.baseUrl}/defi/ohlcv?address=${tokenAddress}&type=${interval}&time_from=${from}&time_to=${to}`);
    return data.data.items.map(item => {
      const {unixTime, ...rest} = item;
      return {
        unixTime: unixTime * 1000,
        ...rest
      }
    });
  }

  async getAllTimeHighForTokenAfterDate(tokenAddress: string, from: Date, to: Date = new Date(), interval: TimeInterval = '30m'): Promise<HistoricalPriceItem> {
    const fromInSeconds = Math.floor(from.getTime() / 1000);
    const toInSeconds = Math.floor(to.getTime() / 1000);
    const ohlcData = await this.getOhlcData(tokenAddress, toInSeconds, fromInSeconds);
    const allTimeHigh = ohlcData.reduce((acc, curr) => {
      if (curr.h > acc.h) {
        return curr
      }
      return acc
    }, ohlcData[0]);

    if (!allTimeHigh) {
      throw new Error('No all time high found')
    }

    const intervalInMilliseconds = this.intervalToMilliseconds(interval);
    const endOfAllTimeHigh = allTimeHigh.unixTime + intervalInMilliseconds;
    const startOfAllTimeHigh = allTimeHigh.unixTime - intervalInMilliseconds;
    const historyPriceData = await this.getHistoricalPriceData(tokenAddress, startOfAllTimeHigh, endOfAllTimeHigh, '1m');
    const highestPriceRecord = historyPriceData.reduce((acc, curr) => {
      if (curr.value > acc.value) {
        return curr
      }
      return acc
    }, historyPriceData[0])
    return {
      value: highestPriceRecord.value,
      unixTime: highestPriceRecord.unixTime
    }
  }

  getLargestMarketCapTokens = async (limit: number, liquidityMin: number = 500): Promise<TokenListItem[]> => {
    const url = `${this.baseUrl}/defi/tokenlist?sort_by=mc&sort_type=desc&offset=0&limit=50&min_liquidity=1000000`;
    const {data} = await this.get<BirdeyeTokenListResponse>(url, env.birdeye.apikey);
    return data.tokens;
  }

  async getTrendingTokens(limit: number, offset: number, sortBy: 'liquidity' | 'rank' = 'liquidity'): Promise<TrendingTokenListItem[]> {
    const url = `${this.baseUrl}/defi/token_trending?sort_by=${sortBy}&sort_type=desc&offset=${offset}&limit=${limit}`;
    const {data} = await this.get<BirdeyeTrendingTokenListResponse>(url, env.birdeye.apikey);
    return data.tokens
  }

  async getTop100TrendingTokensByMarketCap(): Promise<TrendingTokenListItem[]> {
    let offset = 0;
    let limit = 20
    let tokens: TrendingTokenListItem[] = [];
    while (offset < 100) {
      const currentTokens = await this.getTrendingTokens(limit, offset);
      tokens = tokens.concat(currentTokens);
      offset += limit;
      await sleep(500)
    }
    return tokens
  }

  async getTop100TrendingTokensByRank(): Promise<TrendingTokenListItem[]> {
    let offset = 0;
    let limit = 20
    let tokens: TrendingTokenListItem[] = [];
    while (offset < 100) {
      const currentTokens = await this.getTrendingTokens(limit, offset, 'rank');
      tokens = tokens.concat(currentTokens);
      offset += limit;
      await sleep(500)
    }
    return tokens
  }

  async getHistoricalPriceData(tokenAddress: string, from: number, to: number, interval: TimeInterval = '5m'): Promise<HistoricalPriceItem[]> {
    const fromInSeconds = Math.floor(from / 1000);
    const toInSeconds = Math.floor(to / 1000);
    const url = `${this.baseUrl}/defi/history_price?address=${tokenAddress}&address_type=token&type=${interval}&time_from=${fromInSeconds}&time_to=${toInSeconds}`;
    const data = await this.get<BirdEyeHistoricalPriceDataResponse>(url);
    return data.data.items.map(time => {
      const {unixTime, ...rest} = time;
      return {
        unixTime: unixTime * 1000,
        ...rest
      }
    });
  }

  intervalToMilliseconds = (interval: TimeInterval): number => {
    const intervalMap: { [key in TimeInterval]: number } = {
      "1D": 24 * 60 * 60 * 1000,
      "1H": 60 * 60 * 1000,
      "1W": 7 * 24 * 60 * 60 * 1000,
      "1m": 60 * 1000,
      "2H": 2 * 60 * 60 * 1000,
      "3m": 3 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "4H": 4 * 60 * 60 * 1000,
      "5m": 5 * 60 * 1000,
      "6H": 6 * 60 * 60 * 1000,
      "12H": 12 * 60 * 60 * 1000,
      "15m": 15 * 60 * 1000
    };

    return intervalMap[interval];
  };
}
