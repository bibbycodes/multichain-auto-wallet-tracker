import { ChainId, ChainsMap } from '../../../../../shared/chains';
import { RawTokenDataCache } from '../../../raw-data/raw-data';
import { TokenDistributionContext } from '../../../token-context/token-distribution/token-distribution-context';
import { ChainBaseMapper } from '../chain-base-mapper';
import { ChainBaseTopHolder } from '../types';
import topHoldersFixture from '../../../../../../tests/fixtures/chainbase/topHolders-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import { ChainFactory } from '../../../../chains/chain-factory';
import { createMockToken, createMockChain } from '../../../../../../tests/mocks';

// Mock the RawTokenDataCache
jest.mock('../../../raw-data/raw-data');
jest.mock('../../../../chains/chain-factory');

describe('ChainBaseMapper', () => {
    describe('getSupportedChains', () => {
        it('should return supported chain IDs', () => {
            const supportedChains = ChainBaseMapper.getSupportedChains();
            
            expect(supportedChains).toBeInstanceOf(Array);
            expect(supportedChains.length).toBeGreaterThan(0);
            expect(supportedChains).toContain(ChainsMap.bsc);
        });
    });

    describe('chainIdToChain', () => {
        it('should return the same chain ID', () => {
            const testChainId: ChainId = ChainsMap.bsc;
            const result = ChainBaseMapper.chainIdToChain(testChainId);
            
            expect(result).toBe(testChainId);
        });

        it('should work with different chain IDs', () => {
            const testCases: ChainId[] = [
                ChainsMap.ethereum,
                ChainsMap.bsc,
                ChainsMap.polygon,
                ChainsMap.avalanche,
                ChainsMap.arbitrum,
                ChainsMap.optimism,
                ChainsMap.base,
                ChainsMap.zksync
            ];
            
            testCases.forEach(chainId => {
                expect(ChainBaseMapper.chainIdToChain(chainId)).toBe(chainId);
            });
        });
    });
});

