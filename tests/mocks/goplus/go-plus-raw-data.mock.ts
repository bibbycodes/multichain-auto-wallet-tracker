import { ChainId } from "../../../src/shared/chains";
import { GoPlusTokenDataRawData } from "../../../src/lib/services/apis/goplus/types";
import { BaseDataSource } from "../../../src/lib/services/raw-data/base-data-source";
import { GoPlusRugpullDetection, GoPlusSolanaTokenSecurityResponse, TokenSecurityResponse } from "python-proxy-scraper-client";

// Import fixture data
import tokenSecurityFixture from "../../fixtures/goplus/tokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import rugpullDetectionFixture from "../../fixtures/goplus/rugpullDetection-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class GoPlusRawDataMock extends BaseDataSource<GoPlusTokenDataRawData> {
  constructor(
    tokenAddress: string,
    chainId: ChainId,
    initialData?: Partial<GoPlusTokenDataRawData>,
  ) {
    super(tokenAddress, chainId, initialData);
  }

  protected getDataSourceName(): string {
    return 'go_plus';
  }

  // Jest mock functions for all methods
  collect = jest.fn().mockResolvedValue(undefined);

  getTokenSecurity = jest.fn().mockResolvedValue(tokenSecurityFixture as unknown as TokenSecurityResponse | GoPlusSolanaTokenSecurityResponse);

  getRugpullDetection = jest.fn().mockResolvedValue(rugpullDetectionFixture as unknown as GoPlusRugpullDetection);

  getRawData = jest.fn().mockReturnValue({
    tokenSecurity: tokenSecurityFixture,
    rugpullDetection: rugpullDetectionFixture,
  } as unknown as GoPlusTokenDataRawData);

  // GoPlus doesn't provide these fields, so return null
  getPrice = jest.fn().mockResolvedValue(null);
  getMarketCap = jest.fn().mockResolvedValue(null);
  getLiquidity = jest.fn().mockResolvedValue(null);
  getSupply = jest.fn().mockResolvedValue(null);
  getDecimals = jest.fn().mockResolvedValue(null);
  getName = jest.fn().mockResolvedValue(null);
  getSymbol = jest.fn().mockResolvedValue(null);
  getLogoUrl = jest.fn().mockResolvedValue(null);
  getDescription = jest.fn().mockResolvedValue(null);
  getSocials = jest.fn().mockResolvedValue(null);
  getCreatedBy = jest.fn().mockResolvedValue(null);
}
