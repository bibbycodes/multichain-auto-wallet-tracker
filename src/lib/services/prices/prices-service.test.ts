import { ChainId, ChainsMap } from '../../../shared/chains';
import { BirdEyeFetcherService } from '../apis/birdeye/birdeye-service';
import { PricesService } from './prices-service';
import { createMockToken } from '../../../../tests/mocks/common/token.mock';

describe('PricesService', () => {
    let pricesService: PricesService;
    let mockBirdeyeService: jest.Mocked<BirdEyeFetcherService>;

    beforeEach(() => {
        mockBirdeyeService = {
            getManyPrices: jest.fn(),
        } as any;

        pricesService = new PricesService(mockBirdeyeService);
    });

    describe('getManyPricesAndMarketCaps', () => {
        const testChainId: ChainId = ChainsMap.bsc;


        it('should return prices and market caps for all tokens with available prices', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });
            const token2 = createMockToken({ address: '0xtoken2', totalSupply: 500000000, symbol: 'TKN2' });
            const token3 = createMockToken({ address: '0xtoken3', totalSupply: 2000000000, symbol: 'TKN3' });

            const mockPrices = {
                '0xtoken1': 0.5,
                '0xtoken2': 1.0,
                '0xtoken3': 0.25,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1, token2, token3],
                testChainId
            );

            expect(mockBirdeyeService.getManyPrices).toHaveBeenCalledWith(
                ['0xtoken1', '0xtoken2', '0xtoken3'],
                testChainId
            );

            expect(result).toEqual({
                '0xtoken1': {
                    price: 0.5,
                    marketCap: 500000000, // 1000000000 * 0.5
                },
                '0xtoken2': {
                    price: 1.0,
                    marketCap: 500000000, // 500000000 * 1.0
                },
                '0xtoken3': {
                    price: 0.25,
                    marketCap: 500000000, // 2000000000 * 0.25
                },
            });
        });

        it('should exclude tokens without available prices from the result', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });
            const token2 = createMockToken({ address: '0xtoken2', totalSupply: 500000000, symbol: 'TKN2' });
            const token3 = createMockToken({ address: '0xtoken3', totalSupply: 2000000000, symbol: 'TKN3' });

            const mockPrices = {
                '0xtoken1': 0.5,
                // token2 price is missing
                '0xtoken3': 0.25,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1, token2, token3],
                testChainId
            );

            expect(result).toEqual({
                '0xtoken1': {
                    price: 0.5,
                    marketCap: 500000000,
                },
                '0xtoken3': {
                    price: 0.25,
                    marketCap: 500000000,
                },
            });

            expect(result['0xtoken2']).toBeUndefined();
        });

        it('should return empty object when no tokens are provided, does not call client', async () => {
            const result = await pricesService.getManyPricesAndMarketCaps(
                [],
                testChainId
            );

            expect(mockBirdeyeService.getManyPrices).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should return empty object when no prices are available for any token', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });
            const token2 = createMockToken({ address: '0xtoken2', totalSupply: 500000000, symbol: 'TKN2' });

            mockBirdeyeService.getManyPrices.mockResolvedValue({});

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1, token2],
                testChainId
            );

            expect(result).toEqual({});
        });

        it('should handle tokens with zero price correctly', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });

            const mockPrices = {
                '0xtoken1': 0,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1],
                testChainId
            );

            expect(result).toEqual({});
        });

        it('should correctly calculate market cap with different token supplies', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000, symbol: 'SMALL' });
            const token2 = createMockToken({ address: '0xtoken2', totalSupply: 1000000000000, symbol: 'LARGE' });

            const mockPrices = {
                '0xtoken1': 100.0,
                '0xtoken2': 0.0001,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1, token2],
                testChainId
            );

            expect(result).toEqual({
                '0xtoken1': {
                    price: 100.0,
                    marketCap: 100000000, // 1000000 * 100.0
                },
                '0xtoken2': {
                    price: 0.0001,
                    marketCap: 100000000, // 1000000000000 * 0.0001
                },
            });
        });

        it('should handle very small prices correctly', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000000000, symbol: 'MICRO' });

            const mockPrices = {
                '0xtoken1': 0.0000000001,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1],
                testChainId
            );

            expect(result).toEqual({
                '0xtoken1': {
                    price: 0.0000000001,
                    marketCap: 100000, // 1000000000000000 * 0.0000000001
                },
            });
        });

        it('should call getManyPrices with correct addresses in order', async () => {
            const token1 = createMockToken({ address: '0xaaa', totalSupply: 1000000, symbol: 'AAA' });
            const token2 = createMockToken({ address: '0xbbb', totalSupply: 2000000, symbol: 'BBB' });
            const token3 = createMockToken({ address: '0xccc', totalSupply: 3000000, symbol: 'CCC' });

            mockBirdeyeService.getManyPrices.mockResolvedValue({});

            await pricesService.getManyPricesAndMarketCaps(
                [token1, token2, token3],
                testChainId
            );

            expect(mockBirdeyeService.getManyPrices).toHaveBeenCalledWith(
                ['0xaaa', '0xbbb', '0xccc'],
                testChainId
            );
        });

        it('should work with different chain IDs', async () => {
            const solanaChainId: ChainId = ChainsMap.solana;
            const token1 = createMockToken({ address: 'solana-address-1', totalSupply: 1000000000, symbol: 'SOL1', chainId: solanaChainId });

            const mockPrices = {
                'solana-address-1': 2.5,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1],
                solanaChainId
            );

            expect(mockBirdeyeService.getManyPrices).toHaveBeenCalledWith(
                ['solana-address-1'],
                solanaChainId
            );

            expect(result).toEqual({
                'solana-address-1': {
                    price: 2.5,
                    marketCap: 2500000000,
                },
            });
        });

        it('should handle API errors from birdeye service', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });

            mockBirdeyeService.getManyPrices.mockRejectedValue(
                new Error('API rate limit exceeded')
            );

            await expect(
                pricesService.getManyPricesAndMarketCaps([token1], testChainId)
            ).rejects.toThrow('API rate limit exceeded');
        });

        it('should handle duplicate token addresses', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });
            const token1Duplicate = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });

            const mockPrices = {
                '0xtoken1': 0.5,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1, token1Duplicate],
                testChainId
            );

            // Should still make the request with duplicate addresses as received
            expect(mockBirdeyeService.getManyPrices).toHaveBeenCalledWith(
                ['0xtoken1', '0xtoken1'],
                testChainId
            );

            // Result should still have one entry (the last one processed wins)
            expect(result).toEqual({
                '0xtoken1': {
                    price: 0.5,
                    marketCap: 500000000,
                },
            });
        });

        it('should handle null or undefined prices in response', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 1000000000, symbol: 'TKN1' });
            const token2 = createMockToken({ address: '0xtoken2', totalSupply: 500000000, symbol: 'TKN2' });

            const mockPrices = {
                '0xtoken1': null as any,
                '0xtoken2': undefined as any,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1, token2],
                testChainId
            );

            expect(result).toEqual({});
        });

        it('should preserve precision in market cap calculations', async () => {
            const token1 = createMockToken({ address: '0xtoken1', totalSupply: 999999999, symbol: 'PREC' });

            const mockPrices = {
                '0xtoken1': 1.23456789,
            };

            mockBirdeyeService.getManyPrices.mockResolvedValue(mockPrices);

            const result = await pricesService.getManyPricesAndMarketCaps(
                [token1],
                testChainId
            );

            expect(result['0xtoken1'].price).toBe(1.23456789);
            expect(result['0xtoken1'].marketCap).toBe(999999999 * 1.23456789);
        });
    });
});

