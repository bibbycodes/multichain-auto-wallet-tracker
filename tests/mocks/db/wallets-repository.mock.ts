import { PrismaClient } from "@prisma/client";
import { WalletsRepository } from "../../../src/lib/db/repositories/wallets";

/**
 * Mock implementation of WalletsRepository using Jest mocks
 */
export class MockWalletsRepository implements Partial<WalletsRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    
    create = jest.fn();
    getOrCreate = jest.fn();
    createManyWallets = jest.fn();
    findManyByAddresses = jest.fn();
    findOneByAddressAndChainId = jest.fn();
    findManyByChainId = jest.fn();
}

/**
 * Create a mock WalletsRepository instance
 */
export function createMockWalletsRepository(prisma?: PrismaClient): MockWalletsRepository {
    return new MockWalletsRepository(prisma);
}
