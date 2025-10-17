import { ChainId } from "../../../src/shared/chains";
import { AutoTrackerTokenData, TokenDataWithMarketCapAndRawData } from "../../../src/lib/models/token/types";
import { RawDataData } from "../../../src/lib/services/raw-data/types";
import { BaseTokenFetcherService } from "../../../src/lib/services/tokens/token-fetcher-types";
import { BirdeyeSearchResponse, BirdTokenEyeOverview, MarketsData, BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from "../../../src/lib/services/apis/birdeye/client/types";

// Import fixture data
import getTokenOverviewFixture from "../../fixtures/birdeye/getTokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSecurityFixture from "../../fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getMarketsFixture from "../../fixtures/birdeye/getMarkets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class BirdEyeFetcherServiceMock extends BaseTokenFetcherService {
  constructor() {
    super();
  }

  // Jest mock functions for methods with fixtures
  fetchTokenDataWithMarketCapFromAddress = jest.fn().mockImplementation(async (tokenAddress: string) => {
    // Return a mock response using fixture data
    const mockTokenData: any = {
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
          tokenOverview: getTokenOverviewFixture as any,
          tokenSecurity: getTokenSecurityFixture.data as any,
          markets: getMarketsFixture.data as any,
        }
      }
    };
    
    return mockTokenData;
  });

  getMarkets = jest.fn().mockResolvedValue(getMarketsFixture.data as any);

  fetchTokenWithMarketCap = jest.fn().mockImplementation(async (tokenAddress: string, chainId: ChainId) => {
    // Return a mock response using fixture data
    const mockTokenData: any = {
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
          tokenOverview: getTokenOverviewFixture as any,
          tokenSecurity: getTokenSecurityFixture.data as any,
          markets: getMarketsFixture.data as any,
        }
      }
    };
    
    return mockTokenData;
  });

  getTokenOverview = jest.fn().mockResolvedValue(getTokenOverviewFixture as any);

  getTokenSecurity = jest.fn().mockResolvedValue(getTokenSecurityFixture.data as any);

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
