import { ChainId } from "../../../src/shared/chains";
import { SocialMedia } from "../../../src/lib/models/socials/types";
import { GmGnTokenDataRawData } from "../../../src/lib/services/apis/gmgn/types";
import { BaseDataSource } from "../../../src/lib/services/raw-data/base-data-source";
import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSocials, GmGnTokenSecurityAndLaunchpad } from "python-proxy-scraper-client";

// Import fixture data
import getMultiWindowTokenInfoFixture from "../../fixtures/gmgn/getMultiWindowTokenInfo-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSocialsFixture from "../../fixtures/gmgn/getTokenSocials-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getHoldersFixture from "../../fixtures/gmgn/getHolders-0xe6df05ce8c8301223373cf5b969afcb1498c5528.json";
import getTokenSecurityAndLaunchpadFixture from "../../fixtures/gmgn/getTokenSecurityAndLaunchpad-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class GmgnRawDataSourceMock extends BaseDataSource<GmGnTokenDataRawData> {
  constructor(
    tokenAddress: string,
    chainId: ChainId,
    initialData?: Partial<GmGnTokenDataRawData>,
  ) {
    super(tokenAddress, chainId, initialData);
  }

  protected getDataSourceName(): string {
    return 'gmgn';
  }

  // Jest mock functions for all methods
  collect = jest.fn().mockResolvedValue(undefined);

  getPrice = jest.fn().mockResolvedValue(0.0000065628764);

  getMarketCap = jest.fn().mockResolvedValue(6562.8764);

  getLiquidity = jest.fn().mockResolvedValue(0.00000000003352788064);

  getSupply = jest.fn().mockResolvedValue(1000000000);

  getDecimals = jest.fn().mockResolvedValue(18);

  getName = jest.fn().mockResolvedValue("Russell rug Survivor");

  getSymbol = jest.fn().mockResolvedValue("RUGSURVIVE");

  getLogoUrl = jest.fn().mockResolvedValue("https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp");

  getDescription = jest.fn().mockResolvedValue(null);

  getSocials = jest.fn().mockResolvedValue({
    twitter: "RusselSurvivor",
    telegram: "https://t.me/RUSSELLTHERUGSURVIVOR",
    discord: undefined,
    website: undefined,
  } as SocialMedia);

  getCreatedBy = jest.fn().mockResolvedValue("0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa");

  getTokenInfo = jest.fn().mockResolvedValue(getMultiWindowTokenInfoFixture as unknown as GmGnMultiWindowTokenInfo);

  getTokenSocials = jest.fn().mockResolvedValue(getTokenSocialsFixture as unknown as GmGnTokenSocials);

  getGmgnSocials = jest.fn().mockResolvedValue(getTokenSocialsFixture as unknown as GmGnTokenSocials);

  getHolders = jest.fn().mockResolvedValue(getHoldersFixture as unknown as GmGnTokenHolder[]);

  getTokenSecurityAndLaunchpad = jest.fn().mockResolvedValue(getTokenSecurityAndLaunchpadFixture as unknown as GmGnTokenSecurityAndLaunchpad);

  getRawData = jest.fn().mockReturnValue({
    tokenInfo: getMultiWindowTokenInfoFixture,
    socials: getTokenSocialsFixture,
    holders: getHoldersFixture,
    tokenSecurityAndLaunchpad: getTokenSecurityAndLaunchpadFixture,
  } as unknown as GmGnTokenDataRawData);
}
