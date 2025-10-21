import { PrismaClient } from "@prisma/client";
import { ChainsRepository } from "../../../src/lib/db/repositories/chains";

/**
 * Mock implementation of ChainsRepository using Jest mocks
 */
export class MockChainsRepository implements Partial<ChainsRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    
    createChain = jest.fn();
    findAll = jest.fn();
    findOneById = jest.fn();
    createOne = jest.fn();
    createMany = jest.fn();
    findOrCreate = jest.fn();
    findMany = jest.fn();
}

/**
 * Create a mock ChainsRepository instance
 */
export function createMockChainsRepository(prisma?: PrismaClient): MockChainsRepository {
    return new MockChainsRepository(prisma);
}
