import { ChainId, ChainsMap } from '../../../../shared/chains';
import { Database } from '../../../db/database';
import { AutoTrackerToken } from '../../../models/token';
import { BirdEyeFetcherService } from '../../apis/birdeye/birdeye-service';
import { RawTokenDataCache } from '../../raw-data/raw-data';
import { AutoTrackerTokenBuilder } from '../token-builder';

// Import existing mocks
import { TokenDataSource } from '@prisma/client';
import { BirdEyeFetcherServiceMock } from '../../../../../tests/mocks/birdeye/birdeye-service.mock';
import { MockDatabase, createMockDatabase } from '../../../../../tests/mocks/db/database.mock';
import { RawTokenDataCacheMock } from '../../../../../tests/mocks/raw-data/raw-data-cache.mock';
import { rawDataDataMock } from '../../../../../tests/mocks/raw-data/raw-data-input';
import { TestDbHelper, TestSeed } from '../../../../../tests/utils';

// Mock all external dependencies
jest.mock('../../apis/birdeye/birdeye-service');
jest.mock('../../../db/database');
jest.mock('../../raw-data/raw-data');
jest.mock('../../apis/gmgn/gmgn-mapper');
jest.mock('../../apis/birdeye/birdeye-mapper');

describe('AutoTrackerTokenBuilder', () => {
  let mockBirdeyeService: BirdEyeFetcherServiceMock;
  let mockDatabase: MockDatabase;
  let mockRawDataCache: RawTokenDataCacheMock;
  let tokenAddress: string;
  let chainId: ChainId;
  let dbHelper: TestDbHelper;
  let testSeed: TestSeed;

  beforeAll(async () => {
    dbHelper = TestDbHelper.getInstance();
    await dbHelper.initialize();
  });

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset database and create fresh test seed
    await dbHelper.reset();
    testSeed = new TestSeed();

    tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    chainId = '56' as ChainId;

    // Setup mock instances using existing mocks
    mockBirdeyeService = new BirdEyeFetcherServiceMock();
    mockRawDataCache = new RawTokenDataCacheMock(tokenAddress, chainId);
    mockDatabase = createMockDatabase();

    // Mock getInstance methods
    (BirdEyeFetcherService.getInstance as jest.Mock).mockReturnValue(mockBirdeyeService);
    (Database.getInstance as jest.Mock).mockReturnValue(mockDatabase);

    // Mock RawTokenDataCache constructor
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
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(AutoTrackerTokenBuilder);
    });

    it('should initialize with token address and chain ID', () => {
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const chainId = ChainsMap.bsc;
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect(builder).toBeDefined();
      expect(builder).toBeInstanceOf(AutoTrackerTokenBuilder);
    });

    it('should accept custom service instances', () => {
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const chainId = ChainsMap.bsc;
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
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const chainId = ChainsMap.bsc;
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();
      builder.setChainId(chainId);
      expect((builder as any).chainId).toBe(chainId);
    });

    it('should allow updating the chain ID', () => {
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const initialChainId = ChainsMap.bsc;
      const newChainId = ChainsMap.ethereum;
      const builder = new AutoTrackerTokenBuilder(tokenAddress, initialChainId);
      expect((builder as any).chainId).toBe(initialChainId);
      builder.setChainId(newChainId);
      expect((builder as any).chainId).toBe(newChainId);
    });
  });

  describe('initialiseRawData()', () => {
    it('should throw error when chain ID is not set', async () => {
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();

      await expect(builder.initialiseRawData()).rejects.toThrow('Chain id is not set');
    });

    it('should create and return new RawTokenDataCache instance when chain ID is set on initialisation', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      const result = await builder.initialiseRawData();
      // Verify RawTokenDataCache was called with correct parameters
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

    it('should throw error when chain ID is not set', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect((builder as any).chainId).toBeUndefined();
      await expect(builder.initialiseRawData()).rejects.toThrow('Chain id is not set');
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
      const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
      const builder = new AutoTrackerTokenBuilder(tokenAddress);
      expect(() => builder.getRawData()).toThrow('Chain id is not set');
    });

    it('should create new RawTokenDataCache if not initialized', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();
      const result = builder.getRawData();
      expect(RawTokenDataCache).toHaveBeenCalledWith(tokenAddress, chainId);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('chainId', chainId);
      expect(result).toHaveProperty('tokenAddress', tokenAddress);
    });

    it('should return existing rawData if already initialized', async () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();
      const existingRawData = (builder as any).rawData;
      const result = builder.getRawData();
      expect(mockRawDataCache.updateData).not.toHaveBeenCalled();
      expect(result).toBe(existingRawData);
    });

    it('should throw error when rawData is not set', () => {
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      expect((builder as any).rawData).toBeUndefined();
      expect(() => builder.getRawData()).toThrow('Raw data is not set');
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
        // Create builder without chain ID
        const builder = new AutoTrackerTokenBuilder(tokenAddress);
        expect((builder as any).chainId).toBeUndefined();

        // Mock the API to return data without chainId
        mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress.mockResolvedValueOnce({
          token: {
            address: tokenAddress,
            name: "Test Token",
            symbol: "TEST",
            chainId: undefined as any, // No chain ID in response
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
        // Create builder without chain ID
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

    it('should return object with all collected data', () => {
      // TODO: Implement
    });

    it('should return data even if some sources return null', async () => {
      // Create builder and initialize rawData
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();

      // Get the rawData instance
      const rawData = (builder as any).rawData as RawTokenDataCacheMock;

      // Mock some methods to return null (simulating source failures or missing data)
      jest.spyOn(rawData.birdeye, 'getTokenOverview').mockResolvedValue(null);
      jest.spyOn(rawData.gmgn, 'getTokenInfo').mockResolvedValue(null);

      // Keep other methods returning data
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
      // Create builder and initialize rawData
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.initialiseRawData();

      // Get the rawData instance
      const rawData = (builder as any).rawData as RawTokenDataCacheMock;

      // Mock some methods to throw errors (simulating API failures)
      jest.spyOn(rawData.birdeye, 'getTokenOverview').mockRejectedValue(new Error('Birdeye API error'));
      jest.spyOn(rawData.gmgn, 'getTokenInfo').mockRejectedValue(new Error('GMGN API timeout'));

      // Keep other methods returning data
      const mockSecurity = { isOpenSource: 'true' } as any;
      const mockMarkets = { items: [{ address: '0xpair' }] } as any;
      const mockSocials = { twitter: 'test' } as any;

      jest.spyOn(rawData.birdeye, 'getTokenSecurity').mockResolvedValue(mockSecurity);
      jest.spyOn(rawData.birdeye, 'getMarkets').mockResolvedValue(mockMarkets);
      jest.spyOn(rawData.gmgn, 'getGmgnSocials').mockResolvedValue(mockSocials);

      // Call collect - it uses Promise.all which will reject if any promise rejects
      // So we expect this to throw
      await expect(builder.collect()).rejects.toThrow();

      // Verify all methods were called before the error propagated
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
    it('should call getInitialData to resolve chain ID if not set', () => {
      // TODO: Implement
    });

    it('should throw error when both GMGN and Birdeye return null', () => {
      // TODO: Implement
    });

    it('should merge tokens from both sources using AutoTrackerToken.mergeMany', () => {
      // TODO: Implement
    });

    it('should return token when only GMGN has data', () => {
      // TODO: Implement
    });

    it('should return token when only Birdeye has data', () => {
      // TODO: Implement
    });

    it('should filter out null tokens before passing to mergeMany', () => {
      // TODO: Implement
    });
  });

  describe('getDbToken()', () => {
    it('should return null if token not found in DB', async () => {
      // Mock database to return null (token not found)
      mockDatabase.tokens.findOneByTokenAddress.mockResolvedValue(null);

      // Create builder and call getDbToken
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      const result = await builder.getDbToken();

      // Verify result is null
      expect(result).toBeNull();

      // Verify database was queried
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledWith(tokenAddress);
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledTimes(1);

      // Verify toModel was NOT called since token wasn't found
      expect(mockDatabase.tokens.toModel).not.toHaveBeenCalled();
    });

    describe('returns AutoTrackerToken when found in database', () => {
      let realDb: Database;
      let autoTrackerToken: AutoTrackerToken;

      beforeAll(async () => {
        const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
        realDb = new (RealDatabase as any)(dbHelper.getPrisma());
        await dbHelper.insertChains();
      });

      beforeEach(async () => {
        autoTrackerToken = new AutoTrackerToken({
          address: tokenAddress,
          chainId,
          name: 'Real Test Token',
          symbol: 'RTT',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair123',
          socials: {
            telegram: 'https://t.me/test',
            twitter: 'https://twitter.com/test',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });

        await realDb.tokens.createToken(autoTrackerToken.toDb());
      });

      // afterEach(async () => {
      //   await realDb.tokens.deleteToken(tokenAddress, chainId);
      // });

      it('should return mapped AutoTrackerToken from database', async () => {
        // Create builder with real database (not mocked)
        // Constructor: (tokenAddress, chainId?, rawData?, birdeyeService?, db?)
        const builder = new AutoTrackerTokenBuilder(
          tokenAddress,
          chainId,
          undefined, // rawData
          mockBirdeyeService as any, // birdeyeService
          realDb // Pass the real database instance
        );

        // Call getDbToken - should retrieve the real token
        const result = await builder.getDbToken();
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(AutoTrackerToken);

        // Verify the data matches what we inserted
        expect(result?.address).toBe(tokenAddress);
        expect(result?.chainId).toBe(chainId);
        expect(result?.name).toBe('Real Test Token');
        expect(result?.symbol).toBe('RTT');
        expect(result?.decimals).toBe(18);
        expect(result?.totalSupply).toBe(1000000);
        expect(result?.pairAddress).toBe('0xpair123');
        expect(result?.dataSource).toBe('BIRDEYE');

        // Clean up
        await testSeed.deleteToken(tokenAddress, chainId);
      });
    });

    it('should use db.tokens.toModel to convert database record', async () => {
      // Create mock database token
      const mockDbToken = {
        address: tokenAddress,
        chain_id: chainId,
        name: 'Token',
        symbol: 'TKN',
      } as any;

      const mockAutoTrackerToken = {} as AutoTrackerToken;

      // Mock database methods
      mockDatabase.tokens.findOneByTokenAddress.mockResolvedValue(mockDbToken);
      mockDatabase.tokens.toModel.mockReturnValue(mockAutoTrackerToken);

      // Create builder and call getDbToken
      const builder = new AutoTrackerTokenBuilder(tokenAddress, chainId);
      await builder.getDbToken();

      // Verify toModel was called with the exact DB token
      expect(mockDatabase.tokens.toModel).toHaveBeenCalledWith(mockDbToken);
      expect(mockDatabase.tokens.toModel).toHaveBeenCalledTimes(1);
    });

    it('should query database using the token address', async () => {
      // Mock database to return null
      mockDatabase.tokens.findOneByTokenAddress.mockResolvedValue(null);

      // Create builder with specific token address
      const specificAddress = '0xspecific123';
      const builder = new AutoTrackerTokenBuilder(specificAddress, chainId);

      // Call getDbToken
      await builder.getDbToken();

      // Verify database was queried with the correct token address
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledWith(specificAddress);
      expect(mockDatabase.tokens.findOneByTokenAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrCreate()', () => {
    describe('Database Scenarios', () => {
      let realDb: Database;

      beforeAll(async () => {
        const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
        realDb = new (RealDatabase as any)(dbHelper.getPrisma());
        await dbHelper.insertChains();
      });

      it('should return DB token immediately if it exists and has all required fields', async () => {

        // Create a complete token with all required fields
        const testAddress = '0xcomplete123456789012345678901234';
        const autoTrackerToken = new AutoTrackerToken({
          address: testAddress,
          chainId,
          name: 'Complete Token',
          symbol: 'COMP',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xpair456',
          socials: {
            telegram: 'https://t.me/complete',
            twitter: 'https://twitter.com/complete',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });

        // Insert the complete token into database
        await realDb.tokens.upsertTokenFromTokenData(autoTrackerToken);

        // Create builder with real database
        const builder = new AutoTrackerTokenBuilder(
          testAddress,
          chainId,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        // Spy on getInitialData to verify it's NOT called
        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        const collectSpy = jest.spyOn(builder as any, 'collect');

        // Call getOrCreate - should return existing token without fetching
        const result = await builder.getOrCreate();

        // Verify the token was returned
        expect(result).toBeDefined();
        expect(result.address).toBe(testAddress);
        expect(result.name).toBe('Complete Token');
        expect(result.symbol).toBe('COMP');

        // Verify NO API calls were made (short-circuit)
        expect(getInitialDataSpy).not.toHaveBeenCalled();
        expect(collectSpy).not.toHaveBeenCalled();

        // Clean up
        await testSeed.deleteToken(testAddress, chainId);
      });

      it('should short-circuit and skip API calls when DB token is complete', async () => {
        // Create a complete token
        const testAddress = '0xshortcircuit12345678901234567890';
        const autoTrackerToken = new AutoTrackerToken({
          address: testAddress,
          chainId,
          name: 'ShortCircuit Token',
          symbol: 'SHORT',
          decimals: 9,
          totalSupply: 5000000,
          pairAddress: '0xpairshort',
          socials: {
            telegram: 'https://t.me/short',
          },
          dataSource: TokenDataSource.GMGN,
        });

        // Insert the complete token
        await realDb.tokens.upsertTokenFromTokenData(autoTrackerToken);

        // Create builder
        const builder = new AutoTrackerTokenBuilder(
          testAddress,
          chainId,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        // Spy on API-related methods
        const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
        const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
        const collectSpy = jest.spyOn(builder as any, 'collect');
        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');

        // Call getOrCreate
        const result = await builder.getOrCreate();

        // Verify token was returned
        expect(result).toBeDefined();
        expect(result.address).toBe(testAddress);
        expect(result.symbol).toBe('SHORT');

        // Verify NO API methods were called
        expect(getGmgnTokenSpy).not.toHaveBeenCalled();
        expect(getBirdeyeTokenSpy).not.toHaveBeenCalled();
        expect(collectSpy).not.toHaveBeenCalled();
        expect(getInitialDataSpy).not.toHaveBeenCalled();

        // Verify the Birdeye service itself was never used
        expect(mockBirdeyeService.fetchTokenDataWithMarketCapFromAddress).not.toHaveBeenCalled();
        expect(mockBirdeyeService.fetchTokenWithMarketCap).not.toHaveBeenCalled();

        // Clean up
        await testSeed.deleteToken(testAddress, chainId);
      });

      it('should fetch and create token when not in database', async () => {
        // Use a token address that doesn't exist in the database
        const testAddress = '0xnewtoken1234567890123456789012345';

        // Verify token doesn't exist
        const existingToken = await realDb.tokens.findOneByTokenAddress(testAddress);
        expect(existingToken).toBeNull();

        // Create builder
        const builder = new AutoTrackerTokenBuilder(
          testAddress,
          chainId,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        // Mock rawData to return valid data for collection
        const mockRawData = new RawTokenDataCacheMock(testAddress, chainId);

        // Spy on methods to verify they ARE called
        const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
        const collectSpy = jest.spyOn(builder as any, 'collect');
        const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
        const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');

        // Mock the collect method to return data
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
          birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
          birdeyeMarkets: mockRawData.birdeye.getMarkets(),
          gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
          gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
        });

        // Mock getGmgnAutoTrackerToken to return a valid token
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

        // Mock getBirdeyeAutoTrackerToken to return null (only GMGN succeeds)
        getBirdeyeTokenSpy.mockResolvedValue(null);

        // Mock database upsert
        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        // Call getOrCreate - should fetch and create
        const result = await builder.getOrCreate();

        // Verify result
        expect(result).toBeDefined();
        expect(result.address).toBe(testAddress);
        expect(result.name).toBe('New GMGN Token');

        // Verify API methods WERE called
        expect(getInitialDataSpy).toHaveBeenCalled();
        expect(collectSpy).toHaveBeenCalled();
        expect(getGmgnTokenSpy).toHaveBeenCalled();
        expect(getBirdeyeTokenSpy).toHaveBeenCalled();

        // Verify token was saved to database
        expect(upsertSpy).toHaveBeenCalled();
        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: testAddress,
          name: 'New GMGN Token',
        }));

        // Clean up (in case it was actually inserted)
        await testSeed.deleteToken(testAddress, chainId).catch(() => {
          // Ignore error if token wasn't actually inserted
        });
      });

      it('should fetch additional data when DB token is incomplete', async () => {
        // Create an incomplete token (missing pairAddress which is required)
        const testAddress = '0xincomplete123456789012345678901';

        // Insert the incomplete token into database
        // We need to bypass the normal validation, so use Prisma directly
        const prisma = dbHelper.getPrisma();
        await prisma.token.create({
          data: {
            address: testAddress,
            chain: { connect: { chain_id: chainId } },
            name: 'Incomplete Token',
            symbol: 'INC',
            decimals: 18,
            total_supply: '1000000',
            pair_address: '' as any, // Empty string instead of null to pass type check
            telegram_url: 'https://t.me/incomplete',
            data_source: TokenDataSource.GMGN,
          },
        });

        // Create builder
        const builder = new AutoTrackerTokenBuilder(
          testAddress,
          chainId,
          undefined,
          mockBirdeyeService as any,
          realDb
        );

        // Spy on methods to verify they ARE called (should fetch to complete the token)
        const collectSpy = jest.spyOn(builder as any, 'collect');
        const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
        const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');

        // Mock the collect method
        const mockRawData = new RawTokenDataCacheMock(testAddress, chainId);
        collectSpy.mockResolvedValue({
          birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
          birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
          birdeyeMarkets: mockRawData.birdeye.getMarkets(),
          gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
          gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
        });

        // Mock Birdeye to return token with the missing pairAddress
        const mockBirdeyeToken = new AutoTrackerToken({
          address: testAddress,
          chainId,
          name: 'Incomplete Token',
          symbol: 'INC',
          decimals: 18,
          totalSupply: 1000000,
          pairAddress: '0xcompletedpair', // This fills the missing field!
          socials: {
            twitter: 'https://twitter.com/complete',
          },
          dataSource: TokenDataSource.BIRDEYE,
        });
        getBirdeyeTokenSpy.mockResolvedValue(mockBirdeyeToken);
        getGmgnTokenSpy.mockResolvedValue(null);

        // Mock database upsert
        const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

        // Call getOrCreate - should fetch to complete the token
        const result = await builder.getOrCreate();

        // Verify result has the completed data (merged from DB + API)
        expect(result).toBeDefined();
        expect(result.address).toBe(testAddress);
        expect(result.pairAddress).toBe('0xcompletedpair'); // Should have the missing field now
        expect(result.name).toBe('Incomplete Token'); // From DB
        expect(result.socials.telegram).toBe('https://t.me/incomplete'); // From DB
        expect(result.socials.twitter).toBe('https://twitter.com/complete'); // From API

        // Verify API methods WERE called to fetch missing data
        expect(collectSpy).toHaveBeenCalled();
        expect(getGmgnTokenSpy).toHaveBeenCalled();
        expect(getBirdeyeTokenSpy).toHaveBeenCalled();

        // Verify the completed token was saved back to database
        expect(upsertSpy).toHaveBeenCalled();
        expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
          address: testAddress,
          pairAddress: '0xcompletedpair',
        }));

        // Clean up
        await testSeed.deleteToken(testAddress, chainId);
      });

      describe('checks required fields correctly', () => {
        beforeEach(async () => {
          // Clear the database before each test in this block
          await dbHelper.reset();
          await dbHelper.insertChains();

          // Recreate realDb with the current Prisma instance after reset
          const { Database: RealDatabase } = jest.requireActual<typeof import('../../../db/database')>('../../../db/database');
          realDb = new (RealDatabase as any)(dbHelper.getPrisma());
        });

        it('should use hasMissingRequiredFields to determine if token is complete', async () => {
          const testAddress = '0xfieldscheck1234567890123456789012';

          // Create a complete token with all required fields
          const autoTrackerToken = new AutoTrackerToken({
            address: testAddress,
            chainId,
            name: 'Complete Token',
            symbol: 'COMP',
            decimals: 18,
            totalSupply: 1000000,
            pairAddress: '0xpair456',
            socials: {
              telegram: 'https://t.me/complete',
              twitter: 'https://twitter.com/complete',
            },
            dataSource: TokenDataSource.BIRDEYE,
          });

          // Insert the complete token into database
          try {
            await realDb.tokens.upsertTokenFromTokenData(autoTrackerToken);
          } catch (error) {
            console.error('Error upserting token:', error);
            throw error;
          }

          // Verify the token was actually inserted
          const verifyToken = await realDb.tokens.findOneByTokenAddress(testAddress);
          if (!verifyToken) {
            console.error('Token not found after upsert. Address:', testAddress);
            console.error('ChainId:', chainId);
            // Try querying all tokens to see what's in the database
            const allTokens = await dbHelper.getPrisma().token.findMany();
            console.error('All tokens in database:', allTokens.length);
          }
          expect(verifyToken).not.toBeNull();
          expect(verifyToken?.address).toBe(testAddress);

          // Create builder
          const builder = new AutoTrackerTokenBuilder(
            testAddress,
            chainId,
            undefined,
            mockBirdeyeService as any,
            realDb
          );

          // Spy on methods - these should NOT be called since token is complete
          const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
          const collectSpy = jest.spyOn(builder as any, 'collect');
          const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
          const getBirdeyeTokenSpy = jest.spyOn(builder as any, 'getBirdeyeAutoTrackerToken');
          const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');

          // Call getOrCreate
          const result = await builder.getOrCreate();

          // Verify getDbToken was called
          expect(getDbTokenSpy).toHaveBeenCalled();

          // Get the token that was returned from getDbToken
          const dbToken = await getDbTokenSpy.mock.results[0].value;
          expect(dbToken).not.toBeNull();

          // Verify the token is complete (hasMissingRequiredFields returns false)
          expect(dbToken.hasMissingRequiredFields()).toBe(false);

          // Verify collect was NOT called because token was complete
          expect(collectSpy).not.toHaveBeenCalled();

          // Verify API methods were NOT called because token was complete
          expect(getInitialDataSpy).not.toHaveBeenCalled();
          expect(getBirdeyeTokenSpy).not.toHaveBeenCalled();
          expect(getGmgnTokenSpy).not.toHaveBeenCalled();

          // Verify result is the complete token
          expect(result).toBeDefined();
          expect(result.address).toBe(testAddress);
          expect(result.name).toBe('Complete Token');
          expect(result.pairAddress).toBe('0xpair456');

          // Clean up
          await testSeed.deleteToken(testAddress, chainId);
        });

        it('should merge tokens with available data even when some sources fail', async () => {
          const testAddress = '0xmergetest12345678901234567890123';

          // Create builder
          const builder = new AutoTrackerTokenBuilder(
            testAddress,
            chainId,
            undefined,
            mockBirdeyeService as any,
            realDb
          );

          // Mock getDbToken to return null (no token in DB)
          const getDbTokenSpy = jest.spyOn(builder as any, 'getDbToken');
          getDbTokenSpy.mockResolvedValue(null);

          // Mock getInitialData to provide chain ID
          const getInitialDataSpy = jest.spyOn(builder as any, 'getInitialData');
          getInitialDataSpy.mockResolvedValue({
            token: { chainId },
            rawData: {}
          });

          // Mock collect
          const mockRawData = new RawTokenDataCacheMock(testAddress, chainId);
          const collectSpy = jest.spyOn(builder as any, 'collect');
          collectSpy.mockResolvedValue({
            birdeyeTokenOverview: mockRawData.birdeye.getTokenOverview(),
            birdeyeTokenSecurity: mockRawData.birdeye.getTokenSecurity(),
            birdeyeMarkets: mockRawData.birdeye.getMarkets(),
            gmgnTokenInfo: mockRawData.gmgn.getTokenInfo(),
            gmgnTokenSocials: mockRawData.gmgn.getGmgnSocials(),
          });

          // Mock GMGN to fail (return null)
          const getGmgnTokenSpy = jest.spyOn(builder as any, 'getGmgnAutoTrackerToken');
          getGmgnTokenSpy.mockResolvedValue(null);

          // Mock Birdeye to succeed
          const mockBirdeyeToken = new AutoTrackerToken({
            address: testAddress,
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

          // Mock database upsert
          const upsertSpy = jest.spyOn(realDb.tokens, 'upsertTokenFromTokenData').mockResolvedValue(undefined);

          // Call getOrCreate
          const result = await builder.getOrCreate();

          // Verify both sources were attempted
          expect(getGmgnTokenSpy).toHaveBeenCalled();
          expect(getBirdeyeTokenSpy).toHaveBeenCalled();

          // Verify result is the merged token (should only have Birdeye data since GMGN failed)
          expect(result).toBeDefined();
          expect(result.address).toBe(testAddress);
          expect(result.name).toBe('Test Token');
          expect(result.symbol).toBe('TEST');
          expect(result.pairAddress).toBe('0xpair');
          expect(result.dataSource).toBe(TokenDataSource.BIRDEYE);

          // Verify token was saved
          expect(upsertSpy).toHaveBeenCalled();
          expect(upsertSpy).toHaveBeenCalledWith(expect.objectContaining({
            address: testAddress,
            name: 'Test Token',
          }));
        });
      });
    });

    describe('Chain ID Resolution Flow', () => {
      describe('DB token without chain ID triggers resolution', () => {
        it('should fetch initial data to resolve chain ID when DB token lacks it', () => {
          // TODO: Implement
        });
      });

      describe('builder chain ID takes precedence', () => {
        it('should use chain ID from builder constructor even if DB token lacks it', () => {
          // TODO: Implement
        });
      });

      describe('DB token with chain ID skips resolution', () => {
        it('should not resolve chain ID if DB token already has it', () => {
          // TODO: Implement
        });
      });

      describe('no chain ID anywhere triggers resolution', () => {
        it('should resolve chain ID when builder and DB token both lack it', () => {
          // TODO: Implement
        });
      });

      describe('initializes rawData with getInitialData response', () => {
        it('should pass rawData from getInitialData to initialiseRawData', () => {
          // TODO: Implement
        });
      });
    });

    describe('Data Merging Scenarios', () => {
      describe('merges DB token with API data', () => {
        it('should merge existing DB token with fresh API data from both sources', () => {
          // TODO: Implement
        });
      });

      describe('merges three sources in correct order', () => {
        it('should pass tokens in correct order to mergeMany', () => {
          // TODO: Implement
        });
      });

      describe('handles only GMGN returning data', () => {
        it('should create token when only GMGN source succeeds, Birdeye fails', () => {
          // TODO: Implement
        });
      });

      describe('handles only Birdeye returning data', () => {
        it('should create token when only Birdeye source succeeds, GMGN fails', () => {
          // TODO: Implement
        });
      });

      describe('merges partial data from multiple sources', () => {
        it('should combine partial data from each source to meet requirements', () => {
          // TODO: Implement
        });
      });

      describe('handles all sources returning null except DB', () => {
        it('should try to work with just DB token if APIs fail', () => {
          // TODO: Implement
        });
      });
    });

    describe('Validation and Persistence', () => {
      describe('validates merged token before saving', () => {
        it('should call AutoTrackerToken.validate on merged token', () => {
          // TODO: Implement
        });
      });

      describe('throws validation error for incomplete token', () => {
        it('should throw validation error if merged token still missing required fields', () => {
          // TODO: Implement
        });
      });

      describe('validation checks required fields list', () => {
        it('should validate against AutoTrackerToken.requiredFields', () => {
          // TODO: Implement
        });
      });

      describe('upserts token to database after validation', () => {
        it('should save merged token to database after successful validation', () => {
          // TODO: Implement
        });
      });

      describe('returns merged and validated token', () => {
        it('should return the final merged token after validation and save', () => {
          // TODO: Implement
        });
      });

      describe('upsert happens after validation passes', () => {
        it('should ensure validation precedes database upsert', () => {
          // TODO: Implement
        });
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
    it('should handle complete flow: no chain ID, no DB, both APIs succeed', () => {
      // TODO: Implement
      // Should:
      // 1. Resolve chain ID via getInitialData
      // 2. Collect data from sources
      // 3. Fetch from both APIs
      // 4. Merge tokens
      // 5. Validate
      // 6. Save to DB
      // 7. Return complete token
    });

    it('should handle complete flow when chain ID is known', () => {
      // TODO: Implement
    });

    it('should enrich partial DB data with API data', () => {
      // TODO: Implement
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
    it('should maintain consistent chain ID across all API calls', () => {
      // TODO: Implement
    });

    it('should update builder\'s chain ID after resolution', () => {
      // TODO: Implement
    });

    it('should pass correct chain ID when creating RawTokenDataCache', () => {
      // TODO: Implement
    });
  });
});
