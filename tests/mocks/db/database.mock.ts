import { PrismaClient } from '@prisma/client';
import { Database } from '../../../src/lib/db/database';
import { 
  MockTokensRepository, 
  createMockTokensRepository,
  MockChainsRepository,
  createMockChainsRepository,
  MockWalletsRepository,
  createMockWalletsRepository,
  MockAlertsRepository,
  createMockAlertsRepository,
  MockMentionsRepository,
  createMockMentionsRepository,
  MockTrackedWalletsRepository,
  createMockTrackedWalletsRepository,
  MockPortfolioSnapshotRepository,
  createMockPortfolioSnapshotRepository,
  MockPerformanceRepository,
  createMockPerformanceRepository,
} from './index';

/**
 * Mock implementation of Database using Jest mocks
 * Matches the interface from src/lib/db/database.ts
 */
export class MockDatabase  {
  public readonly prismaClient: PrismaClient;
  public readonly wallets: MockWalletsRepository;
  public readonly trackedWallets: MockTrackedWalletsRepository;
  public readonly tokens: MockTokensRepository;
  public readonly chains: MockChainsRepository;
  public readonly portfolioSnapshots: MockPortfolioSnapshotRepository;
  public readonly performance: MockPerformanceRepository;
  public readonly mentions: MockMentionsRepository;
  public readonly alerts: MockAlertsRepository;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || ({} as PrismaClient);
    this.wallets = createMockWalletsRepository(this.prismaClient);
    this.trackedWallets = createMockTrackedWalletsRepository(this.prismaClient);
    this.tokens = createMockTokensRepository(this.prismaClient);
    this.chains = createMockChainsRepository(this.prismaClient);
    this.portfolioSnapshots = createMockPortfolioSnapshotRepository(this.prismaClient);
    this.performance = createMockPerformanceRepository(this.prismaClient);
    this.mentions = createMockMentionsRepository(this.prismaClient);
    this.alerts = createMockAlertsRepository(this.prismaClient);
  }

  // Mock the static getInstance method
  public static getInstance(): MockDatabase {
    return new MockDatabase();
  }
}

/**
 * Create a mock Database instance
 */
export function createMockDatabase(prismaClient?: PrismaClient): MockDatabase {
  return new MockDatabase(prismaClient);
}
