import { MentionsRepository } from "../../../src/lib/db/repositories/mentions";
import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Mock implementation of MentionsRepository using Jest mocks
 */
export class MockMentionsRepository implements Partial<MentionsRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    createMention = jest.fn();
    createManyMentions = jest.fn();
    findOneById = jest.fn();
    findManyByTokenAddress = jest.fn();
    findManyByChainId = jest.fn();
    findManyBySocialChannelId = jest.fn();
    findManyByTokenAddressAndChainId = jest.fn();
    findManyByDateRange = jest.fn();
    updateMention = jest.fn();
    deleteMention = jest.fn();
    deleteManyByTokenAddress = jest.fn();
    deleteManyByChainId = jest.fn();
    countByTokenAddress = jest.fn();
    countByChainId = jest.fn();
    countBySocialChannelId = jest.fn();
}

/**
 * Create a mock MentionsRepository instance
 */
export function createMockMentionsRepository(prisma?: PrismaClient): MockMentionsRepository {
    return new MockMentionsRepository(prisma);
}
