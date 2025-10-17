import { AutoTrackerTokenData, TokenDataWithMarketCapAndRawData } from "../../../src/lib/models/token/types";
import { BirdeyeEvmTokenSecurity, BirdeyeSearchResponse, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview, MarketsData } from "../../../src/lib/services/apis/birdeye/client/types";
import { RawDataData } from "../../../src/lib/services/raw-data/types";
import { BaseTokenFetcherService } from "../../../src/lib/services/tokens/token-fetcher-types";
import { ChainId } from "../../../src/shared/chains";

// Import fixture data
import { BirdEyeClient } from "../../../src/lib/services/apis/birdeye/client";
import getMarketsFixture from "../../fixtures/birdeye/getMarkets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenOverviewFixture from "../../fixtures/birdeye/getTokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSecurityFixture from "../../fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class BirdEyeFetcherServiceMock extends BaseTokenFetcherService {
  private client: BirdEyeClient; // Mock client property

  constructor() {
    super();
    this.client = {} as unknown as BirdEyeClient;
  }

  // Jest mock functions for methods with fixtures
  fetchTokenDataWithMarketCapFromAddress = jest.fn().mockImplementation(async (tokenAddress: string) => {
    // Return a mock response using fixture data
    const mockTokenData = {
      token: {
        address: tokenAddress,
        name: "Russell rug Survivor",
        symbol: "RUGSURVIVE",
        chainId: "56" as ChainId,
        decimals: 18,
        totalSupply: 1000000000,
        socials: {
          twitter: "RusselSurvivor",
          telegram: "https://t.me/RUSSELLTHERUGSURVIVOR",
          discord: undefined,
          website: undefined,
        },
        pairAddress: "0xe8852d270294cc9a84fe73d5a434ae85a1c34444",
        logoUrl: "https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp",
        description: undefined,
        createdBy: "0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa",
        dataSource: "BIRDEYE" as any,
        marketCap: 6627.956420277213,
        price: 0.0000066279564202772125,
        liquidity: 3.331375326688465e-11,
      },
      rawData: {
        birdeye: {
          tokenOverview: getTokenOverviewFixture,
          tokenSecurity: getTokenSecurityFixture.data,
          markets: getMarketsFixture.data,
        }
      }
    } as unknown as TokenDataWithMarketCapAndRawData<RawDataData>;
    
    return mockTokenData;
  });

  getMarkets = jest.fn().mockResolvedValue(getMarketsFixture.data as MarketsData);

  fetchTokenWithMarketCap = jest.fn().mockImplementation(async (tokenAddress: string, chainId: ChainId) => {
    // Return a mock response using fixture data
    const mockTokenData = {
      token: {
        address: tokenAddress,
        name: "Russell rug Survivor",
        symbol: "RUGSURVIVE",
        chainId,
        decimals: 18,
        totalSupply: 1000000000,
        socials: {
          twitter: "RusselSurvivor",
          telegram: "https://t.me/RUSSELLTHERUGSURVIVOR",
          discord: undefined,
          website: undefined,
        },
        pairAddress: "0xe8852d270294cc9a84fe73d5a434ae85a1c34444",
        logoUrl: "https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp",
        description: undefined,
        createdBy: "0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa",
        dataSource: "BIRDEYE" as any,
        marketCap: 6627.956420277213,
        price: 0.0000066279564202772125,
        liquidity: 3.331375326688465e-11,
      },
      rawData: {
        birdeye: {
          tokenOverview: getTokenOverviewFixture,
          tokenSecurity: getTokenSecurityFixture.data,
          markets: getMarketsFixture.data,
        }
      }
    } as unknown as TokenDataWithMarketCapAndRawData<RawDataData>;
    
    return mockTokenData;
  });

  getTokenOverview = jest.fn().mockResolvedValue(getTokenOverviewFixture as unknown as BirdTokenEyeOverview);

  getTokenSecurity = jest.fn().mockResolvedValue(getTokenSecurityFixture.data as unknown as BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity);

  fetchTokenData = jest.fn().mockImplementation(async (tokenAddress: string, chainId: ChainId) => {
    // Return a mock AutoTrackerTokenData using fixture data
    const mockTokenData = {
      address: tokenAddress,
      name: "Russell rug Survivor",
      symbol: "RUGSURVIVE",
      chainId,
      decimals: 18,
      totalSupply: 1000000000,
      socials: {
        twitter: "RusselSurvivor",
        telegram: "https://t.me/RUSSELLTHERUGSURVIVOR",
        discord: undefined,
        website: undefined,
      },
      pairAddress: "0xe8852d270294cc9a84fe73d5a434ae85a1c34444",
      logoUrl: "https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp",
      description: undefined,
      createdBy: "0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa",
      dataSource: "BIRDEYE" as any,
    } as AutoTrackerTokenData;
    
    return mockTokenData;
  });

  search = jest.fn().mockResolvedValue({
    success: true,
    data: {
      tokens: [],
      markets: []
    }
  } as BirdeyeSearchResponse);
}
