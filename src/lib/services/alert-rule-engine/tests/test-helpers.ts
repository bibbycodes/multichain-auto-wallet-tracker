import { BaseContextData } from "../../token-context/types";
import { TokenSecurity, TokenPriceDetails, AutoTrackerTokenData } from "../../../models/token/types";
import { AutoTrackerToken } from "../../../models/token";
import { TokenDistributionContextData } from "../../token-context/token-distribution/types";
import { TokenDataSource } from "@prisma/client";

/**
 * Create a mock BaseContextData for testing
 */
export function createMockBaseContextData(
    partial: Partial<BaseContextData> = {}
): BaseContextData {
    const defaultTokenSecurity: TokenSecurity = {
        isHoneypot: false,
        isMintable: false,
        isLpTokenBurned: false,
        isPausable: false,
        isFreezable: false,
        isRenounced: false,
    };

    const defaultPriceDetails: TokenPriceDetails = {
        price: 0,
        marketCap: 0,
        liquidity: 0,
    };

    const defaultTokenData: AutoTrackerTokenData = {
        address: '0x123',
        chainId: '1',
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0x456',
        socials: {},
        dataSource: TokenDataSource.BIRDEYE,
    };

    const defaultToken = new AutoTrackerToken(defaultTokenData);

    const defaultTokenDistribution: TokenDistributionContextData = {
        tokenHolders: [],
        tokenDistributionStats: {
            numberOfHolders: 0,
            top10Percentage: 0,
            top20Percentage: 0,
            creatorTokenPercentage: 0,
        },
    };

    return {
        tokenSecurity: { ...defaultTokenSecurity, ...partial.tokenSecurity },
        priceDetails: { ...defaultPriceDetails, ...partial.priceDetails },
        token: partial.token || defaultToken,
        tokenDistribution: { ...defaultTokenDistribution, ...partial.tokenDistribution },
        rawData: partial.rawData || {},
    };
}

