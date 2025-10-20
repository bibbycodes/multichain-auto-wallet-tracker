import { GeckoTerminalTokenDetails, Pool } from "python-proxy-scraper-client";
import { GeckoTerminaTokenDataRawData } from "../../../src/lib/services/apis/gecko-terminal/types";
import { BaseDataSource } from "../../../src/lib/services/raw-data/base-data-source";
import { ChainId } from "../../../src/shared/chains";

// Import fixture data
import tokenDetailsFixture from "../../fixtures/gecko-terminal/tokenDetails-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import tokenPoolsFixture from "../../fixtures/gecko-terminal/tokenPools-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class GeckoTerminalRawDataMock extends BaseDataSource<GeckoTerminaTokenDataRawData> {
  constructor(
    tokenAddress: string,
    chainId: ChainId,
    initialData?: Partial<GeckoTerminaTokenDataRawData>,
  ) {
    super(tokenAddress, chainId, initialData);
  }

  protected getDataSourceName(): string {
    return 'gecko_terminal';
  }

  // Jest mock functions for all methods
  collect = jest.fn().mockResolvedValue(undefined);

  getTokenDetails = jest.fn().mockResolvedValue(tokenDetailsFixture as unknown as GeckoTerminalTokenDetails);

  getTokenPools = jest.fn().mockResolvedValue(tokenPoolsFixture as unknown as Pool[]);

  getRawData = jest.fn().mockReturnValue({
    tokenDetails: tokenDetailsFixture,
    tokenPools: tokenPoolsFixture,
  } as unknown as GeckoTerminaTokenDataRawData);

  // Mock convenience methods
  getPrice = jest.fn().mockResolvedValue(0.0000066279564202772125);
  getMarketCap = jest.fn().mockResolvedValue(6627.956420277213);
  getLiquidity = jest.fn().mockResolvedValue(3.331375326688465e-11);
  getSupply = jest.fn().mockResolvedValue(1000000000);
  getDecimals = jest.fn().mockResolvedValue(18);
  getName = jest.fn().mockResolvedValue("Russell rug Survivor");
  getSymbol = jest.fn().mockResolvedValue("RUGSURVIVE");
  getLogoUrl = jest.fn().mockResolvedValue(null);
  getDescription = jest.fn().mockResolvedValue(null);
  getSocials = jest.fn().mockResolvedValue(null);
  getCreatedBy = jest.fn().mockResolvedValue(null);
  getPairAddress = jest.fn().mockResolvedValue("0x1234567890123456789012345678901234567890");
}
