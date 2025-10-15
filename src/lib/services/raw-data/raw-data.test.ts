import { RawTokenDataCache } from './raw-data';
import { AutoTrackerToken } from '../../models/token';
import { BirdEyeFetcherService } from '../apis/birdeye/birdeye-service';
import { GmGnService } from '../apis/gmgn/gmgn-service';
import { MoralisService } from '../apis/moralis/moralis-service';
import { ChainBaseService } from '../apis/chain-base/chain-base-service';
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from '../apis/birdeye/client/types';
import { ChainBaseTopHolder } from '../apis/chain-base/types';

// Mock all service classes
jest.mock('../apis/birdeye/birdeye-service');
jest.mock('../apis/gmgn/gmgn-service');
jest.mock('../apis/moralis/moralis-service');
jest.mock('../apis/chain-base/chain-base-service');

describe('RawData', () => {
    let mockToken: AutoTrackerToken;
    let mockBirdeyeService: jest.Mocked<BirdEyeFetcherService>;
    let mockGmgnService: jest.Mocked<GmGnService>;
    let mockMoralisService: jest.Mocked<MoralisService>;
    let mockChainBaseService: jest.Mocked<ChainBaseService>;

    beforeEach(() => {
        // Setup mock token
        mockToken = {
            address: '0x123',
            chainId: '1',
            pairAddress: '0x456',
        } as AutoTrackerToken;

        // Setup mock services
        mockBirdeyeService = {
            getTokenSecurity: jest.fn(),
        } as any;

        mockGmgnService = {} as any;
        mockMoralisService = {} as any;

        mockChainBaseService = {
            fetchTopHoldersForToken: jest.fn(),
        } as any;

        // Mock getInstance methods
        (BirdEyeFetcherService.getInstance as jest.Mock).mockReturnValue(mockBirdeyeService);
        (GmGnService.getInstance as jest.Mock).mockReturnValue(mockGmgnService);
        (MoralisService.getInstance as jest.Mock).mockReturnValue(mockMoralisService);
        (ChainBaseService.getInstance as jest.Mock).mockReturnValue(mockChainBaseService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getBirdeyeTokenSecurity', () => {
        it('should return existing birdeye token security data if already cached', async () => {
            const mockTokenSecurity = {
                isOpenSource: 'true',
                isProxy: 'false',
                isMintable: 'false',
            } as BirdeyeEvmTokenSecurity;

            const rawData = new RawTokenDataCache(
                { birdeye: { tokenSecurity: mockTokenSecurity } },
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            const result = await rawData.getBirdeyeTokenSecurity();

            expect(result).toBe(mockTokenSecurity);
            expect(mockBirdeyeService.getTokenSecurity).not.toHaveBeenCalled();
        });

        it('should fetch and cache token security if not already present', async () => {
            const mockTokenSecurity = {
                isOpenSource: 'false',
                isMintable: 'true',
            } as unknown as BirdeyeSolanaTokenSecurity;

            mockBirdeyeService.getTokenSecurity.mockResolvedValue(mockTokenSecurity);

            const rawData = new RawTokenDataCache(
                {},
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            const result = await rawData.getBirdeyeTokenSecurity();

            expect(result).toBe(mockTokenSecurity);
            expect(mockBirdeyeService.getTokenSecurity).toHaveBeenCalledWith(
                mockToken.address,
                mockToken.chainId
            );
            expect(mockBirdeyeService.getTokenSecurity).toHaveBeenCalledTimes(1);
        });

        it('should cache fetched token security for subsequent calls', async () => {
            const mockTokenSecurity = {
                isOpenSource: 'true',
                isProxy: 'false',
            } as BirdeyeEvmTokenSecurity;

            mockBirdeyeService.getTokenSecurity.mockResolvedValue(mockTokenSecurity);

            const rawData = new RawTokenDataCache(
                {},
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            // First call should fetch
            const result1 = await rawData.getBirdeyeTokenSecurity();
            expect(result1).toBe(mockTokenSecurity);
            expect(mockBirdeyeService.getTokenSecurity).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await rawData.getBirdeyeTokenSecurity();
            expect(result2).toBe(mockTokenSecurity);
            expect(mockBirdeyeService.getTokenSecurity).toHaveBeenCalledTimes(1);
        });

        it('should update existing birdeye data object with token security', async () => {
            const mockTokenSecurity = {
                isOpenSource: 'true',
            } as BirdeyeEvmTokenSecurity;

            mockBirdeyeService.getTokenSecurity.mockResolvedValue(mockTokenSecurity);

            const initialData = { birdeye: { otherField: 'value' } as any };
            const rawData = new RawTokenDataCache(
                initialData,
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            await rawData.getBirdeyeTokenSecurity();

            expect(initialData.birdeye).toHaveProperty('tokenSecurity', mockTokenSecurity);
            expect(initialData.birdeye).toHaveProperty('otherField', 'value');
        });
    });

    describe('getChainBaseTopHolders', () => {
        it('should return existing top holders data if already cached', async () => {
            const mockTopHolders: ChainBaseTopHolder[] = [
                { amount: '1000', original_amount: '1000', usd_value: '100', wallet_address: '0xabc' },
                { amount: '500', original_amount: '500', usd_value: '50', wallet_address: '0xdef' },
            ];

            const rawData = new RawTokenDataCache(
                { chainBase: { topHolders: mockTopHolders } },
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            const result = await rawData.getChainBaseTopHolders();

            expect(result).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).not.toHaveBeenCalled();
        });

        it('should fetch and cache top holders if not already present', async () => {
            const mockTopHolders: ChainBaseTopHolder[] = [
                { amount: '2000', original_amount: '2000', usd_value: '200', wallet_address: '0x111' },
            ];

            mockChainBaseService.fetchTopHoldersForToken.mockResolvedValue(mockTopHolders);

            const rawData = new RawTokenDataCache(
                {},
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            const result = await rawData.getChainBaseTopHolders();

            expect(result).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).toHaveBeenCalledWith(
                mockToken.address,
                mockToken.pairAddress,
                mockToken.chainId
            );
            expect(mockChainBaseService.fetchTopHoldersForToken).toHaveBeenCalledTimes(1);
        });

        it('should cache fetched top holders for subsequent calls', async () => {
            const mockTopHolders: ChainBaseTopHolder[] = [
                { amount: '3000', original_amount: '3000', usd_value: '300', wallet_address: '0x222' },
            ];

            mockChainBaseService.fetchTopHoldersForToken.mockResolvedValue(mockTopHolders);

            const rawData = new RawTokenDataCache(
                {},
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            // First call should fetch
            const result1 = await rawData.getChainBaseTopHolders();
            expect(result1).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await rawData.getChainBaseTopHolders();
            expect(result2).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).toHaveBeenCalledTimes(1);
        });

        it('should update existing chainBase data object with top holders', async () => {
            const mockTopHolders: ChainBaseTopHolder[] = [
                { amount: '4000', original_amount: '4000', usd_value: '400', wallet_address: '0x333' },
            ];

            mockChainBaseService.fetchTopHoldersForToken.mockResolvedValue(mockTopHolders);

            const initialData = { chainBase: { otherField: 'value' } as any };
            const rawData = new RawTokenDataCache(
                initialData,
                mockToken,
                mockBirdeyeService,
                mockGmgnService,
                mockMoralisService,
                mockChainBaseService
            );

            await rawData.getChainBaseTopHolders();

            expect(initialData.chainBase).toHaveProperty('topHolders', mockTopHolders);
            expect(initialData.chainBase).toHaveProperty('otherField', 'value');
        });
    });
});
