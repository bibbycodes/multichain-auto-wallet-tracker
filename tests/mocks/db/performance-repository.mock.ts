import { PerformanceRepository } from "../../../src/lib/db/repositories/performance";
import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Mock implementation of PerformanceRepository using Jest mocks
 */
export class MockPerformanceRepository implements Partial<PerformanceRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    create = jest.fn();
    findByWalletId = jest.fn();
    findByWalletAddress = jest.fn();
    findByWalletAddressAndChainId = jest.fn();
}

/**
 * Create a mock PerformanceRepository instance
 */
export function createMockPerformanceRepository(prisma?: PrismaClient): MockPerformanceRepository {
    return new MockPerformanceRepository(prisma);
}
