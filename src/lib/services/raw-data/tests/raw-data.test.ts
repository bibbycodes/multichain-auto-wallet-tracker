import { RawTokenDataCache } from '../raw-data';
import { AutoTrackerToken } from '../../../models/token';
import { BirdEyeFetcherService } from '../../apis/birdeye/birdeye-service';
import { GmGnService } from '../../apis/gmgn/gmgn-service';
import { MoralisService } from '../../apis/moralis/moralis-service';
import { ChainBaseService } from '../../apis/chain-base/chain-base-service';
import { GoPlusService } from '../../apis/goplus/goplus-service';
import { GeckoTerminalService } from '../../apis/gecko-terminal/gecko-terminal-service';
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from '../../apis/birdeye/client/types';
import { ChainBaseTopHolder } from '../../apis/chain-base/types';
import { GoPlusTokenSecurity, TokenSecurityResponse } from 'python-proxy-scraper-client';
import { GeckoTerminalTokenDetails } from 'python-proxy-scraper-client';

// Import fixture data
import goPlusTokenSecurityFixture from '../../../../../tests/fixtures/goplus/tokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import geckoTerminalTokenDetailsFixture from '../../../../../tests/fixtures/gecko-terminal/tokenDetails-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

// Mock all service classes
jest.mock('../../apis/birdeye/birdeye-service');
jest.mock('../../apis/gmgn/gmgn-service');
jest.mock('../../apis/moralis/moralis-service');
jest.mock('../../apis/chain-base/chain-base-service');
jest.mock('../../apis/goplus/goplus-service');
jest.mock('../../apis/gecko-terminal/gecko-terminal-service');

