import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview, MarketsData } from "../../../src/lib/services/apis/birdeye/client/types";
import { RawDataData as RawDataData } from "../../../src/lib/services/raw-data/types";
import getTokenOverviewFixture from "../../fixtures/birdeye/getTokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSecurityFixture from "../../fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getMarketsFixture from "../../fixtures/birdeye/getMarkets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getMultiWindowTokenInfoFixture from "../../fixtures/gmgn/getMultiWindowTokenInfo-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import getTokenSocialsFixture from "../../fixtures/gmgn/getTokenSocials-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSocials } from "python-proxy-scraper-client";
import getHoldersFixture from "../../fixtures/gmgn/getHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";
import { ChainBaseTopHolder } from "../../../src/lib/services/apis/chain-base/types";
import getTopHoldersFixture from "../../fixtures/chainbase/topHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json";

export const rawDataDataMock: RawDataData = {
    birdeye: {
        tokenOverview: getTokenOverviewFixture as unknown as BirdTokenEyeOverview,
        tokenSecurity: getTokenSecurityFixture as unknown as BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        markets: getMarketsFixture as unknown as MarketsData,
    },
    gmgn: {
        tokenInfo: getMultiWindowTokenInfoFixture as unknown as GmGnMultiWindowTokenInfo,
        socials: getTokenSocialsFixture as unknown as GmGnTokenSocials,
        holders: getHoldersFixture as unknown as GmGnTokenHolder[],
    },
    chainBase: {
        topHolders: getTopHoldersFixture as unknown as ChainBaseTopHolder[],
    },
}