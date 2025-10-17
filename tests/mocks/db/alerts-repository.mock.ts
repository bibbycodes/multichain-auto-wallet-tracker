import { AlertsRepository } from "../../../src/lib/db/repositories/alerts";
import { Prisma, PrismaClient, SocialPlatform } from "@prisma/client";

/**
 * Mock implementation of AlertsRepository using Jest mocks
 */
export class MockAlertsRepository implements Partial<AlertsRepository> {
    private prisma: PrismaClient;
    
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || ({} as PrismaClient);
    }
    createAlert = jest.fn();
    createManyAlerts = jest.fn();
    findOneById = jest.fn();
    findManyByTokenAddress = jest.fn();
    findManyByTokenId = jest.fn();
    findManyBySocialPlatform = jest.fn();
    findManyByTokenAddressAndSocialPlatform = jest.fn();
    findManyByDateRange = jest.fn();
    findManyByMarketCapRange = jest.fn();
    findManyByPriceRange = jest.fn();
    updateAlert = jest.fn();
    deleteAlert = jest.fn();
    deleteManyByTokenAddress = jest.fn();
    deleteManyByTokenId = jest.fn();
    deleteManyBySocialPlatform = jest.fn();
    countByTokenAddress = jest.fn();
    countByTokenId = jest.fn();
    countBySocialPlatform = jest.fn();
    countByDateRange = jest.fn();
    findManyWithPagination = jest.fn();
    findManyByTokenAddressWithPagination = jest.fn();
    findManyBySocialPlatformWithPagination = jest.fn();
}

/**
 * Create a mock AlertsRepository instance
 */
export function createMockAlertsRepository(prisma?: PrismaClient): MockAlertsRepository {
    return new MockAlertsRepository(prisma);
}
