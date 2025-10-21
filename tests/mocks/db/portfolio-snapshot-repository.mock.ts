import { PortfolioSnapshotRepository } from "../../../src/lib/db/repositories/portfolio-snapshot";
import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Mock implementation of PortfolioSnapshotRepository using Jest mocks
 */
export class MockPortfolioSnapshotRepository implements Partial<PortfolioSnapshotRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    create = jest.fn();
    findByWalletId = jest.fn();
    findByWalletAddress = jest.fn();
}

/**
 * Create a mock PortfolioSnapshotRepository instance
 */
export function createMockPortfolioSnapshotRepository(prisma?: PrismaClient): MockPortfolioSnapshotRepository {
    return new MockPortfolioSnapshotRepository(prisma);
}
