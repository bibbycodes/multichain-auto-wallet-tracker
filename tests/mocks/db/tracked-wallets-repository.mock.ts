import { PrismaClient } from "@prisma/client";
import { TrackedWalletsRepository } from "../../../src/lib/db/repositories/tracked-wallets";

/**
 * Mock implementation of TrackedWalletsRepository using Jest mocks
 */
export class MockTrackedWalletsRepository implements Partial<TrackedWalletsRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    create = jest.fn();
    createMany = jest.fn();
    findOneByAddressAndChainIdOrFail = jest.fn();
    findOneByAddressAndChainId = jest.fn();
    findManyByAddresses = jest.fn();
    findManyByAddressesAndChainId = jest.fn();
    existsByAddressAndChainId = jest.fn();
    findOneAndReturnAutoTrackerWalletByAddressAndChainId = jest.fn();
    toTrackedWallet = jest.fn();
}

/**
 * Create a mock TrackedWalletsRepository instance
 */
export function createMockTrackedWalletsRepository(prisma?: PrismaClient): MockTrackedWalletsRepository {
    return new MockTrackedWalletsRepository(prisma);
}
