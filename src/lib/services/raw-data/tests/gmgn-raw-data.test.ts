import { GmgnRawDataSource } from '../gmgn-raw-data';
import { GmGnService } from '../../apis/gmgn/gmgn-service';
import { GmGnServiceMock } from '../../../../../tests/mocks/gmgn/gmgn-service.mock';
import { ChainId } from '../../../../shared/chains';
import {
    GmGnMultiWindowTokenInfo,
    GmGnTokenHolder,
    GmGnTokenSocials
} from 'python-proxy-scraper-client';

// Import fixtures
import tokenInfoFixture from '../../../../../tests/fixtures/gmgn/getMultiWindowTokenInfo-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import socialsFixture from '../../../../../tests/fixtures/gmgn/getTokenSocials-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import holdersFixture from '../../../../../tests/fixtures/gmgn/getHolders-0xe6df05ce8c8301223373cf5b969afcb1498c5528.json';

describe('GmgnRawDataSource', () => {
    let gmgnService: GmGnServiceMock;
    const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const testChainId: ChainId = '56'; // BSC

    beforeEach(() => {
        gmgnService = new GmGnServiceMock();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with empty data', () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            expect(rawData).toBeInstanceOf(GmgnRawDataSource);
            expect(rawData.toObject()).toEqual({});
        });

        it('should initialize with initial data', () => {
            const initialData = {
                tokenInfo: tokenInfoFixture as unknown as GmGnMultiWindowTokenInfo,
            };

            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                initialData,
                gmgnService as unknown as GmGnService
            );

            expect(rawData.toObject()).toEqual(initialData);
        });
    });

    describe('collect', () => {
        it('should collect all data sources in parallel', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            await rawData.collect();

            expect(gmgnService.getHolders).toHaveBeenCalledWith(testTokenAddress, testChainId);
            expect(gmgnService.getMultiWindowTokenInfo).toHaveBeenCalledWith(testTokenAddress, testChainId);
            expect(gmgnService.getTokenSocials).toHaveBeenCalledWith(testTokenAddress, testChainId);
        });

        it('should handle errors gracefully', async () => {
            gmgnService.getHolders.mockRejectedValueOnce(new Error('API Error'));

            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            await expect(rawData.collect()).resolves.not.toThrow();
        });
    });

    describe('data fetching methods', () => {
        describe('getHolders', () => {
            it('should return cached data when available', async () => {
                const cachedData = {
                    holders: holdersFixture as unknown as GmGnTokenHolder[],
                };

                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    cachedData,
                    gmgnService as unknown as GmGnService
                );

                const result = await rawData.getHolders();

                expect(result).toBe(cachedData.holders);
                expect(gmgnService.getHolders).not.toHaveBeenCalled();
            });

            it('should fetch, cache, and return data when not cached', async () => {
                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    {},
                    gmgnService as unknown as GmGnService
                );

                const result1 = await rawData.getHolders();
                const result2 = await rawData.getHolders();

                expect(result1).toEqual(holdersFixture);
                expect(result1).toBe(result2);
                expect(gmgnService.getHolders).toHaveBeenCalledTimes(1);
            });

            it('should return null on error', async () => {
                gmgnService.getHolders.mockRejectedValueOnce(new Error('API Error'));

                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    {},
                    gmgnService as unknown as GmGnService
                );

                const result = await rawData.getHolders();

                expect(result).toBeNull();
            });
        });

        describe('getTokenInfo', () => {
            it('should return cached data when available', async () => {
                const cachedData = {
                    tokenInfo: tokenInfoFixture as unknown as GmGnMultiWindowTokenInfo,
                };

                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    cachedData,
                    gmgnService as unknown as GmGnService
                );

                const result = await rawData.getTokenInfo();

                expect(result).toBe(cachedData.tokenInfo);
                expect(gmgnService.getMultiWindowTokenInfo).not.toHaveBeenCalled();
            });

            it('should fetch and cache data when not cached', async () => {
                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    {},
                    gmgnService as unknown as GmGnService
                );

                const result = await rawData.getTokenInfo();

                expect(result).toEqual(tokenInfoFixture);
                expect(gmgnService.getMultiWindowTokenInfo).toHaveBeenCalledWith(testTokenAddress, testChainId);
            });
        });

        describe('getGmgnSocials', () => {
            it('should return cached data when available', async () => {
                const cachedData = {
                    socials: socialsFixture as unknown as GmGnTokenSocials,
                };

                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    cachedData,
                    gmgnService as unknown as GmGnService
                );

                const result = await rawData.getGmgnSocials();

                expect(result).toBe(cachedData.socials);
                expect(gmgnService.getTokenSocials).not.toHaveBeenCalled();
            });

            it('should fetch and cache data when not cached', async () => {
                const rawData = new GmgnRawDataSource(
                    testTokenAddress,
                    testChainId,
                    {},
                    gmgnService as unknown as GmGnService
                );

                const result = await rawData.getGmgnSocials();

                expect(result).toEqual(socialsFixture);
                expect(gmgnService.getTokenSocials).toHaveBeenCalledWith(testTokenAddress, testChainId);
            });
        });
    });

    describe('convenience methods', () => {
        it('should extract price from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getPrice();

            expect(result).toBe(0.0000065628764);
        });

        it('should calculate market cap from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getMarketCap();

            expect(result).toBeCloseTo(6562.8764, 4);
        });

        it('should extract liquidity from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getLiquidity();

            expect(result).toBe(0.00000000003352788064);
        });

        it('should extract supply from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getSupply();

            expect(result).toBe(1000000000);
        });

        it('should extract decimals from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getDecimals();

            expect(result).toBe(18);
        });

        it('should extract name from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getName();

            expect(result).toBe('Russell rug Survivor');
        });

        it('should extract symbol from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getSymbol();

            expect(result).toBe('RUGSURVIVE');
        });

        it('should extract logo URL from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getLogoUrl();

            expect(result).toBe('https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp');
        });

        it('should extract and format socials from gmgn socials', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getSocials();

            expect(result).toEqual({
                twitter: 'https://x.com/RusselSurvivor?t=K8zn3TI7QbPDhysVweHs-A&s=09',
                telegram: 'https://t.me/RUSSELLTHERUGSURVIVOR',
                discord: undefined,
                website: undefined,
                instagram: undefined,
                facebook: undefined,
                youtube: undefined,
                tiktok: undefined,
                linkedin: undefined,
                github: undefined,
                reddit: undefined,
            });
        });

        it('should extract creator address from token info', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            const result = await rawData.getCreatedBy();

            expect(result).toBe('0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa');
        });

        it('should return null when dependent data is unavailable', async () => {
            gmgnService.getMultiWindowTokenInfo.mockRejectedValueOnce(new Error('API Error'));

            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            expect(await rawData.getPrice()).toBeNull();
            expect(await rawData.getMarketCap()).toBeNull();
            expect(await rawData.getLiquidity()).toBeNull();
        });
    });

    describe('data accumulation', () => {
        it('should accumulate data from multiple fetches', async () => {
            const rawData = new GmgnRawDataSource(
                testTokenAddress,
                testChainId,
                {},
                gmgnService as unknown as GmGnService
            );

            await rawData.getHolders();
            await rawData.getTokenInfo();
            await rawData.getGmgnSocials();

            const data = rawData.toObject();

            expect(data.holders).toEqual(holdersFixture);
            expect(data.tokenInfo).toEqual(tokenInfoFixture);
            expect(data.socials).toEqual(socialsFixture);
        });
    });
});
