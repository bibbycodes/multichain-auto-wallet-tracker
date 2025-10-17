import { BirdeyeRawTokenData } from '../birdeye-raw-data';
import { BirdEyeFetcherService } from '../../apis/birdeye/birdeye-service';
import { BirdEyeClient } from '../../apis/birdeye/client';
import { ChainId } from '../../../../shared/chains';
import {
    BirdeyeEvmTokenSecurity,
    BirdTokenEyeOverview,
    MarketsData
} from '../../apis/birdeye/client/types';

// Import fixtures
import tokenOverviewFixture from '../../../../../tests/fixtures/birdeye/tokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import tokenSecurityFixture from '../../../../../tests/fixtures/birdeye/tokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import marketsFixture from '../../../../../tests/fixtures/birdeye/markets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import { BirdEyeClientMock } from '../../../../../tests/mocks';

describe('BirdeyeRawTokenData', () => {
    let birdeyeService: BirdEyeFetcherService;
    let mockClient: BirdEyeClientMock;
    const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const testChainId: ChainId = '1';

    beforeEach(() => {
        mockClient = new BirdEyeClientMock();
        birdeyeService = new BirdEyeFetcherService(mockClient as unknown as BirdEyeClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with empty data', () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            expect(rawData).toBeInstanceOf(BirdeyeRawTokenData);
            expect(rawData.toObject()).toEqual({});
        });

        it('should initialize with initial data', () => {
            const initialData = {
                tokenOverview: tokenOverviewFixture as unknown as BirdTokenEyeOverview,
            };

            const rawData = new BirdeyeRawTokenData(
                testTokenAddress,
                testChainId,
                initialData,
                birdeyeService
            );

            expect(rawData.toObject()).toEqual(initialData);
        });
    });

    describe('collect', () => {
        it('should collect all data sources in parallel', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            await rawData.collect();

            expect(mockClient.getTokenSecurity).toHaveBeenCalledWith(testTokenAddress, 'ethereum');
            expect(mockClient.getTokenOverview).toHaveBeenCalledWith(testTokenAddress, ['1h'], 'ethereum');
            expect(mockClient.getMarkets).toHaveBeenCalledWith(
                testTokenAddress,
                expect.objectContaining({
                    chain: 'ethereum',
                    limit: 1,
                    sortBy: 'liquidity',
                    sortType: 'desc'
                })
            );
        });

        it('should handle errors gracefully', async () => {
            mockClient.getTokenSecurity.mockRejectedValueOnce(new Error('API Error'));

            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            await expect(rawData.collect()).resolves.not.toThrow();
        });
    });

    describe('data fetching methods', () => {
        describe('getTokenSecurity', () => {
            it('should return cached data when available', async () => {
                const cachedData = {
                    tokenSecurity: tokenSecurityFixture as unknown as BirdeyeEvmTokenSecurity,
                };

                const rawData = new BirdeyeRawTokenData(
                    testTokenAddress,
                    testChainId,
                    cachedData,
                    birdeyeService
                );

                const result = await rawData.getTokenSecurity();

                expect(result).toBe(cachedData.tokenSecurity);
                expect(mockClient.getTokenSecurity).not.toHaveBeenCalled();
            });

            it('should fetch, cache, and return data when not cached', async () => {
                const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

                const result1 = await rawData.getTokenSecurity();
                const result2 = await rawData.getTokenSecurity();

                expect(result1).toEqual(tokenSecurityFixture);
                expect(result1).toBe(result2);
                expect(mockClient.getTokenSecurity).toHaveBeenCalledTimes(1);
            });

            it('should return null on error', async () => {
                mockClient.getTokenSecurity.mockRejectedValueOnce(new Error('API Error'));

                const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

                const result = await rawData.getTokenSecurity();

                expect(result).toBeNull();
            });
        });

        describe('getMarkets', () => {
            it('should return cached data when available', async () => {
                const cachedData = {
                    markets: marketsFixture as unknown as MarketsData,
                };

                const rawData = new BirdeyeRawTokenData(
                    testTokenAddress,
                    testChainId,
                    cachedData,
                    birdeyeService
                );

                const result = await rawData.getMarkets();

                expect(result).toBe(cachedData.markets);
                expect(mockClient.getMarkets).not.toHaveBeenCalled();
            });

            it('should fetch and cache data when not cached', async () => {
                const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

                const result = await rawData.getMarkets();

                expect(result).toBeDefined();
                expect(result).toHaveProperty('items');
                expect(mockClient.getMarkets).toHaveBeenCalledWith(
                    testTokenAddress,
                    expect.objectContaining({
                        chain: 'ethereum',
                        limit: 1,
                        sortBy: 'liquidity',
                        sortType: 'desc'
                    })
                );
            });
        });

        describe('getTokenOverview', () => {
            it('should return cached data when available', async () => {
                const cachedData = {
                    tokenOverview: tokenOverviewFixture as unknown as BirdTokenEyeOverview,
                };

                const rawData = new BirdeyeRawTokenData(
                    testTokenAddress,
                    testChainId,
                    cachedData,
                    birdeyeService
                );

                const result = await rawData.getTokenOverview();

                expect(result).toBe(cachedData.tokenOverview);
                expect(mockClient.getTokenOverview).not.toHaveBeenCalled();
            });

            it('should fetch and cache data when not cached', async () => {
                const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

                const result = await rawData.getTokenOverview();

                expect(result).toBeDefined();
                expect(result).toHaveProperty('address');
                expect(result).toHaveProperty('symbol');
                expect(mockClient.getTokenOverview).toHaveBeenCalledWith(testTokenAddress, ['1h'], 'ethereum');
            });
        });
    });

    describe('convenience methods', () => {
        it('should extract price from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getPrice();

            expect(result).toBe(0.0000066279564202772125);
        });

        it('should extract market cap from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getMarketCap();

            expect(result).toBe(6627.956420277213);
        });

        it('should extract liquidity from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getLiquidity();

            expect(result).toBeGreaterThan(0);
            expect(typeof result).toBe('number');
        });

        it('should extract supply from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getSupply();

            expect(result).toBe(1000000000);
        });

        it('should extract decimals from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getDecimals();

            expect(result).toBe(18);
        });

        it('should extract name from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getName();

            expect(result).toBe('Russell rug Survivor');
        });

        it('should extract symbol from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getSymbol();

            expect(result).toBe('RUGSURVIVE');
        });

        it('should extract socials from token overview', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            const result = await rawData.getSocials();

            expect(result).toEqual({
                twitter: undefined,
                telegram: undefined,
                discord: undefined,
                website: undefined,
            });
        });

        it('should return null when dependent data is unavailable', async () => {
            mockClient.getTokenOverview.mockRejectedValueOnce(new Error('API Error'));

            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            expect(await rawData.getPrice()).toBeNull();
            expect(await rawData.getMarketCap()).toBeNull();
            expect(await rawData.getLiquidity()).toBeNull();
        });
    });

    describe('data accumulation', () => {
        it('should accumulate data from multiple fetches', async () => {
            const rawData = new BirdeyeRawTokenData(testTokenAddress, testChainId, {}, birdeyeService);

            await rawData.getTokenSecurity();
            await rawData.getTokenOverview();
            await rawData.getMarkets();

            const data = rawData.toObject();

            expect(data.tokenSecurity).toBeDefined();
            expect(data.tokenOverview).toBeDefined();
            expect(data.markets).toBeDefined();
        });
    });
});
