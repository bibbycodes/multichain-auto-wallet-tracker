import { intervalToMilliseconds } from "../../../src/lib/services/apis/birdeye/utils/interval-utils"

// Import fixture data
import getHistoricalPriceDataFixture from "../../fixtures/birdeye/getHistoricalPriceData-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getLargestMarketCapTokensFixture from "../../fixtures/birdeye/getLargestMarketCapTokens-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getMarketsFixture from "../../fixtures/birdeye/getMarkets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getMultiplePricesFixture from "../../fixtures/birdeye/getMultiplePrices-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTokenMetadataFixture from "../../fixtures/birdeye/getTokenMetadata-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTokenOverviewFixture from "../../fixtures/birdeye/getTokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTokenPriceFixture from "../../fixtures/birdeye/getTokenPrice-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTokenPriceWithApiKeyFixture from "../../fixtures/birdeye/getTokenPriceWithApiKey-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTokenSecurityFixture from "../../fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTop100TrendingTokensByMarketCapFixture from "../../fixtures/birdeye/getTop100TrendingTokensByMarketCap-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTop100TrendingTokensByRankFixture from "../../fixtures/birdeye/getTop100TrendingTokensByRank-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTradesBetweenDatesFixture from "../../fixtures/birdeye/getTradesBetweenDates-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import getTrendingTokensFixture from "../../fixtures/birdeye/getTrendingTokens-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"
import searchFixture from "../../fixtures/birdeye/search-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json"

export class BirdEyeClientMock {
  private readonly apiKey: string;
  private baseUrl: string = 'https://public-api.birdeye.so';

  constructor(apiKey: string = 'mock-api-key') {
    this.apiKey = apiKey;
  }

  // Jest mock functions for methods with fixtures
  getTokenSecurity = jest.fn().mockResolvedValue(getTokenSecurityFixture);
  getTokenOverview = jest.fn().mockResolvedValue(getTokenOverviewFixture);
  getMarkets = jest.fn().mockResolvedValue(getMarketsFixture);
  getMultiplePrices = jest.fn().mockResolvedValue(getMultiplePricesFixture);
  getTokenPrice = jest.fn().mockResolvedValue(getTokenPriceFixture);
  getTokenMetadata = jest.fn().mockResolvedValue(getTokenMetadataFixture);
  getTokenPriceWithApiKey = jest.fn().mockResolvedValue(getTokenPriceWithApiKeyFixture);
  getLargestMarketCapTokens = jest.fn().mockResolvedValue(getLargestMarketCapTokensFixture);
  getTrendingTokens = jest.fn().mockResolvedValue(getTrendingTokensFixture);
  getTop100TrendingTokensByMarketCap = jest.fn().mockResolvedValue(getTop100TrendingTokensByMarketCapFixture);
  getTop100TrendingTokensByRank = jest.fn().mockResolvedValue(getTop100TrendingTokensByRankFixture);
  getTradesBetweenDates = jest.fn().mockResolvedValue(getTradesBetweenDatesFixture);
  getHistoricalPriceData = jest.fn().mockResolvedValue(getHistoricalPriceDataFixture);
  search = jest.fn().mockResolvedValue(searchFixture);

  // Jest mock functions for methods without fixtures
  getTopHolders = jest.fn().mockRejectedValue(new Error('No fixture available for getTopHolders'));
  getCreationData = jest.fn().mockRejectedValue(new Error('No fixture available for getCreationData'));
  getOhlcData = jest.fn().mockRejectedValue(new Error('No fixture available for getOhlcData'));
  getAllTimeHighForTokenAfterDate = jest.fn().mockRejectedValue(new Error('No fixture available for getAllTimeHighForTokenAfterDate'));
  getAllTradesBetweenDates = jest.fn().mockRejectedValue(new Error('No fixture available for getAllTradesBetweenDates'));
  getTradesSeekByTime = jest.fn().mockRejectedValue(new Error('No fixture available for getTradesSeekByTime'));
  getWalletPnl = jest.fn().mockRejectedValue(new Error('No fixture available for getWalletPnl'));

  intervalToMilliseconds = intervalToMilliseconds;
}
