import { ChainBaseTopHolder } from "../../../src/lib/services/apis/chain-base/types";

// Import fixture data
import topHoldersFixture from "../../fixtures/chainbase/topHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export class ChainBaseServiceMock {
  private readonly baseUrl: string = 'https://api.chainbase.online'

  constructor() {}

  // Jest mock function for method with fixture
  fetchTopHoldersForToken = jest.fn().mockResolvedValue(
    topHoldersFixture as ChainBaseTopHolder[]
  );
}