describe('TokenDistributionContext - getParsedChainBaseTopHolders', () => {
    let mockRawData: jest.Mocked<RawTokenDataCache>;
    let tokenDistributionContext: TokenDistributionContext;

    const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const testChainId: ChainId = ChainsMap.bsc;
    const testTokenPrice = 0.2244;
    const testTokenSupply = 1000000000;
    const testTokenCreator = '0x5511b9cba5f6a01f7685236393faca4415777f3d';

    // Create mock token using centralized mock - available to all tests
    const mockToken = createMockToken({
        address: testTokenAddress,
        chainId: testChainId,
        name: 'Test Token',
        symbol: 'TEST',
        totalSupply: testTokenSupply,
        pairAddress: '0xF0a949d3D93B833C183a27Ee067165B6F2C9625e',
    });

    beforeEach(() => {

        // Create mock raw data with proper jest mock functions
        mockRawData = {
            getTokenPrice: jest.fn(),
            getTokenSupply: jest.fn(),
            getTokenCreatedBy: jest.fn(),
            chainBase: {
                getTopHolders: jest.fn(),
            },
        } as any;

        // Mock the chain factory using centralized mock
        const mockChain = createMockChain({
            chainId: testChainId,
        });

        ChainFactory.getChain = jest.fn().mockReturnValue(mockChain);

        // Create token distribution context
        tokenDistributionContext = new TokenDistributionContext(mockRawData, mockToken);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getParsedChainBaseTopHolders', () => {
        it('should return empty array when chainBase top holders is null', async () => {
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(null);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result).toEqual([]);
        });

        it('should return empty array when token price is null', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(null);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result).toEqual([]);
        });

        it('should return empty array when token supply is null', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(null);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result).toEqual([]);
        });

        it('should return empty array when token creator is null', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(null);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result).toEqual([]);
        });

        it('should parse chainBase top holders correctly', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result).toHaveLength(5);
            expect(result[0]).toMatchObject({
                address: '0x5c952063c7fc8610ffdb798152d69f0b9550762b',
                amount: 999999999.999997456000000000,
                percentage: 100, // Rounded to 2 decimal places
                dollarValue: expect.closeTo(224399999.9999995, 1), // Allow for floating point precision
                isKOL: false,
                isWhale: false,
                significantHolderIn: [],
                isPool: false,
                isCreator: false,
            });
        });

        it('should calculate percentage correctly', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            // First holder has 999999999.999997456000000000 tokens out of 1000000000 total supply
            const expectedPercentage = (999999999.999997456000000000 / testTokenSupply) * 100;
            expect(result[0].percentage).toBe(Number(expectedPercentage.toFixed(2)));
        });

        it('should calculate dollar value correctly', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            // First holder has 999999999.999997456000000000 tokens at 0.2244 price
            const expectedDollarValue = 999999999.999997456000000000 * testTokenPrice;
            expect(result[0].dollarValue).toBe(expectedDollarValue);
        });

        it('should identify pool addresses correctly', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            
            // Create test data with a pool address
            const testHolders: ChainBaseTopHolder[] = [
                {
                    amount: '1000',
                    original_amount: '1000',
                    usd_value: '100',
                    wallet_address: mockToken.pairAddress, // This should be identified as pool
                },
                {
                    amount: '500',
                    original_amount: '500',
                    usd_value: '50',
                    wallet_address: '0x1234567890123456789012345678901234567890',
                },
            ];
            
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(testHolders);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result[0].isPool).toBe(true);
            expect(result[1].isPool).toBe(false);
        });

        it('should identify creator addresses correctly', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            
            // Create test data with the creator address
            const testHolders: ChainBaseTopHolder[] = [
                {
                    amount: '1000',
                    original_amount: '1000',
                    usd_value: '100',
                    wallet_address: testTokenCreator, // This should be identified as creator
                },
                {
                    amount: '500',
                    original_amount: '500',
                    usd_value: '50',
                    wallet_address: '0x1234567890123456789012345678901234567890',
                },
            ];
            
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(testHolders);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result[0].isCreator).toBe(true);
            expect(result[1].isCreator).toBe(false);
        });

        it('should handle case-insensitive address comparison for creator', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator.toUpperCase());
            
            const testHolders: ChainBaseTopHolder[] = [
                {
                    amount: '1000',
                    original_amount: '1000',
                    usd_value: '100',
                    wallet_address: testTokenCreator.toLowerCase(), // Different case
                },
            ];
            
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(testHolders);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result[0].isCreator).toBe(true);
        });

        it('should handle case-insensitive address comparison for pool', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            
            const testHolders: ChainBaseTopHolder[] = [
                {
                    amount: '1000',
                    original_amount: '1000',
                    usd_value: '100',
                    wallet_address: mockToken.pairAddress.toUpperCase(), // Different case
                },
            ];
            
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(testHolders);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result[0].isPool).toBe(true);
        });

        it('should filter out known addresses', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            // Update the mock chain to return true for the first address
            const ChainFactory = require('../../../../chains/chain-factory');
            const mockChain = ChainFactory.ChainFactory.getChain();
            mockChain.isKnownAddress = jest.fn((address: string) => address === '0x5c952063c7fc8610ffdb798152d69f0b9550762b');

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            // Should filter out the first address since it's a known address
            expect(result).toHaveLength(4);
            expect(result.find(h => h.address === '0x5c952063c7fc8610ffdb798152d69f0b9550762b')).toBeUndefined();
        });

        it('should handle empty top holders array', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue([]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result).toEqual([]);
        });

        it('should handle very small amounts correctly', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            
            const testHolders: ChainBaseTopHolder[] = [
                {
                    amount: '0.000000000000000001', // Very small amount
                    original_amount: '1',
                    usd_value: '0.000000',
                    wallet_address: '0x1234567890123456789012345678901234567890',
                },
            ];
            
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(testHolders);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            expect(result[0].amount).toBe(0.000000000000000001);
            expect(result[0].percentage).toBe(0);
            expect(result[0].dollarValue).toBe(0.000000000000000001 * testTokenPrice);
        });

        it('should return empty array when token price is zero', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(0);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(testTokenSupply);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            // Should return empty array when price is 0 (falsy value)
            expect(result).toEqual([]);
        });

        it('should handle zero token supply', async () => {
            (mockRawData.getTokenPrice as jest.Mock).mockResolvedValue(testTokenPrice);
            (mockRawData.getTokenSupply as jest.Mock).mockResolvedValue(0);
            (mockRawData.getTokenCreatedBy as jest.Mock).mockResolvedValue(testTokenCreator);
            (mockRawData.chainBase.getTopHolders as jest.Mock).mockResolvedValue(topHoldersFixture as ChainBaseTopHolder[]);

            const result = await tokenDistributionContext.getParsedChainBaseTopHolders();

            // Should return empty array when supply is 0
            expect(result).toEqual([]);
        });
    });
});