import { ChainBaseRawData } from '../chain-base-raw-data';
import { ChainBaseService } from '../../apis/chain-base/chain-base-service';
import { ChainBaseServiceMock } from '../../../../../tests/mocks/chainbase/chainbase-service.mock';
import { ChainId } from '../../../../shared/chains';
import { ChainBaseTopHolder } from '../../apis/chain-base/types';

// Import fixtures
import topHoldersFixture from '../../../../../tests/fixtures/chainbase/topHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

describe('ChainBaseRawData', () => {
    let chainBaseService: ChainBaseServiceMock;
    const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const testChainId: ChainId = '56'; // BSC

    beforeEach(() => {
        chainBaseService = new ChainBaseServiceMock();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with empty data', () => {
            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            expect(rawData).toBeInstanceOf(ChainBaseRawData);
            expect(rawData.toObject()).toEqual({});
        });

        it('should initialize with initial data', () => {
            const initialData = {
                topHolders: topHoldersFixture as ChainBaseTopHolder[],
            };

            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                initialData,
                chainBaseService as unknown as ChainBaseService
            );

            expect(rawData.toObject()).toEqual(initialData);
        });
    });

    describe('collect', () => {
        it('should collect top holders data', async () => {
            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            await rawData.collect();

            expect(chainBaseService.fetchTopHoldersForToken).toHaveBeenCalledWith(
                testTokenAddress,
                testChainId
            );
            expect(chainBaseService.fetchTopHoldersForToken).toHaveBeenCalledTimes(1);
        });

        it('should handle errors gracefully', async () => {
            chainBaseService.fetchTopHoldersForToken.mockRejectedValueOnce(new Error('API Error'));

            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            await expect(rawData.collect()).resolves.not.toThrow();
        });
    });

    describe('getTopHolders', () => {
        it('should return cached data when available', async () => {
            const cachedData = {
                topHolders: topHoldersFixture as ChainBaseTopHolder[],
            };

            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                cachedData,
                chainBaseService as unknown as ChainBaseService
            );

            const result = await rawData.getTopHolders();

            expect(result).toBe(cachedData.topHolders);
            expect(chainBaseService.fetchTopHoldersForToken).not.toHaveBeenCalled();
        });

        it('should fetch, cache, and return data when not cached', async () => {
            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            const result1 = await rawData.getTopHolders();
            const result2 = await rawData.getTopHolders();

            expect(result1).toEqual(topHoldersFixture);
            expect(result1).toBe(result2);
            expect(chainBaseService.fetchTopHoldersForToken).toHaveBeenCalledTimes(1);
        });

        it('should return null on error', async () => {
            chainBaseService.fetchTopHoldersForToken.mockRejectedValueOnce(new Error('API Error'));

            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            const result = await rawData.getTopHolders();

            expect(result).toBeNull();
        });

        it('should return correct top holders structure', async () => {
            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            const result = await rawData.getTopHolders();

            expect(result).toHaveLength(5);
            expect(result![0]).toHaveProperty('wallet_address');
            expect(result![0]).toHaveProperty('amount');
            expect(result![0]).toHaveProperty('original_amount');
            expect(result![0]).toHaveProperty('usd_value');
            expect(result![0].wallet_address).toBe('0x5c952063c7fc8610ffdb798152d69f0b9550762b');
        });
    });

    describe('methods that return null', () => {
        it('should return null for token metadata methods', async () => {
            const rawData = new ChainBaseRawData(
                testTokenAddress,
                testChainId,
                {},
                chainBaseService as unknown as ChainBaseService
            );

            // ChainBase doesn't provide these fields, all should be null
            expect(await rawData.getPrice()).toBeNull();
            expect(await rawData.getMarketCap()).toBeNull();
            expect(await rawData.getLiquidity()).toBeNull();
            expect(await rawData.getSupply()).toBeNull();
            expect(await rawData.getDecimals()).toBeNull();
            expect(await rawData.getName()).toBeNull();
            expect(await rawData.getSymbol()).toBeNull();
            expect(await rawData.getLogoUrl()).toBeNull();
            expect(await rawData.getDescription()).toBeNull();
            expect(await rawData.getSocials()).toBeNull();
            expect(await rawData.getCreatedBy()).toBeNull();
        });
    });
});
