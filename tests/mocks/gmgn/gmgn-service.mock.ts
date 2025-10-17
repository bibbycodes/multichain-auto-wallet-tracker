import { ChainId } from "../../../src/shared/chains";
import { AutoTrackerTokenData, TokenSecurity } from "../../../src/lib/models/token/types";
import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSocials, GmGnTopTrader, GmGnTrendingTokenResponse, GmGnSmartMoneyWalletData, GmGnWalletHoldings, GmGnTokenSecurityAndLaunchpad } from "python-proxy-scraper-client";
import { BaseTokenFetcherService } from "../../../src/lib/services/tokens/token-fetcher-types";
import { GmGnTokenDataWithMarketCap } from "../../../src/lib/services/apis/gmgn/types";

// Import fixture data
import getMultiWindowTokenInfoFixture from "../../fixtures/gmgn/getMultiWindowTokenInfo-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSocialsFixture from "../../fixtures/gmgn/getTokenSocials-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getHoldersFixture from "../../fixtures/gmgn/getHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTrendingTokensFixture from "../../fixtures/gmgn/getTrendingTokens-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSecurityFixture from "../../fixtures/gmgn/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getPartialSecurityValuesFixture from "../../fixtures/gmgn/getPartialSecurityValues-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getWalletDataFixture from "../../fixtures/gmgn/getWalletData-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getWalletHoldingsFixture from "../../fixtures/gmgn/getWalletHoldings-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenAndSocialsByTokenAddressAndChainIdFixture from "../../fixtures/gmgn/getTokenAndSocialsByTokenAddressAndChainId-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenAndSocialsByTokenAddressFixture from "../../fixtures/gmgn/getTokenAndSocialsByTokenAddress-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenAndChainIdFixture from "../../fixtures/gmgn/getTokenAndChainId-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import fetchTokenWithMarketCapFixture from "../../fixtures/gmgn/fetchTokenWithMarketCap-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import fetchTokenDataFixture from "../../fixtures/gmgn/fetchTokenData-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class GmGnServiceMock extends BaseTokenFetcherService {
  constructor() {
    super();
  }

  // Jest mock functions for methods with fixtures
  getTrendingTokens = jest.fn().mockResolvedValue(getTrendingTokensFixture as unknown as GmGnTrendingTokenResponse);

  getTokenSecurity = jest.fn().mockResolvedValue(getTokenSecurityFixture as unknown as GmGnTokenSecurityAndLaunchpad);

  getPartialSecurityValues = jest.fn().mockResolvedValue(getPartialSecurityValuesFixture as unknown as Partial<TokenSecurity>);

  getTopTraders = jest.fn().mockRejectedValue(new Error('No fixture available for getTopTraders'));

  getHolders = jest.fn().mockResolvedValue(getHoldersFixture as unknown as GmGnTokenHolder[]);

  getWalletData = jest.fn().mockResolvedValue(getWalletDataFixture as unknown as GmGnSmartMoneyWalletData);

  getWalletHoldings = jest.fn().mockResolvedValue(getWalletHoldingsFixture as unknown as GmGnWalletHoldings);

  getMultiWindowTokenInfo = jest.fn().mockResolvedValue(getMultiWindowTokenInfoFixture as unknown as GmGnMultiWindowTokenInfo);

  getTokenAndSocialsByTokenAddressAndChainId = jest.fn().mockResolvedValue(getTokenAndSocialsByTokenAddressAndChainIdFixture);

  getTokenAndSocialsByTokenAddress = jest.fn().mockResolvedValue(getTokenAndSocialsByTokenAddressFixture);

  getTokenAndChainId = jest.fn().mockResolvedValue(getTokenAndChainIdFixture);

  fetchTokenWithMarketCap = jest.fn().mockResolvedValue(fetchTokenWithMarketCapFixture as unknown as GmGnTokenDataWithMarketCap);

  fetchTokenData = jest.fn().mockResolvedValue(fetchTokenDataFixture as unknown as AutoTrackerTokenData);

  getTokenSocials = jest.fn().mockResolvedValue(getTokenSocialsFixture as unknown as GmGnTokenSocials);
}
