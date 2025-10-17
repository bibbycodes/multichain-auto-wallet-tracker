import { PrismaClient } from "@prisma/client";
import { TokensRepository } from "../../../src/lib/db/repositories/tokens";

/**
 * Mock implementation of TokensRepository using Jest mocks
 */
export class MockTokensRepository implements Partial<TokensRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    
    createToken = jest.fn();
    upsertTokenFromTokenData = jest.fn();
    createManyTokens = jest.fn();
    findOneByAddress = jest.fn();
    findOneByAddressAndChainId = jest.fn();
    findOneByTokenAddress = jest.fn();
    findManyByChainId = jest.fn();
    findManyByAddressesAndChainId = jest.fn();
    toModel = jest.fn();
}

/**
 * Create a mock TokensRepository instance
 */
export function createMockTokensRepository(prisma?: PrismaClient): MockTokensRepository {
    return new MockTokensRepository(prisma);
}
