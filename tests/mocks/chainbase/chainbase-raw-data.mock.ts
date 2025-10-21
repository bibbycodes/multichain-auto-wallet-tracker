import { ChainBaseTokenDataRawData, ChainBaseTopHolder } from "../../../src/lib/services/apis/chain-base/types";
import { BaseDataSource } from "../../../src/lib/services/raw-data/base-data-source";
import { ChainId } from "../../../src/shared/chains";

// Import fixture data
import topHoldersFixture from "../../fixtures/chainbase/topHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class ChainBaseRawDataMock extends BaseDataSource<ChainBaseTokenDataRawData> {
  constructor(
    tokenAddress: string,
    chainId: ChainId,
    initialData?: Partial<ChainBaseTokenDataRawData>,
  ) {
    super(tokenAddress, chainId, initialData);
  }

  protected getDataSourceName(): string {
    return 'chainbase';
  }

  // Jest mock functions for all methods
  collect = jest.fn().mockResolvedValue(undefined);

  getTopHolders = jest.fn().mockResolvedValue(topHoldersFixture as unknown as ChainBaseTopHolder[]);

  // ChainBase does not provide these fields, so return null
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

  getRawData = jest.fn().mockReturnValue({
    topHolders: topHoldersFixture,
  } as unknown as ChainBaseTokenDataRawData);
}