describe('RawData', () => {
    let mockToken: AutoTrackerToken;
    let mockBirdeyeService: jest.Mocked<BirdEyeFetcherService>;
    let mockGmgnService: jest.Mocked<GmGnService>;
    let mockMoralisService: jest.Mocked<MoralisService>;
    let mockChainBaseService: jest.Mocked<ChainBaseService>;
    let mockGoPlusService: jest.Mocked<GoPlusService>;
    let mockGeckoTerminalService: jest.Mocked<GeckoTerminalService>;

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

        mockGoPlusService = {
            getTokenSecurity: jest.fn(),
            getRugpullDetection: jest.fn(),
        } as any;

        mockGeckoTerminalService = {
            getTokenDetails: jest.fn(),
            getTokenPools: jest.fn(),
        } as any;

        // Mock getInstance methods
        (BirdEyeFetcherService.getInstance as jest.Mock).mockReturnValue(mockBirdeyeService);
        (GmGnService.getInstance as jest.Mock).mockReturnValue(mockGmgnService);
        (MoralisService.getInstance as jest.Mock).mockReturnValue(mockMoralisService);
        (ChainBaseService.getInstance as jest.Mock).mockReturnValue(mockChainBaseService);
        (GoPlusService.getInstance as jest.Mock).mockReturnValue(mockGoPlusService);
        (GeckoTerminalService.getInstance as jest.Mock).mockReturnValue(mockGeckoTerminalService);
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
                mockToken.address,
                mockToken.chainId,
                { birdeye: { tokenSecurity: mockTokenSecurity } }
            );

            const result = await rawData.birdeye.getTokenSecurity();

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
                mockToken.address,
                mockToken.chainId,
                {}
            );

            const result = await rawData.birdeye.getTokenSecurity();

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
                mockToken.address,
                mockToken.chainId,
                {}
            );

            // First call should fetch
            const result1 = await rawData.birdeye.getTokenSecurity();
            expect(result1).toBe(mockTokenSecurity);
            expect(mockBirdeyeService.getTokenSecurity).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await rawData.birdeye.getTokenSecurity();
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
                mockToken.address,
                mockToken.chainId,
                initialData
            );

            await rawData.birdeye.getTokenSecurity();

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
                mockToken.address,
                mockToken.chainId,
                { chainBase: { topHolders: mockTopHolders } }
            );

            const result = await rawData.chainBase.getTopHolders();

            expect(result).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).not.toHaveBeenCalled();
        });

        it('should fetch and cache top holders if not already present', async () => {
            const mockTopHolders: ChainBaseTopHolder[] = [
                { amount: '2000', original_amount: '2000', usd_value: '200', wallet_address: '0x111' },
            ];

            mockChainBaseService.fetchTopHoldersForToken.mockResolvedValue(mockTopHolders);

            const rawData = new RawTokenDataCache(
                mockToken.address,
                mockToken.chainId,
                {}
            );

            const result = await rawData.chainBase.getTopHolders();

            expect(result).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).toHaveBeenCalledWith(
                mockToken.address,
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
                mockToken.address,
                mockToken.chainId,
                {}
            );

            // First call should fetch
            const result1 = await rawData.chainBase.getTopHolders();
            expect(result1).toBe(mockTopHolders);
            expect(mockChainBaseService.fetchTopHoldersForToken).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await rawData.chainBase.getTopHolders();
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
                mockToken.address,
                mockToken.chainId,
                initialData
            );

            await rawData.chainBase.getTopHolders();

            expect(initialData.chainBase).toHaveProperty('topHolders', mockTopHolders);
            expect(initialData.chainBase).toHaveProperty('otherField', 'value');
        });
    });

    describe('getGoPlusTokenSecurity', () => {
        it('should return existing GoPlus token security data if already cached', async () => {
            const rawData = new RawTokenDataCache(
                mockToken.address,
                mockToken.chainId,
                { goPlus: { tokenSecurity: goPlusTokenSecurityFixture as unknown as GoPlusTokenSecurity } }
            );

            const result = await rawData.goPlus.getTokenSecurity();

            expect(result).toBe(goPlusTokenSecurityFixture);
            expect(mockGoPlusService.getTokenSecurity).not.toHaveBeenCalled();
        });

        it('should fetch and cache GoPlus token security if not already present', async () => {
            mockGoPlusService.getTokenSecurity.mockResolvedValue(goPlusTokenSecurityFixture as unknown as GoPlusTokenSecurity);

            const rawData = new RawTokenDataCache(
                mockToken.address,
                mockToken.chainId,
                {}
            );

            const result = await rawData.goPlus.getTokenSecurity();

            expect(result).toBe(goPlusTokenSecurityFixture);
            expect(mockGoPlusService.getTokenSecurity).toHaveBeenCalledWith(
                mockToken.address,
                mockToken.chainId
            );
            expect(mockGoPlusService.getTokenSecurity).toHaveBeenCalledTimes(1);
        });
    });

    describe('getGeckoTerminalTokenDetails', () => {
        it('should return existing GeckoTerminal token details if already cached', async () => {
            const rawData = new RawTokenDataCache(
                mockToken.address,
                mockToken.chainId,
                { geckoTerminal: { tokenDetails: geckoTerminalTokenDetailsFixture as unknown as GeckoTerminalTokenDetails } }
            );

            const result = await rawData.geckoTerminal.getTokenDetails();

            expect(result).toBe(geckoTerminalTokenDetailsFixture);
            expect(mockGeckoTerminalService.getTokenDetails).not.toHaveBeenCalled();
        });

        it('should fetch and cache GeckoTerminal token details if not already present', async () => {
            mockGeckoTerminalService.getTokenDetails.mockResolvedValue(geckoTerminalTokenDetailsFixture as unknown as GeckoTerminalTokenDetails);

            const rawData = new RawTokenDataCache(
                mockToken.address,
                mockToken.chainId,
                {}
            );

            const result = await rawData.geckoTerminal.getTokenDetails();

            expect(result).toBe(geckoTerminalTokenDetailsFixture);
            expect(mockGeckoTerminalService.getTokenDetails).toHaveBeenCalledWith(
                mockToken.address,
                mockToken.chainId
            );
            expect(mockGeckoTerminalService.getTokenDetails).toHaveBeenCalledTimes(1);
        });
    });
});
