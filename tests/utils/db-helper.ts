import { PrismaClient, ChainType } from '@prisma/client';
import { ChainsMap } from '../../src/shared/chains';
import { Database } from '../../src/lib/db/database';

/**
 * Test database helper for managing database state during tests
 */
export class TestDbHelper {
    private static instance: TestDbHelper;
    private prisma: PrismaClient;
    private database: Database;

    private constructor() {
        this.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
        // Create a Database instance with the test Prisma client
        this.database = new (Database as any)(this.prisma);
    }

    static getInstance(): TestDbHelper {
        if (!TestDbHelper.instance) {
            TestDbHelper.instance = new TestDbHelper();
        }
        return TestDbHelper.instance;
    }

    getPrisma(): PrismaClient {
        return this.prisma;
    }

    /**
     * Get Database instance configured with test Prisma client
     * Use this in tests that need to interact with the Database class
     */
    getDatabase(): Database {
        return this.database;
    }

    /**
     * Clean all test data from the database
     */
    async cleanDatabase(): Promise<void> {
        // Delete in order of dependencies to avoid foreign key constraints
        await this.prisma.alert.deleteMany({});
        await this.prisma.mentions.deleteMany({});
        await this.prisma.walletTransactions.deleteMany({});
        await this.prisma.walletSwaps.deleteMany({});
        await this.prisma.portfolioSnapshot.deleteMany({});
        await this.prisma.walletPerformance.deleteMany({});
        await this.prisma.trackedWallet.deleteMany({});
        await this.prisma.trendingToken.deleteMany({});
        await this.prisma.socialChannel.deleteMany({});
        await this.prisma.wallet.deleteMany({});
        await this.prisma.token.deleteMany({});
        // Don't delete chains - they're core data
    }

    /**
     * Ensure required chains exist in the database
     */
    async insertChains(): Promise<void> {
        const chains = [
            {
                chain_id: ChainsMap.ethereum,
                name: 'Ethereum',
                chain_type: ChainType.EVM,
                native_token_address: '0x0000000000000000000000000000000000000000',
                wrapped_token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                chain_id: ChainsMap.bsc,
                name: 'BSC',
                chain_type: ChainType.EVM,
                native_token_address: '0x0000000000000000000000000000000000000000',
                wrapped_token_address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                chain_id: ChainsMap.solana,
                name: 'Solana',
                chain_type: ChainType.SOLANA,
                native_token_address: 'So11111111111111111111111111111111111111112',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const chain of chains) {
            await this.prisma.chain.upsert({
                where: { chain_id: chain.chain_id },
                update: chain,
                create: chain,
            });
        }
    }

    /**
     * Initialize test database - ensure chains exist
     */
    async initialize(): Promise<void> {
        await this.insertChains();
    }

    /**
     * Reset database to clean state for tests
     */
    async reset(): Promise<void> {
        await this.cleanDatabase();
        await this.insertChains();
    }

    /**
     * Close database connection
     */
    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }
}

/**
 * Global setup for Jest tests
 */
export async function setupTestDatabase(): Promise<void> {
    const dbHelper = TestDbHelper.getInstance();
    await dbHelper.initialize();
    await dbHelper.reset();
}

/**
 * Global teardown for Jest tests
 */
export async function teardownTestDatabase(): Promise<void> {
    const dbHelper = TestDbHelper.getInstance();
    await dbHelper.cleanDatabase();
    await dbHelper.disconnect();
}

/**
 * Before each test - clean database
 */
export async function beforeEachTest(): Promise<void> {
    const dbHelper = TestDbHelper.getInstance();
    await dbHelper.cleanDatabase();
}
