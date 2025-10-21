import { ChainId } from "../../../src/shared/chains";
import { SocialMedia } from "../../../src/lib/models/socials/types";
import { BirdEyeTokenDataRawData } from "../../../src/lib/services/apis/birdeye/types";
import { BaseDataSource } from "../../../src/lib/services/raw-data/base-data-source";

// Import fixture data
import getTokenOverviewFixture from "../../fixtures/birdeye/getTokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSecurityFixture from "../../fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getMarketsFixture from "../../fixtures/birdeye/getMarkets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import { TokenDataSource } from "@prisma/client";

export class BirdeyeRawTokenDataMock extends BaseDataSource<BirdEyeTokenDataRawData> {
  constructor(
    tokenAddress: string,
    chainId: ChainId,
    initialData?: Partial<BirdEyeTokenDataRawData>,
  ) {
    super(tokenAddress, chainId, initialData);
  }

  protected getDataSourceName(): string {
    return TokenDataSource.GO_PLUS.toLowerCase();
  }

  // Jest mock functions for all methods
  collect = jest.fn().mockResolvedValue(undefined);

  getPrice = jest.fn().mockResolvedValue(0.0000066279564202772125);

  getMarketCap = jest.fn().mockResolvedValue(6627.956420277213);

  getLiquidity = jest.fn().mockResolvedValue(3.331375326688465e-11);

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

  getTopHolders = jest.fn().mockResolvedValue([]);

  getTokenOverview = jest.fn().mockResolvedValue(getTokenOverviewFixture);

  getTokenSecurity = jest.fn().mockResolvedValue(getTokenSecurityFixture.data);

  getMarkets = jest.fn().mockResolvedValue(getMarketsFixture.data);

  getRawData = jest.fn().mockReturnValue({
    tokenOverview: getTokenOverviewFixture,
    tokenSecurity: getTokenSecurityFixture.data,
    markets: getMarketsFixture.data,
  } as unknown as BirdEyeTokenDataRawData);
}
