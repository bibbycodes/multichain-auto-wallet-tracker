import { TestDbHelper, TestSeed } from './index';

describe('TestSeed', () => {
    let dbHelper: TestDbHelper;
    let testSeed: TestSeed;

    beforeAll(async () => {
        dbHelper = TestDbHelper.getInstance();
        await dbHelper.initialize();
    });

    beforeEach(async () => {
        await dbHelper.reset();
        testSeed = new TestSeed();
    });

    afterAll(async () => {
        await dbHelper.disconnect();
    });

    describe('createBirdeyeToken', () => {
        it('should create a token from Birdeye fixtures', async () => {
            const token = await testSeed.createBirdeyeToken();

            expect(token).toBeDefined();
            expect(token.address).toBe('0xe8852d270294Cc9A84FE73D5a434Ae85a1c34444');
            expect(token.chain_id).toBe('1');
            expect(token.name).toBe('Russell rug Survivor');
            expect(token.symbol).toBe('RUGSURVIVE');
            expect(token.decimals).toBe(18);
            expect(token.data_source).toBe('BIRDEYE');
        });

        it('should create a token with custom address', async () => {
            const customAddress = '0x1234567890123456789012345678901234567890';

            const token = await testSeed.createBirdeyeToken({
                address: customAddress,
            });

            expect(token.address).toBe(customAddress);
        });

        it('should create a token with custom chain ID', async () => {
            const token = await testSeed.createBirdeyeToken({
                chainId: '56',
            });

            expect(token.chain_id).toBe('56');
        });

        it('should override token overview fields', async () => {
            const token = await testSeed.createBirdeyeToken({
                tokenOverview: {
                    name: 'Custom Token Name',
                    symbol: 'CUSTOM',
                },
            });

            expect(token.name).toBe('Custom Token Name');
            expect(token.symbol).toBe('CUSTOM');
        });
    });

    describe('createGmgnToken', () => {
        it('should create a token from GMGN fixtures', async () => {
            const token = await testSeed.createGmgnToken();

            expect(token).toBeDefined();
            expect(token.address).toBe('0xe8852d270294cc9a84fe73d5a434ae85a1c34444');
            expect(token.chain_id).toBe('56');
            expect(token.name).toBe('Russell rug Survivor');
            expect(token.symbol).toBe('RUGSURVIVE');
            expect(token.data_source).toBe('GMGN');
        });

        it('should create a token with custom address', async () => {
            const customAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

            const token = await testSeed.createGmgnToken({
                address: customAddress,
            });

            expect(token.address).toBe(customAddress);
        });
    });

    describe('createMinimalToken', () => {
        it('should create a minimal token with required fields only', async () => {
            const token = await testSeed.createMinimalToken({
                address: '0x1111111111111111111111111111111111111111',
                chainId: '1',
            });

            expect(token).toBeDefined();
            expect(token.address).toBe('0x1111111111111111111111111111111111111111');
            expect(token.chain_id).toBe('1');
            expect(token.name).toBe('Test Token');
            expect(token.symbol).toBe('TEST');
        });

        it('should create a minimal token with custom values', async () => {
            const token = await testSeed.createMinimalToken({
                address: '0x2222222222222222222222222222222222222222',
                chainId: '56',
                name: 'My Token',
                symbol: 'MTK',
                decimals: 6,
            });

            expect(token.name).toBe('My Token');
            expect(token.symbol).toBe('MTK');
            expect(token.decimals).toBe(6);
        });
    });

    describe('seedMultipleTokens', () => {
        it('should seed multiple Birdeye tokens', async () => {
            const tokens = await testSeed.seedMultipleTokens(3, 'birdeye');

            expect(tokens).toHaveLength(3);
            expect(tokens[0].data_source).toBe('BIRDEYE');
            expect(tokens[1].data_source).toBe('BIRDEYE');
            expect(tokens[2].data_source).toBe('BIRDEYE');
        });

        it('should seed multiple GMGN tokens', async () => {
            const tokens = await testSeed.seedMultipleTokens(2, 'gmgn');

            expect(tokens).toHaveLength(2);
            expect(tokens[0].data_source).toBe('GMGN');
            expect(tokens[1].data_source).toBe('GMGN');
        });
    });

    describe('getToken', () => {
        it('should retrieve a token by address and chainId', async () => {
            const created = await testSeed.createBirdeyeToken();

            const retrieved = await testSeed.getToken(created.address, created.chain_id);

            expect(retrieved).toBeDefined();
            expect(retrieved?.address).toBe(created.address);
            expect(retrieved?.chain_id).toBe(created.chain_id);
        });

        it('should return null for non-existent token', async () => {
            const retrieved = await testSeed.getToken('0xnonexistent', '1');

            expect(retrieved).toBeNull();
        });
    });

    describe('deleteToken', () => {
        it('should delete a token by address and chainId', async () => {
            const created = await testSeed.createBirdeyeToken();

            await testSeed.deleteToken(created.address, created.chain_id);

            const retrieved = await testSeed.getToken(created.address, created.chain_id);
            expect(retrieved).toBeNull();
        });
    });

    describe('getFixtures', () => {
        it('should return fixture data', () => {
            const fixtures = TestSeed.getFixtures();

            expect(fixtures.birdeye).toBeDefined();
            expect(fixtures.birdeye.tokenOverview).toBeDefined();
            expect(fixtures.birdeye.tokenSecurity).toBeDefined();
            expect(fixtures.birdeye.markets).toBeDefined();

            expect(fixtures.gmgn).toBeDefined();
            expect(fixtures.gmgn.tokenInfo).toBeDefined();
            expect(fixtures.gmgn.socials).toBeDefined();
        });
    });
});
