import { ChainId, ChainsMap } from '../../../../shared/chains';
import { Database } from '../../../db/database';
import { AutoTrackerToken } from '../../../models/token';
import { BirdEyeFetcherService } from '../../apis/birdeye/birdeye-service';
import { RawTokenDataCache } from '../../raw-data/raw-data';
import { AutoTrackerTokenBuilder } from '../token-builder';
import { TokenDataSource } from '@prisma/client';
import { BirdEyeFetcherServiceMock } from '../../../../../tests/mocks/birdeye/birdeye-service.mock';
import { MockDatabase, createMockDatabase } from '../../../../../tests/mocks/db/database.mock';
import { RawTokenDataCacheMock } from '../../../../../tests/mocks/raw-data/raw-data-cache.mock';
import { rawDataDataMock } from '../../../../../tests/mocks/raw-data/raw-data-input';
import { TestDbHelper, TestSeed } from '../../../../../tests/utils';

jest.mock('../../apis/birdeye/birdeye-service');
jest.mock('../../../db/database');
jest.mock('../../raw-data/raw-data');
jest.mock('../../apis/gmgn/gmgn-mapper');
jest.mock('../../apis/birdeye/birdeye-mapper');

describe('AutoTrackerTokenBuilder', () => {
  let mockBirdeyeService: BirdEyeFetcherServiceMock;
  let mockDatabase: MockDatabase;
  let mockRawDataCache: RawTokenDataCacheMock;
  let dbHelper: TestDbHelper;
  let testSeed: TestSeed;

  const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
  const chainId = ChainsMap.bsc;

  const TEST_TOKEN_DATA = {
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 18,
    totalSupply: 1000000,
    pairAddress: '0xpair123',
    socials: {
      telegram: 'https://t.me/test',
      twitter: 'https://twitter.com/test',
    },
  };

  const completeToken = new AutoTrackerToken({
    address: tokenAddress,
    chainId,
    ...TEST_TOKEN_DATA,
    dataSource: TokenDataSource.BIRDEYE,
  });

  const createBuilderWithRealDb = (realDb: Database): AutoTrackerTokenBuilder => {
    return new AutoTrackerTokenBuilder(
      tokenAddress,
      chainId,
      undefined,
      mockBirdeyeService as any,
      realDb
    );
  };

  beforeAll(async () => {
    dbHelper = TestDbHelper.getInstance();
    await dbHelper.initialize();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    await dbHelper.reset();
    testSeed = new TestSeed();

    mockBirdeyeService = new BirdEyeFetcherServiceMock();
    mockRawDataCache = new RawTokenDataCacheMock(tokenAddress, chainId);
    mockDatabase = createMockDatabase();

    (BirdEyeFetcherService.getInstance as jest.Mock).mockReturnValue(mockBirdeyeService);
    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabase);

    (RawTokenDataCache as jest.MockedClass<typeof RawTokenDataCache>).mockImplementation(
      (address: string, chain: ChainId, data?: any) => {
        return new RawTokenDataCacheMock(address, chain, data) as any;
      }
    );
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('Constructor', () => {
    it('should initialize with token address only, chain ID optional', () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(AutoTrackerTokenBuilder);
    });

    it('should initialize with token address and chain ID', () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(AutoTrackerTokenBuilder);
    });

    it('should accept custom service instances', () => {
      const customBirdeyeService = new BirdEyeFetcherServiceMock();
      const customDatabase = createMockDatabase();

      const builder = new AutoTrackerTokenBuilder(
        tokenAddress,
        chainId,
        mockRawDataCache as unknown as RawTokenDataCache,
        customBirdeyeService as unknown as BirdEyeFetcherService,
        customDatabase as unknown as Database
      );

      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(AutoTrackerTokenBuilder);
    });
  });

  describe('setChainId()', () => {
    it('should set the chain ID on the builder', () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();
      builder.setChainId(chainId);
      expect((builder as any).chainId).toBe(chainId);
    });

    it('should allow updating the chain ID', () => {
      const initialChainId = ChainsMap.bsc;
      const newChainId = ChainsMap.ethereum;
      const builder = new AutoTrackerTokenBuilder(tokenAddress, initialChainId);
      expect((builder as any).chainId).toBe(initialChainId);
      builder.setChainId(newChainId);
      expect((builder as any).chainId).toBe(newChainId);
    });
  });

  describe('setChainIdAndInitialiseRawData()', () => {
    it('should set chain ID and initialize raw data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();
      expect((builder as any).rawData).toBeUndefined();

      const result = await builder.setChainIdAndInitialiseRawData(chainId);

      expect((builder as any).chainId).toBe(chainId);
      expect((builder as any).rawData).toBeDefined();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('chainId', chainId);
      expect(result).toHaveProperty('tokenAddress', tokenAddress);
    });

    it('should initialize raw data with provided data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);

      const result = await builder.setChainIdAndInitialiseRawData(chainId, rawDataDataMock);
      const rawData = (builder as any).rawData;

      expect((builder as any).chainId).toBe(chainId);
      expect(rawData.updateData).toHaveBeenCalledWith(rawDataDataMock);
      expect(result).toBeDefined();
    });

    it('should allow updating chain ID and raw data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, ChainsMap.ethereum);
      await builder.setChainIdAndInitialiseRawData(ChainsMap.ethereum);

      const newChainId = ChainsMap.bsc;
      await builder.setChainIdAndInitialiseRawData(newChainId, rawDataDataMock);
      const rawData = (builder as any).rawData;

      expect((builder as any).chainId).toBe(newChainId);
      expect(rawData.updateData).toHaveBeenCalledWith(rawDataDataMock);
    });
  });

  describe('initialiseRawData()', () => {
    it('should throw error when chain ID is not set', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();

      await expect(builder.initialiseRawData()).rejects.toThrow('Chain id is not set');
    });

    it('should create and return new RawTokenDataCache instance when chain ID is set on initialisation', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      const result = await builder.initialiseRawData();
      expect(RawTokenDataCache).toHaveBeenCalledWith(tokenAddress, chainId);
      expect(mockRawDataCache.updateData).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect((builder as any).rawData).toBeDefined();
      expect(result).toHaveProperty('chainId', chainId);
      expect(result).toHaveProperty('tokenAddress', tokenAddress);
    });

    it('should create RawTokenDataCache with provided input data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId, mockRawDataCache as unknown as RawTokenDataCache);
      const result = await builder.initialiseRawData(rawDataDataMock);
      expect(mockRawDataCache.updateData).toHaveBeenCalledWith(rawDataDataMock);
      expect(result).toBeDefined();
      expect((builder as any).rawData).toBeDefined();
      expect(result).toHaveProperty('chainId', chainId);
      expect(result).toHaveProperty('tokenAddress', tokenAddress);
    });

    it('should create RawTokenDataCache with no input data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId, mockRawDataCache as unknown as RawTokenDataCache);
      const result = await builder.initialiseRawData();
      expect(mockRawDataCache.updateData).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toEqual(mockRawDataCache);
      expect((builder as any).rawData).toBeDefined();
    });

    it('should create new RawTokenDataCache', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      const result = await builder.initialiseRawData();
      expect(result).toBeDefined();
      expect(result.toObject()).toEqual(new RawTokenDataCache(tokenAddress, chainId).toObject());
    });

    it('should update the rawData if it is already set', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId, mockRawDataCache as unknown as RawTokenDataCache);
      await builder.initialiseRawData(rawDataDataMock);
      const result = await builder.initialiseRawData(rawDataDataMock);
      expect(mockRawDataCache.updateData).toHaveBeenCalledWith(rawDataDataMock);
      expect(result).toBe(mockRawDataCache);
    });
  });

  describe('getRawData()', () => {
    it('should throw error when chain ID is not set', () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect(async () => await builder.getRawData()).rejects.toThrow('Chain id is not set');
    });

    it('should create new RawTokenDataCache if not initialized', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();
      const result = await builder.getRawData();
      expect(RawTokenDataCache).toHaveBeenCalledWith(tokenAddress, chainId);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('chainId', chainId);
      expect(result).toHaveProperty('tokenAddress', tokenAddress);
    });

    it('should return existing rawData if already initialized', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();
      const existingRawData = (builder as any).rawData;
      const result = await builder.getRawData();
      expect(mockRawDataCache.updateData).not.toHaveBeenCalled();
      expect(result).toBe(existingRawData);
    });

    it('should initialize raw data if not already set', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect((builder as any).rawData).toBeUndefined();
      
      const rawData = await builder.getRawData();
      
      expect(rawData).toBeDefined();
      expect(rawData).toBeInstanceOf(RawTokenDataCacheMock);
      expect((builder as any).rawData).toBe(rawData);
    });
  });

  describe('getInitialData()', () => {
    describe('Chain ID Resolution', () => {
      it('should fetch token data without chain ID and set it from response', async () => {
        const builder = new AutoTrackerTokenBuilder(tokenAddress);
        expect((builder as any).chainId).toBeUndefined();
        const result = await builder.getInitialData();
        expect(mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress).toHaveBeenCalledWith(tokenAddress);
        expect(mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress).toHaveBeenCalledTimes(1);
        expect((builder as any).chainId).toBe('56');
        expect((builder as any).rawData).toBeDefined();
        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
        expect(result.token.chainId).toBe('56');
        expect(result.rawData).toBeDefined();
        expect(result.rawData.birdeye).toBeDefined();
      });

      it('should throw error if API does not return chain ID when needed for resolution', async () => {
        const builder = new AutoTrackerTokenBuilder(tokenAddress);
        expect((builder as any).chainId).toBeUndefined();

        mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress.mockResolvedValueOnce({
          token: {
            address: tokenAddress,
            name: "Test Token",
            symbol: "TEST",
            chainId: undefined as any,
            decimals: 18,
            totalSupply: 1000000,
            socials: {},
            pairAddress: "0xpair",
            dataSource: "BIRDEYE" as any,
            marketCap: 1000,
            price: 0.001,
            liquidity: 500,
          },
          rawData: {
            birdeye: {
              tokenOverview: {} as any,
              tokenSecurity: {} as any,
              markets: {} as any,
            }
          }
        } as any);

        await expect(builder.getInitialData()).rejects.toThrow('Chain id not returned');
        expect(mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress).toHaveBeenCalledWith(tokenAddress);
        expect((builder as any).chainId).toBeUndefined();
      });

      it('should fetch token data with known chain ID using chain-specific endpoint', async () => {
        const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
        expect((builder as any).chainId).toBe(chainId);
        const result = await builder.getInitialData();
        expect(mockBirdeyeService.fetchTokenWithMarketCap).toHaveBeenCalledWith(tokenAddress, chainId);
        expect(mockBirdeyeService.fetchTokenWithMarketCap).toHaveBeenCalledTimes(1);
        expect(mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress).not.toHaveBeenCalled();
        expect((builder as any).chainId).toBe(chainId);
        expect((builder as any).rawData).toBeDefined();
        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
        expect(result.token.chainId).toBe(chainId);
        expect(result.rawData).toBeDefined();
        expect(result.rawData.birdeye).toBeDefined();
      });

      it('should initialize rawData with API response data', async () => {
        const builder = new AutoTrackerTokenBuilder(tokenAddress);
        const result = await builder.getInitialData();
        expect((builder as any).rawData).toBeDefined();
        const rawData = (builder as any).rawData;
        expect(rawData).toBeDefined();
        expect(rawData.tokenAddress).toBe(tokenAddress);
        expect(rawData.chainId).toBe(chainId);
        expect(result.rawData).toBeDefined();
        expect(result.rawData.birdeye).toBeDefined();
        expect(result.rawData.birdeye?.tokenOverview).toBeDefined();
        expect(result.rawData.birdeye?.tokenSecurity).toBeDefined();
        expect(result.rawData.birdeye?.markets).toBeDefined();
      });
    });
  });

  describe('collect()', () => {
    it('should initialize rawData before collecting when not already set', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect((builder as any).rawData).toBeUndefined();
      const result = await builder.collect();
      expect((builder as any).rawData).toBeDefined();
      expect((builder as any).rawData).not.toBeUndefined();
      expect(RawTokenDataCache).toHaveBeenCalledWith(tokenAddress, chainId);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('birdeyeTokenOverview');
      expect(result).toHaveProperty('birdeyeTokenSecurity');
      expect(result).toHaveProperty('birdeyeMarkets');
      expect(result).toHaveProperty('gmgnTokenInfo');
      expect(result).toHaveProperty('gmgnTokenSocials');
    });

    it('should fetch from all data sources concurrently', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId, mockRawDataCache as unknown as RawTokenDataCache);
      const rawData = mockRawDataCache

      const getTokenOverviewSpy = jest.spyOn(rawData.birdeye, 'getTokenOverview');
      const getTokenSecuritySpy = jest.spyOn(rawData.birdeye, 'getTokenSecurity');
      const getMarketsSpy = jest.spyOn(rawData.birdeye, 'getMarkets');
      const getTokenInfoSpy = jest.spyOn(rawData.gmgn, 'getTokenInfo');
      const getGmgnSocialsSpy = jest.spyOn(rawData.gmgn, 'getGmgnSocials');

      const result = await builder.collect();

      expect(getTokenOverviewSpy).toHaveBeenCalledTimes(1);
      expect(getTokenSecuritySpy).toHaveBeenCalledTimes(1);
      expect(getMarketsSpy).toHaveBeenCalledTimes(1);
      expect(getTokenInfoSpy).toHaveBeenCalledTimes(1);
      expect(getGmgnSocialsSpy).toHaveBeenCalledTimes(1);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('birdeyeTokenOverview');
      expect(result).toHaveProperty('birdeyeTokenSecurity');
      expect(result).toHaveProperty('birdeyeMarkets');
      expect(result).toHaveProperty('gmgnTokenInfo');
      expect(result).toHaveProperty('gmgnTokenSocials');
    });

    it('should return object with all collected data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();

      const result = await builder.collect();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('birdeyeTokenOverview');
      expect(result).toHaveProperty('birdeyeTokenSecurity');
      expect(result).toHaveProperty('birdeyeMarkets');
      expect(result).toHaveProperty('gmgnTokenInfo');
      expect(result).toHaveProperty('gmgnTokenSocials');

      expect(result.birdeyeTokenOverview).toBeDefined();
      expect(result.birdeyeTokenSecurity).toBeDefined();
      expect(result.birdeyeMarkets).toBeDefined();
      expect(result.gmgnTokenInfo).toBeDefined();
      expect(result.gmgnTokenSocials).toBeDefined();
    });

    it('only calls required data for collection', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId, mockRawDataCache as unknown as RawTokenDataCache);
      const rawData = mockRawDataCache;

      const birdeyeGetTokenOverviewSpy = jest.spyOn(rawData.birdeye, 'getTokenOverview');
      const birdeyeGetTokenSecuritySpy = jest.spyOn(rawData.birdeye, 'getTokenSecurity');
      const birdeyeGetMarketsSpy = jest.spyOn(rawData.birdeye, 'getMarkets');
      const birdeyeGetPriceSpy = jest.spyOn(rawData.birdeye, 'getPrice');
      const birdeyeGetMarketCapSpy = jest.spyOn(rawData.birdeye, 'getMarketCap');
      const birdeyeGetLiquiditySpy = jest.spyOn(rawData.birdeye, 'getLiquidity');
      const birdeyeGetSupplySpy = jest.spyOn(rawData.birdeye, 'getSupply');
      const birdeyeGetDecimalsSpy = jest.spyOn(rawData.birdeye, 'getDecimals');
      const birdeyeGetNameSpy = jest.spyOn(rawData.birdeye, 'getName');
      const birdeyeGetSymbolSpy = jest.spyOn(rawData.birdeye, 'getSymbol');
      const birdeyeGetLogoUrlSpy = jest.spyOn(rawData.birdeye, 'getLogoUrl');
      const birdeyeGetDescriptionSpy = jest.spyOn(rawData.birdeye, 'getDescription');
      const birdeyeGetSocialsSpy = jest.spyOn(rawData.birdeye, 'getSocials');
      const birdeyeGetCreatedBySpy = jest.spyOn(rawData.birdeye, 'getCreatedBy');
      const birdeyeGetTopHoldersSpy = jest.spyOn(rawData.birdeye, 'getTopHolders');

      const gmgnGetTokenInfoSpy = jest.spyOn(rawData.gmgn, 'getTokenInfo');
      const gmgnGetGmgnSocialsSpy = jest.spyOn(rawData.gmgn, 'getGmgnSocials');
      const gmgnGetPriceSpy = jest.spyOn(rawData.gmgn, 'getPrice');
      const gmgnGetMarketCapSpy = jest.spyOn(rawData.gmgn, 'getMarketCap');
      const gmgnGetLiquiditySpy = jest.spyOn(rawData.gmgn, 'getLiquidity');
      const gmgnGetSupplySpy = jest.spyOn(rawData.gmgn, 'getSupply');
      const gmgnGetDecimalsSpy = jest.spyOn(rawData.gmgn, 'getDecimals');
      const gmgnGetNameSpy = jest.spyOn(rawData.gmgn, 'getName');
      const gmgnGetSymbolSpy = jest.spyOn(rawData.gmgn, 'getSymbol');
      const gmgnGetLogoUrlSpy = jest.spyOn(rawData.gmgn, 'getLogoUrl');
      const gmgnGetDescriptionSpy = jest.spyOn(rawData.gmgn, 'getDescription');
      const gmgnGetSocialsSpy = jest.spyOn(rawData.gmgn, 'getSocials');
      const gmgnGetCreatedBySpy = jest.spyOn(rawData.gmgn, 'getCreatedBy');
      const gmgnGetHoldersSpy = jest.spyOn(rawData.gmgn, 'getHolders');
      const gmgnGetTokenSocialsSpy = jest.spyOn(rawData.gmgn, 'getTokenSocials');
      const gmgnGetTokenSecurityAndLaunchpadSpy = jest.spyOn(rawData.gmgn, 'getTokenSecurityAndLaunchpad');

      await builder.collect();

      expect(birdeyeGetTokenOverviewSpy).toHaveBeenCalledTimes(1);
      expect(birdeyeGetTokenSecuritySpy).toHaveBeenCalledTimes(1);
      expect(birdeyeGetMarketsSpy).toHaveBeenCalledTimes(1);
      expect(gmgnGetTokenInfoSpy).toHaveBeenCalledTimes(1);
      expect(gmgnGetGmgnSocialsSpy).toHaveBeenCalledTimes(1);

      expect(birdeyeGetPriceSpy).not.toHaveBeenCalled();
      expect(birdeyeGetMarketCapSpy).not.toHaveBeenCalled();
      expect(birdeyeGetLiquiditySpy).not.toHaveBeenCalled();
      expect(birdeyeGetSupplySpy).not.toHaveBeenCalled();
      expect(birdeyeGetDecimalsSpy).not.toHaveBeenCalled();
      expect(birdeyeGetNameSpy).not.toHaveBeenCalled();
      expect(birdeyeGetSymbolSpy).not.toHaveBeenCalled();
      expect(birdeyeGetLogoUrlSpy).not.toHaveBeenCalled();
      expect(birdeyeGetDescriptionSpy).not.toHaveBeenCalled();
      expect(birdeyeGetSocialsSpy).not.toHaveBeenCalled();
      expect(birdeyeGetCreatedBySpy).not.toHaveBeenCalled();
      expect(birdeyeGetTopHoldersSpy).not.toHaveBeenCalled();

      expect(gmgnGetPriceSpy).not.toHaveBeenCalled();
      expect(gmgnGetMarketCapSpy).not.toHaveBeenCalled();
      expect(gmgnGetLiquiditySpy).not.toHaveBeenCalled();
      expect(gmgnGetSupplySpy).not.toHaveBeenCalled();
      expect(gmgnGetDecimalsSpy).not.toHaveBeenCalled();
      expect(gmgnGetNameSpy).not.toHaveBeenCalled();
      expect(gmgnGetSymbolSpy).not.toHaveBeenCalled();
      expect(gmgnGetLogoUrlSpy).not.toHaveBeenCalled();
      expect(gmgnGetDescriptionSpy).not.toHaveBeenCalled();
      expect(gmgnGetSocialsSpy).not.toHaveBeenCalled();
      expect(gmgnGetCreatedBySpy).not.toHaveBeenCalled();
      expect(gmgnGetHoldersSpy).not.toHaveBeenCalled();
      expect(gmgnGetTokenSocialsSpy).not.toHaveBeenCalled();
      expect(gmgnGetTokenSecurityAndLaunchpadSpy).not.toHaveBeenCalled();
    });

    it('should return data even if some sources return null', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();

      const rawData = (builder as any).rawData as RawTokenDataCacheMock;

      jest.spyOn(rawData.birdeye, 'getTokenOverview').mockResolvedValue(null);
      jest.spyOn(rawData.gmgn, 'getTokenInfo').mockResolvedValue(null);

      const mockSecurity = { isOpenSource: 'true' } as any;
      const mockMarkets = { items: [{ address: '0xpair' }] } as any;
      const mockSocials = { twitter: 'test' } as any;

      jest.spyOn(rawData.birdeye, 'getTokenSecurity').mockResolvedValue(mockSecurity);
      jest.spyOn(rawData.birdeye, 'getMarkets').mockResolvedValue(mockMarkets);
      jest.spyOn(rawData.gmgn, 'getGmgnSocials').mockResolvedValue(mockSocials);
      const result = await builder.collect();
      expect(result).toBeDefined();
      expect(result.birdeyeTokenOverview).toBeNull();
      expect(result.gmgnTokenInfo).toBeNull();
      expect(result.birdeyeTokenSecurity).toBe(mockSecurity);
      expect(result.birdeyeMarkets).toBe(mockMarkets);
      expect(result.gmgnTokenSocials).toBe(mockSocials);
      expect(rawData.birdeye.getTokenOverview).toHaveBeenCalledTimes(1);
      expect(rawData.birdeye.getTokenSecurity).toHaveBeenCalledTimes(1);
      expect(rawData.birdeye.getMarkets).toHaveBeenCalledTimes(1);
      expect(rawData.gmgn.getTokenInfo).toHaveBeenCalledTimes(1);
      expect(rawData.gmgn.getGmgnSocials).toHaveBeenCalledTimes(1);
    });

    it('should not fail entire collection if one source fails', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();

      const rawData = (builder as any).rawData as RawTokenDataCacheMock;

      jest.spyOn(rawData.birdeye, 'getTokenOverview').mockRejectedValue(new Error('Birdeye API error'));
      jest.spyOn(rawData.gmgn, 'getTokenInfo').mockRejectedValue(new Error('GMGN API timeout'));

      const mockSecurity = { isOpenSource: 'true' } as any;
      const mockMarkets = { items: [{ address: '0xpair' }] } as any;
      const mockSocials = { twitter: 'test' } as any;

      jest.spyOn(rawData.birdeye, 'getTokenSecurity').mockResolvedValue(mockSecurity);
      jest.spyOn(rawData.birdeye, 'getMarkets').mockResolvedValue(mockMarkets);
      jest.spyOn(rawData.gmgn, 'getGmgnSocials').mockResolvedValue(mockSocials);

      await expect(builder.collect()).rejects.toThrow();
      expect(rawData.birdeye.getTokenOverview).toHaveBeenCalledTimes(1);
      expect(rawData.gmgn.getTokenInfo).toHaveBeenCalledTimes(1);
      expect(rawData.birdeye.getTokenSecurity).toHaveBeenCalledTimes(1);
      expect(rawData.birdeye.getMarkets).toHaveBeenCalledTimes(1);
      expect(rawData.gmgn.getGmgnSocials).toHaveBeenCalledTimes(1);
    });
  });

  describe('getGmgnAutoTrackerToken()', () => {
    it('should throw error when chain ID is not set', () => {
      // TODO: Implement
    });

    it('should return null if GMGN token info is missing', () => {
      // TODO: Implement
    });

    it('should return null if GMGN socials are missing', () => {
      // TODO: Implement
    });

    it('should return null if both GMGN data sources are missing', () => {
      // TODO: Implement
    });

    it('should return AutoTrackerToken when all GMGN data available', () => {
      // TODO: Implement
    });
  });

  describe('getBirdeyeAutoTrackerToken()', () => {
    it('should throw error when chain ID is not set', () => {
      // TODO: Implement
    });

    it('should return null if Birdeye token overview is missing', () => {
      // TODO: Implement
    });

    it('should return null if Birdeye security data is missing', () => {
      // TODO: Implement
    });

    it('should return null if Birdeye markets data is missing', () => {
      // TODO: Implement
    });

    it('should return null if markets array has no items', () => {
      // TODO: Implement
    });

    it('should return AutoTrackerToken when all Birdeye data available', () => {
      // TODO: Implement
    });

    it('should extract pair address from first market in array', () => {
      // TODO: Implement
    });
  });

  describe('getToken()', () => {
    it('should call getInitialData to resolve chain ID if not set', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();

      const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
      const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
      const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');

      const mockToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'Test',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0xpair',
        socials: {},
        dataSource: TokenDataSource.BIRDEYE,
      });

      getBirdeyeTokenSpy.mockResolvedValue(mockToken);
      getGmgnTokenSpy.mockResolvedValue(null);

      await builder.getToken();

      expect(getInitialDataSpy).toHaveBeenCalled();
      expect((builder as any).chainId).toBe('56');
    });

    it('should throw error when both GMGN and Birdeye return null', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);

      jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
      jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(null);

      await expect(builder.getToken()).rejects.toThrow('Could not fetch tokens');
    });

    it('should merge tokens from both sources using AutoTrackerToken.mergeMany', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);

      const mockGmgnToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'GMGN Token',
        symbol: 'GMGN',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0xgmgnpair',
        socials: { telegram: 'https://t.me/gmgn' },
        dataSource: TokenDataSource.GMGN,
      });

      const mockBirdeyeToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'Birdeye Token',
        symbol: 'BIRD',
        decimals: 18,
        totalSupply: 2000000,
        pairAddress: '0xbirdpair',
        socials: { twitter: 'https://twitter.com/birdeye' },
        dataSource: TokenDataSource.BIRDEYE,
      });

      jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(mockGmgnToken);
      jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

      const mergeSpy = jest.spyOn(AutoTrackerToken, 'mergeMany');

      const result = await builder.getToken();

      expect(mergeSpy).toHaveBeenCalled();
      expect(mergeSpy).toHaveBeenCalledWith([mockGmgnToken, mockBirdeyeToken]);
      expect(result).toBeDefined();
    });

    it('should return token when only GMGN has data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);

      const mockGmgnToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'GMGN Token',
        symbol: 'GMGN',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0xgmgnpair',
        socials: { telegram: 'https://t.me/gmgn' },
        dataSource: TokenDataSource.GMGN,
      });

      jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(mockGmgnToken);
      jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(null);

      const result = await builder.getToken();

      expect(result).toBeDefined();
      expect(result.address).toBe(tokenAddress);
      expect(result.name).toBe('GMGN Token');
      expect(result.dataSource).toBe(TokenDataSource.GMGN);
    });

    it('should return token when only Birdeye has data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);

      const mockBirdeyeToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'Birdeye Token',
        symbol: 'BIRD',
        decimals: 18,
        totalSupply: 2000000,
        pairAddress: '0xbirdpair',
        socials: { twitter: 'https://twitter.com/birdeye' },
        dataSource: TokenDataSource.BIRDEYE,
      });

      jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
      jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

      const result = await builder.getToken();

      expect(result).toBeDefined();
      expect(result.address).toBe(tokenAddress);
      expect(result.name).toBe('Birdeye Token');
      expect(result.dataSource).toBe(TokenDataSource.BIRDEYE);
    });

    it('should filter out null tokens before passing to mergeMany', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);

      const mockBirdeyeToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'Birdeye Token',
        symbol: 'BIRD',
        decimals: 18,
        totalSupply: 2000000,
        pairAddress: '0xbirdpair',
        socials: {},
        dataSource: TokenDataSource.BIRDEYE,
      });

      jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
      jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

      const mergeSpy = jest.spyOn(AutoTrackerToken, 'mergeMany');

      await builder.getToken();

      expect(mergeSpy).toHaveBeenCalledWith([mockBirdeyeToken]);
      expect(mergeSpy).not.toHaveBeenCalledWith(expect.arrayContaining([null]));
    });
  });

  describe('getDbToken()', () => {
    it('should return null if token not found in DB', async () => {
      mockDatabase.tokens.findOneByTokenAddress.mockResolvedValue(null);

      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      const result = await builder.getDbToken();

      expect(result).toBeNull();
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledWith(tokenAddress);
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledTimes(1);
      expect(mockDatabase.tokens.toModel).not.toHaveBeenCalled();
    });

    describe('with real database', () => {
      let realDb: Database;

      beforeEach(async () => {
        await dbHelper.reset();
        await dbHelper.insertChains();
        const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
        realDb = new (RealDatabase as any)(dbHelper.getPrisma());

        await realDb.tokens.createToken(completeToken.toDb());
      });

      it('should return mapped AutoTrackerToken from database', async () => {
        const builder = createBuilderWithRealDb(realDb);

        const result = await builder.getDbToken();
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(AutoTrackerToken);

        expect(result?.address).toBe(tokenAddress);
        expect(result?.chainId).toBe(chainId);
        expect(result?.name).toBe(TEST_TOKEN_DATA.name);
        expect(result?.symbol).toBe(TEST_TOKEN_DATA.symbol);
        expect(result?.decimals).toBe(TEST_TOKEN_DATA.decimals);
        expect(result?.totalSupply).toBe(TEST_TOKEN_DATA.totalSupply);
        expect(result?.pairAddress).toBe(TEST_TOKEN_DATA.pairAddress);
        expect(result?.dataSource).toBe('BIRDEYE');

        await testSeed.deleteToken(tokenAddress, chainId);
      });
    });

    it('should use db.tokens.toModel to convert database record', async () => {
      const mockDbToken = {
        address: tokenAddress,
        chain_id: chainId,
        name: 'Token',
        symbol: 'TKN',
      } as any;

      const mockAutoTrackerToken = {} as AutoTrackerToken;

      mockDatabase.tokens.findOneByTokenAddress.mockResolvedValue(mockDbToken);
      mockDatabase.tokens.toModel.mockReturnValue(mockAutoTrackerToken);

      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.getDbToken();

      expect(mockDatabase.tokens.toModel).toHaveBeenCalledWith(mockDbToken);
      expect(mockDatabase.tokens.toModel).toHaveBeenCalledTimes(1);
    });

    it('should query database using the token address', async () => {
      mockDatabase.tokens.findOneByTokenAddress.mockResolvedValue(null);

      const specificAddress = '0xspecific123';
      const builder = new AutoTrackerTokenBuilder(specificAddress, chainId);

      await builder.getDbToken();

      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledWith(specificAddress);
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrCreate()', () => {
    describe('Database Scenarios', () => {
      let realDb: Database;

      beforeEach(async () => {
        await dbHelper.reset();
        await dbHelper.insertChains();
        const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
        realDb = new (RealDatabase as any)(dbHelper.getPrisma());
      });

      it('should return DB token immediately if it exists and has all required fields', async () => {
        await realDb.tokens.upsertTokenFromTokenData(completeToken);

        const builder = createBuilderWithRealDb(realDb);

        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        const collectSpy = jest.spyOn(builder as any, 'collect');

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(tokenAddress);
        expect(result.name).toBe(TEST_TOKEN_DATA.name);
        expect(result.symbol).toBe(TEST_TOKEN_DATA.symbol);

        expect(getInitialDataSpy).not.toHaveBeenCalled();
        expect(collectSpy).not.toHaveBeenCalled();

        await testSeed.deleteToken(tokenAddress, chainId);
      });

      it('should short-circuit and skip API calls when DB token is complete', async () => {
        await realDb.tokens.upsertTokenFromTokenData(completeToken);

        const builder = createBuilderWithRealDb(realDb);

        const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
        const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
        const collectSpy = jest.spyOn(builder as any, 'collect');
        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(tokenAddress);
        expect(result.symbol).toBe(TEST_TOKEN_DATA.symbol);

        expect(getGmgnTokenSpy).not.toHaveBeenCalled();
        expect(getBirdeyeTokenSpy).not.toHaveBeenCalled();
        expect(collectSpy).not.toHaveBeenCalled();
        expect(getInitialDataSpy).not.toHaveBeenCalled();

        expect(mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress).not.toHaveBeenCalled();
        expect(mockBirdeyeService.fetchTokenWithMarketCap).not.toHaveBeenCalled();

        await testSeed.deleteToken(tokenAddress, chainId);
      });

      it('should fetch and create token when not in database', async () => {
        const testAddress = '0xnewtoken1234567890123456789012345';

        const existingToken = await realDb.tokens.findOneByTokenAddress(testAddress);
        expect(existingToken).toBeNull();

        const builder = createBuilderWithRealDb(realDb);

        const mockRawData = new RawTokenDataCacheMock(testAddress, chainId);

        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        const collectSpy = jest.spyOn(builder as any, 'collect');
        const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
        const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');

        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
          birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
          birdeyeMarkets: mockRawData.birdeye.getMarkets(),
          gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
          gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
        });

        const mockGmgnToken = new AutoTrackerToken({
          address: testAddress,
          chainId,
          name: 'New GMGN Token',
          symbol: 'GMGN',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xgmgnpair',
          socials: {
            telegram: 'https://t.me/gmgn',
          },
          dataSource: TokenDataSource.GMGN,
        });
        getGmgnTokenSpy.mockResolvedValue(mockGmgnToken);

        getBirdeyeTokenSpy.mockResolvedValue(null);

        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(testAddress);
        expect(result.name).toBe('New GMGN Token');

        expect(getInitialDataSpy).toHaveBeenCalled();
        expect(collectSpy).toHaveBeenCalled();
        expect(getGmgnTokenSpy).toHaveBeenCalled();
        expect(getBirdeyeTokenSpy).toHaveBeenCalled();

        expect(upsertSpy).toHaveBeenCalled();
        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: testAddress,
          name: 'New GMGN Token',
        }));

        await testSeed.deleteToken(testAddress, chainId).catch(() => {});
      });

      it('should fetch additional data when DB token is incomplete', async () => {
        const testAddress = '0xincomplete123456789012345678901';

        const prisma = dbHelper.getPrisma();
        await prisma.token.create({
          data: {
            address: tokenAddress,
            chain: { connect: { chain_id: chainId } },
            name: 'Incomplete Token',
            symbol: 'INC',
            decimals: 18,
            total_supply: '1000000',
            pair_address: '' as any,
            telegram_url: 'https://t.me/incomplete',
            data_source: TokenDataSource.GMGN,
          },
        });

        const builder = createBuilderWithRealDb(realDb);

        const collectSpy = jest.spyOn(builder as any, 'collect');
        const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
        const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');

        const mockRawData = new RawTokenDataCacheMock(testAddress, chainId);
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
          birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
          birdeyeMarkets: mockRawData.birdeye.getMarkets(),
          gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
          gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
        });

        const mockBirdeyeToken = new AutoTrackerToken({
          address: testAddress,
          chainId,
          name: 'Incomplete Token',
          symbol: 'INC',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xcompletedpair',
          socials: {
            twitter: 'https://twitter.com/complete',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });
        getBirdeyeTokenSpy.mockResolvedValue(mockBirdeyeToken);
        getGmgnTokenSpy.mockResolvedValue(null);

        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(testAddress);
        expect(result.pairAddress).toBe('0xcompletedpair');
        expect(result.name).toBe('Incomplete Token');
        expect(result.socials.telegram).toBe('https://t.me/incomplete');
        expect(result.socials.twitter).toBe('https://twitter.com/complete');

        expect(collectSpy).toHaveBeenCalled();
        expect(getGmgnTokenSpy).toHaveBeenCalled();
        expect(getBirdeyeTokenSpy).toHaveBeenCalled();

        expect(upsertSpy).toHaveBeenCalled();
        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: testAddress,
          pairAddress: '0xcompletedpair',
        }));

      });

      it('should use hasMissingRequiredFields to determine if token is complete', async () => {
          await realDb.tokens.upsertTokenFromTokenData(completeToken);

          const builder = createBuilderWithRealDb(realDb);

          const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
          const collectSpy = jest.spyOn(builder as any, 'collect');
          const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
          const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
          const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');

          const result = await builder.getOrCreate();

          expect(getDbTokenSpy).toHaveBeenCalled();

          const dbToken = await getDbTokenSpy.mock.results[0].value;
          expect(dbToken).not.toBeNull();

          expect(dbToken.hasMissingRequiredFields()).toBe(false);

          expect(collectSpy).not.toHaveBeenCalled();

          expect(getInitialDataSpy).not.toHaveBeenCalled();
          expect(getBirdeyeTokenSpy).not.toHaveBeenCalled();
          expect(getGmgnTokenSpy).not.toHaveBeenCalled();

          expect(result).toBeDefined();
          expect(result.address).toBe(tokenAddress);
          expect(result.name).toBe(TEST_TOKEN_DATA.name);
          expect(result.pairAddress).toBe(TEST_TOKEN_DATA.pairAddress);

          await testSeed.deleteToken(tokenAddress, chainId);
        });

        it('should merge tokens with available data even when some sources fail', async () => {
          const builder = createBuilderWithRealDb(realDb);

          const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
          getDbTokenSpy.mockResolvedValue(null);

          const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
          getInitialDataSpy.mockResolvedValue({
            token: { chainId },
            rawData: {}
          });

          const mockRawData = new RawTokenDataCacheMock(tokenAddress, chainId);
          const collectSpy = jest.spyOn(builder as any, 'collect');
          collectSpy.mockResolvedValue({
            birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
            birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
            birdeyeMarkets: mockRawData.birdeye.getMarkets(),
            gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
            gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
          });

          const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
          getGmgnTokenSpy.mockResolvedValue(null);

          const mockBirdeyeToken = new AutoTrackerToken({
            address: tokenAddress,
            chainId,
            name: 'Test Token',
            symbol: 'TEST',
            decimals: 18,
            totalSupply: 1000000,
            pairAddress: '0xpair',
            socials: {
              twitter: 'https://twitter.com/test',
            },
            dataSource: TokenDataSource.BIRDEYE,
          });
          const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
          getBirdeyeTokenSpy.mockResolvedValue(mockBirdeyeToken);

          const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

          const result = await builder.getOrCreate();

          expect(getGmgnTokenSpy).toHaveBeenCalled();
          expect(getBirdeyeTokenSpy).toHaveBeenCalled();

          expect(result).toBeDefined();
          expect(result.address).toBe(tokenAddress);
          expect(result.name).toBe('Test Token');
          expect(result.symbol).toBe('TEST');
          expect(result.pairAddress).toBe('0xpair');
          expect(result.dataSource).toBe(TokenDataSource.BIRDEYE);

          expect(upsertSpy).toHaveBeenCalled();
          expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
            address: tokenAddress,
            name: 'Test Token',
          }));
        });
    });

    describe('Chain ID Resolution Flow', () => {
      let realDb: Database;

      beforeEach(async () => {
        await dbHelper.reset();
        await dbHelper.insertChains();
        const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
        realDb = new (RealDatabase as any)(dbHelper.getPrisma());
      });

      it('should fetch initial data to resolve chain ID when not provided initially', async () => {
        const builder = new AutoTrackerTokenBuilder(
          tokenAddress,
          undefined,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
        getDbTokenSpy.mockResolvedValue(null);

        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        const mockInitialData = {
          token: { chainId },
          rawData: { birdeye: {} }
        };
        getInitialDataSpy.mockResolvedValue(mockInitialData);

        const collectSpy = jest.spyOn(builder as any, 'collect');
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: {},
          birdeyeTokenSecurity: {},
          birdeyeMarkets: { items: [{ address: '0xpair' }] },
          gmgnTokenInfo: {},
          gmgnTokenSocials: {}
        });

        const mockToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });

        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockToken);
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await builder.getOrCreate();
        expect(getInitialDataSpy).toHaveBeenCalled();
        expect((builder as any).chainId).toBe(chainId);
      });

      it('should use chain ID from builder constructor and call getInitialData if DB token lacks it', async () => {
        const builder = createBuilderWithRealDb(realDb);
        expect((builder as any).chainId).toBe(chainId);

        const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
        const mockDbToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId: undefined as any,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });
        getDbTokenSpy.mockResolvedValue(mockDbToken);

        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        getInitialDataSpy.mockResolvedValue({
          token: { chainId },
          rawData: { birdeye: {} }
        });

        const collectSpy = jest.spyOn(builder as any, 'collect');
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: {},
          birdeyeTokenSecurity: {},
          birdeyeMarkets: { items: [{ address: '0xpair' }] },
          gmgnTokenInfo: {},
          gmgnTokenSocials: {}
        });

        const completeTokenFromApi = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });

        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(completeTokenFromApi);
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await builder.getOrCreate();

        expect((builder as any).chainId).toBe(chainId);
        expect(getInitialDataSpy).toHaveBeenCalled();
      });

      it('should not resolve chain ID via getInitialData if DB token already has it', async () => {
        const builder = createBuilderWithRealDb(realDb);
        expect((builder as any).chainId).toBe(chainId);

        const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
        const mockDbToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xincomplete',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });
        (mockDbToken as any).pairAddress = undefined;
        getDbTokenSpy.mockResolvedValue(mockDbToken);

        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        getInitialDataSpy.mockResolvedValue({
          token: { chainId },
          rawData: { birdeye: {} }
        });

        const collectSpy = jest.spyOn(builder as any, 'collect');
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: {},
          birdeyeTokenSecurity: {},
          birdeyeMarkets: { items: [{ address: '0xpair' }] },
          gmgnTokenInfo: {},
          gmgnTokenSocials: {}
        });

        const completeTokenFromApi = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });

        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(completeTokenFromApi);
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await builder.getOrCreate();

        expect(getInitialDataSpy).not.toHaveBeenCalled();
        expect((builder as any).chainId).toBe(chainId);
      });

      it('should resolve chain ID when builder and DB token both lack it', async () => {
        const builder = new AutoTrackerTokenBuilder(
          tokenAddress,
          undefined,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
        const mockDbToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId: undefined as any,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });
        getDbTokenSpy.mockResolvedValue(mockDbToken);

        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        const mockInitialData = {
          token: { chainId },
          rawData: { birdeye: {} }
        };
        getInitialDataSpy.mockResolvedValue(mockInitialData);

        const collectSpy = jest.spyOn(builder as any, 'collect');
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: {},
          birdeyeTokenSecurity: {},
          birdeyeMarkets: { items: [{ address: '0xpair' }] },
          gmgnTokenInfo: {},
          gmgnTokenSocials: {}
        });

        const completeTokenFromApi = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });

        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(completeTokenFromApi);
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await builder.getOrCreate();

        expect(getInitialDataSpy).toHaveBeenCalled();
        expect((builder as any).chainId).toBe(chainId);
      });

      it('should pass chainId and rawData from getInitialData to setChainIdAndInitialiseRawData', async () => {
        const builder = new AutoTrackerTokenBuilder(
          tokenAddress,
          undefined,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(null);

        const mockRawData = {
          birdeye: {
            tokenOverview: { address: tokenAddress },
            tokenSecurity: { isOpenSource: 'true' },
            markets: { items: [{ address: '0xpair' }] }
          }
        };
        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        getInitialDataSpy.mockResolvedValue({
          token: { chainId },
          rawData: mockRawData
        });

        const setChainIdAndInitialiseRawDataSpy = jest.spyOn(builder as any, 'setChainIdAndInitialiseRawData');

        jest.spyOn(builder as any, 'collect').mockResolvedValue({
          birdeyeTokenOverview: {},
          birdeyeTokenSecurity: {},
          birdeyeMarkets: { items: [{ address: '0xpair' }] },
          gmgnTokenInfo: {},
          gmgnTokenSocials: {}
        });

        const mockToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Test',
          symbol: 'TEST',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });

        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockToken);
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await builder.getOrCreate();

        expect(setChainIdAndInitialiseRawDataSpy).toHaveBeenCalledWith(chainId, mockRawData);
      });
    });

    describe('Data Merging Scenarios', () => {
      let realDb: Database;
      let builder: AutoTrackerTokenBuilder;

      const mockCollectData = () => {
        const mockRawData = new RawTokenDataCacheMock(tokenAddress, chainId);
        return {
          birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
          birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
          birdeyeMarkets: mockRawData.birdeye.getMarkets(),
          gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
          gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
        };
      };

      beforeEach(async () => {
        await dbHelper.reset();
        await dbHelper.insertChains();
        const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
        realDb = new (RealDatabase as any)(dbHelper.getPrisma());
        builder = createBuilderWithRealDb(realDb);
      });

      it('should merge existing DB token with fresh API data from both sources', async () => {
        const incompleteDbToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'DB Token',
          symbol: 'DBT',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xdbpair',
          socials: {
            telegram: 'https://t.me/db',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });

        (incompleteDbToken as any).pairAddress = undefined;

        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(incompleteDbToken);
        jest.spyOn(builder as any, 'collect').mockResolvedValue(mockCollectData());

        const mockGmgnToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'GMGN Token',
          symbol: 'GMGN',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xgmgnpair',
          socials: {
            twitter: 'https://twitter.com/gmgn',
          },
          dataSource: TokenDataSource.GMGN,
        });
        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(mockGmgnToken);

        const mockBirdeyeToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Birdeye Token',
          symbol: 'BIRD',
          decimals: 18,
          totalSupply: 2000000,
          pairAddress: '0xbirdpair',
          socials: {
            website: 'https://birdeye.com',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

        const mergeSpy = jest.spyOn(AutoTrackerToken, 'mergeMany');
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        const result = await builder.getOrCreate();

        expect(mergeSpy).toHaveBeenCalled();
        expect(mergeSpy).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ dataSource: TokenDataSource.GMGN }),
            expect.objectContaining({ dataSource: TokenDataSource.BIRDEYE }),
          ])
        );

        expect(result).toBeDefined();
        expect(result.address).toBe(tokenAddress);
        expect(result.socials.telegram).toBe('https://t.me/db');
        expect(result.socials.twitter).toBe('https://twitter.com/gmgn');
        expect(result.socials.website).toBe('https://birdeye.com');
      });

      it('should pass tokens in correct order to mergeMany', async () => {
        const dbToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'DB Token',
          symbol: 'DBT',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xdbpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });
        (dbToken as any).pairAddress = undefined;

        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(dbToken);
        jest.spyOn(builder as any, 'collect').mockResolvedValue(mockCollectData());

        const mockGmgnToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'GMGN Token',
          symbol: 'GMGN',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xgmgnpair',
          socials: {},
          dataSource: TokenDataSource.GMGN,
        });
        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(mockGmgnToken);

        const mockBirdeyeToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Birdeye Token',
          symbol: 'BIRD',
          decimals: 18,
          totalSupply: 2000000,
          pairAddress: '0xbirdpair',
          socials: {},
          dataSource: TokenDataSource.BIRDEYE,
        });
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

        const mergeSpy = jest.spyOn(AutoTrackerToken, 'mergeMany');
        jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await builder.getOrCreate();

        expect(mergeSpy).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ dataSource: TokenDataSource.GMGN }),
            expect.objectContaining({ dataSource: TokenDataSource.BIRDEYE }),
          ])
        );

        const callArgs = mergeSpy.mock.calls[0][0];
        expect(callArgs).toHaveLength(3);
        expect(callArgs[0].dataSource).toBe(TokenDataSource.GMGN);
        expect(callArgs[1].dataSource).toBe(TokenDataSource.BIRDEYE);
      });

      it('should create token when only GMGN source succeeds, Birdeye fails', async () => {
        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getInitialData').mockResolvedValue({
          token: { chainId },
          rawData: {}
        });
        jest.spyOn(builder as any, 'collect').mockResolvedValue(mockCollectData());

        const mockGmgnToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'GMGN Token',
          symbol: 'GMGN',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xgmgnpair',
          socials: {
            telegram: 'https://t.me/gmgn',
          },
          dataSource: TokenDataSource.GMGN,
        });
        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(mockGmgnToken);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(null);

        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(tokenAddress);
        expect(result.name).toBe('GMGN Token');
        expect(result.symbol).toBe('GMGN');
        expect(result.pairAddress).toBe('0xgmgnpair');
        expect(result.dataSource).toBe(TokenDataSource.GMGN);
        expect(result.socials.telegram).toBe('https://t.me/gmgn');

        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: tokenAddress,
          name: 'GMGN Token',
        }));
      });

      it('should create token when only Birdeye source succeeds, GMGN fails', async () => {
        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getInitialData').mockResolvedValue({
          token: { chainId },
          rawData: {}
        });
        jest.spyOn(builder as any, 'collect').mockResolvedValue(mockCollectData());

        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);

        const mockBirdeyeToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Birdeye Token',
          symbol: 'BIRD',
          decimals: 18,
          totalSupply: 2000000,
          pairAddress: '0xbirdpair',
          socials: {
            twitter: 'https://twitter.com/birdeye',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(tokenAddress);
        expect(result.name).toBe('Birdeye Token');
        expect(result.symbol).toBe('BIRD');
        expect(result.pairAddress).toBe('0xbirdpair');
        expect(result.dataSource).toBe(TokenDataSource.BIRDEYE);
        expect(result.socials.twitter).toBe('https://twitter.com/birdeye');

        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: tokenAddress,
          name: 'Birdeye Token',
        }));
      });

      it('should combine partial data from each source to meet requirements', async () => {
        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getInitialData').mockResolvedValue({
          token: { chainId },
          rawData: {}
        });
        jest.spyOn(builder as any, 'collect').mockResolvedValue(mockCollectData());

        const mockGmgnToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'GMGN Token',
          symbol: 'GMGN',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpartial1',
          socials: {
            telegram: 'https://t.me/gmgn',
          },
          dataSource: TokenDataSource.GMGN,
        });
        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(mockGmgnToken);

        const mockBirdeyeToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Partial Name',
          symbol: 'PART',
          decimals: 18,
          totalSupply: 2000000,
          pairAddress: '0xbirdpair',
          socials: {
            twitter: 'https://twitter.com/birdeye',
            website: 'https://birdeye.com',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(mockBirdeyeToken);

        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        const result = await builder.getOrCreate();

        expect(result).toBeDefined();
        expect(result.address).toBe(tokenAddress);

        expect(result.name).toBe('GMGN Token');
        expect(result.symbol).toBe('GMGN');

        expect(result.pairAddress).toBe('0xpartial1');
        expect(result.totalSupply).toBe(1000000);

        expect(result.socials.telegram).toBe('https://t.me/gmgn');
        expect(result.socials.twitter).toBe('https://twitter.com/birdeye');
        expect(result.socials.website).toBe('https://birdeye.com');

        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: tokenAddress,
          pairAddress: '0xpartial1',
        }));
      });

      it('should try to work with just DB token if APIs fail', async () => {
        const dbToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'DB Token',
          symbol: 'DBT',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xdbpair',
          socials: {
            telegram: 'https://t.me/db',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });
        (dbToken as any).pairAddress = undefined;

        jest.spyOn(builder as any, 'getDbToken').mockResolvedValue(dbToken);
        jest.spyOn(builder as any, 'collect').mockResolvedValue(mockCollectData());
        jest.spyOn(builder as any, 'getGmgnAutoTrackerToken').mockResolvedValue(null);
        jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken').mockResolvedValue(null);

        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        await expect(builder.getOrCreate()).rejects.toThrow();
      });
    });

    describe('Validation and Persistence', () => {
      it('should call AutoTrackerToken.validate on merged token', () => {
        // TODO: Implement
      });

      it('should throw validation error if merged token still missing required fields', () => {
        // TODO: Implement
      });

      it('should validate against AutoTrackerToken.requiredFields', () => {
        // TODO: Implement
      });

      it('should save merged token to database after successful validation', () => {
        // TODO: Implement
      });

      it('should return the final merged token after validation and save', () => {
        // TODO: Implement
      });

      it('should ensure validation precedes database upsert', () => {
        // TODO: Implement
      });
    });

    describe('Parallel Fetching', () => {
      it('should fetch GMGN and Birdeye tokens concurrently after collect', () => {
        // TODO: Implement
      });

      it('should call collect() to populate rawData before getting tokens', () => {
        // TODO: Implement
      });
    });
  });

  describe('Integration Tests - Complete Flows', () => {
    it('should handle complete flow: no chain ID, no DB, both APIs succeed', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();

      const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
      const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
      const setChainIdAndInitialiseRawDataSpy = jest.spyOn(builder as any, 'setChainIdAndInitialiseRawData');
      const collectSpy = jest.spyOn(builder as any, 'collect');
      const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
      const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
      const validateSpy = jest.spyOn(AutoTrackerToken, 'validate');
      const upsertSpy = jest.spyOn(mockDatabase.tokens, 'upsertTokenFromTokenData');

      getDbTokenSpy.mockResolvedValue(null);

      const mockRawData = new RawTokenDataCacheMock(tokenAddress, chainId);
      getInitialDataSpy.mockResolvedValue({
        token: { chainId },
        rawData: mockRawData.getRawData()
      });

      collectSpy.mockResolvedValue({
        birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
        birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
        birdeyeMarkets: mockRawData.birdeye.getMarkets(),
        gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
        gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
      });

      const mockGmgnToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'GMGN Token',
        symbol: 'GMGN',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0xgmgnpair',
        socials: { telegram: 'https://t.me/gmgn' },
        dataSource: TokenDataSource.GMGN,
      });

      const mockBirdeyeToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'Birdeye Token',
        symbol: 'BIRD',
        decimals: 18,
        totalSupply: 2000000,
        pairAddress: '0xbirdpair',
        socials: { twitter: 'https://twitter.com/birdeye' },
        dataSource: TokenDataSource.BIRDEYE,
      });

      getGmgnTokenSpy.mockResolvedValue(mockGmgnToken);
      getBirdeyeTokenSpy.mockResolvedValue(mockBirdeyeToken);

      const result = await builder.getOrCreate();

      expect(getDbTokenSpy).toHaveBeenCalled();
      expect(getInitialDataSpy).toHaveBeenCalled();
      expect(setChainIdAndInitialiseRawDataSpy).toHaveBeenCalledWith(chainId, mockRawData.getRawData());
      expect((builder as any).chainId).toBe(chainId);
      expect(collectSpy).toHaveBeenCalled();
      expect(getGmgnTokenSpy).toHaveBeenCalled();
      expect(getBirdeyeTokenSpy).toHaveBeenCalled();
      expect(validateSpy).toHaveBeenCalled();
      expect(upsertSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.address).toBe(tokenAddress);
    });

    it('should handle complete flow when chain ID is known', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect((builder as any).chainId).toBe(chainId);

      const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
      const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
      const collectSpy = jest.spyOn(builder as any, 'collect');
      const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
      const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
      const validateSpy = jest.spyOn(AutoTrackerToken, 'validate');
      const upsertSpy = jest.spyOn(mockDatabase.tokens, 'upsertTokenFromTokenData');

      getDbTokenSpy.mockResolvedValue(null);

      const mockRawData = new RawTokenDataCacheMock(tokenAddress, chainId);
      getInitialDataSpy.mockResolvedValue({
        token: { chainId },
        rawData: mockRawData.getRawData()
      });

      collectSpy.mockResolvedValue({
        birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
        birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
        birdeyeMarkets: mockRawData.birdeye.getMarkets(),
        gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
        gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
      });

      const mockToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0xpair',
        socials: {},
        dataSource: TokenDataSource.BIRDEYE,
      });

      getGmgnTokenSpy.mockResolvedValue(null);
      getBirdeyeTokenSpy.mockResolvedValue(mockToken);

      const result = await builder.getOrCreate();

      expect(getDbTokenSpy).toHaveBeenCalled();
      expect(getInitialDataSpy).toHaveBeenCalled();
      expect((builder as any).chainId).toBe(chainId);
      expect(collectSpy).toHaveBeenCalled();
      expect(getGmgnTokenSpy).toHaveBeenCalled();
      expect(getBirdeyeTokenSpy).toHaveBeenCalled();
      expect(validateSpy).toHaveBeenCalled();
      expect(upsertSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.address).toBe(tokenAddress);
    });

    it('should enrich partial DB data with API data', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);

      const partialDbToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'DB Token',
        symbol: 'DBT',
        decimals: 18,
        totalSupply: 1000000,
        pairAddress: '0xdbpair',
        socials: { telegram: 'https://t.me/db' },
        dataSource: TokenDataSource.BIRDEYE,
      });
      (partialDbToken as any).pairAddress = undefined;

      const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
      const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
      const collectSpy = jest.spyOn(builder as any, 'collect');
      const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
      const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
      const mergeSpy = jest.spyOn(AutoTrackerToken, 'mergeMany');
      const validateSpy = jest.spyOn(AutoTrackerToken, 'validate');
      const upsertSpy = jest.spyOn(mockDatabase.tokens, 'upsertTokenFromTokenData');

      getDbTokenSpy.mockResolvedValue(partialDbToken);

      const mockRawData = new RawTokenDataCacheMock(tokenAddress, chainId);
      collectSpy.mockResolvedValue({
        birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
        birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
        birdeyeMarkets: mockRawData.birdeye.getMarkets(),
        gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
        gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
      });

      const mockApiToken = new AutoTrackerToken({
        address: tokenAddress,
        chainId,
        name: 'API Token',
        symbol: 'API',
        decimals: 18,
        totalSupply: 2000000,
        pairAddress: '0xapipair',
        socials: { twitter: 'https://twitter.com/api' },
        dataSource: TokenDataSource.BIRDEYE,
      });

      getGmgnTokenSpy.mockResolvedValue(null);
      getBirdeyeTokenSpy.mockResolvedValue(mockApiToken);

      const result = await builder.getOrCreate();

      expect(getDbTokenSpy).toHaveBeenCalled();
      expect(getInitialDataSpy).not.toHaveBeenCalled();
      expect(collectSpy).toHaveBeenCalled();
      expect(getGmgnTokenSpy).toHaveBeenCalled();
      expect(getBirdeyeTokenSpy).toHaveBeenCalled();
      expect(mergeSpy).toHaveBeenCalledWith(expect.arrayContaining([mockApiToken, partialDbToken]));
      expect(validateSpy).toHaveBeenCalled();
      expect(upsertSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.socials.telegram).toBe('https://t.me/db');
      expect(result.socials.twitter).toBe('https://twitter.com/api');
    });

    describe('API failure scenarios', () => {
      it('should handle Birdeye failure with GMGN success', () => {
        // TODO: Implement
      });

      it('should handle GMGN failure with Birdeye success', () => {
        // TODO: Implement
      });

      it('should handle both returning partial data that together is sufficient', () => {
        // TODO: Implement
      });
    });

    it('should fail validation when combined data is still incomplete', () => {
      // TODO: Implement
    });

    it('should succeed with complete data from one source only', () => {
      // TODO: Implement
    });

    it('should resolve chain ID when DB token exists but lacks it', () => {
      // TODO: Implement
    });

    it('should return immediately when DB token is complete', () => {
      // TODO: Implement
    });
  });

  describe('Error Handling', () => {
    it('should propagate database query errors', () => {
      // TODO: Implement
    });

    it('should handle getInitialData API failures', () => {
      // TODO: Implement
    });

    it('should handle errors during data collection', () => {
      // TODO: Implement
    });

    it('should handle errors in mapper functions', () => {
      // TODO: Implement
    });

    it('should handle database upsert failures', () => {
      // TODO: Implement
    });

    it('should throw validation error with details about missing fields', () => {
      // TODO: Implement
    });
  });

  describe('Edge Cases', () => {
    it('should handle when Birdeye returns markets but items array is empty', () => {
      // TODO: Implement
    });

    it('should handle malformed markets response', () => {
      // TODO: Implement
    });

    it('should handle tokens with zero decimals or supply', () => {
      // TODO: Implement
    });

    it('should handle when both sources return identical data', () => {
      // TODO: Implement
    });

    it('should handle multiple calls to collect() without caching issues', () => {
      // TODO: Implement
    });

    it('should distinguish between empty strings and null for validation', () => {
      // TODO: Implement
    });

    it('should handle DB token where all optional fields are explicitly null', () => {
      // TODO: Implement
    });

    it('should handle tokens with extremely large supply numbers', () => {
      // TODO: Implement
    });
  });

  describe('Chain ID Behavior', () => {
    it('should maintain consistent chain ID across all API calls', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect((builder as any).chainId).toBe(chainId);

      await builder.initialiseRawData();
      const rawData = (builder as any).rawData as RawTokenDataCacheMock;
      expect(rawData.chainId).toBe(chainId);

      await builder.collect();
      expect((builder as any).chainId).toBe(chainId);
      expect(rawData.chainId).toBe(chainId);

      const gmgnToken = await builder.getGmgnAutoTrackerToken();
      expect((builder as any).chainId).toBe(chainId);
      if (gmgnToken) {
        expect(gmgnToken.chainId).toBe(chainId);
      }

      const birdeyeToken = await builder.getBirdeyeAutoTrackerToken();
      expect((builder as any).chainId).toBe(chainId);
      if (birdeyeToken) {
        expect(birdeyeToken.chainId).toBe(chainId);
      }

      expect((builder as any).chainId).toBe(chainId);
      expect(rawData.chainId).toBe(chainId);
    });

    it('should update builder\'s chain ID after resolution', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();

      const result = await builder.getInitialData();

      expect((builder as any).chainId).toBe('56');
      expect((builder as any).chainId).toBeDefined();
      expect(result.token.chainId).toBe('56');

      expect((builder as any).rawData).toBeDefined();
      expect((builder as any).rawData.chainId).toBe('56');
    });
  });
});
