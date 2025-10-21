import { Prisma, PrismaClient, Alert, SocialPlatform } from "@prisma/client";

export class AlertsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createAlert(alert: Prisma.AlertCreateInput) {
        return this.prisma.alert.create({
            data: alert
        });
    }

    async createManyAlerts(alerts: Prisma.AlertCreateManyInput[]) {
        return this.prisma.alert.createMany({
            data: alerts
        });
    }

    async findOneById(id: string) {
        return this.prisma.alert.findUnique({
            where: {
                id
            },
            include: {
                token: true
            }
        });
    }

    async findManyByTokenAddress(tokenAddress: string) {
        return this.prisma.alert.findMany({
            where: {
                token_address: tokenAddress
            },
            include: {
                token: true
            }
        });
    }

    async findManyByTokenId(tokenId: string) {
        return this.prisma.alert.findMany({
            where: {
                token_id: tokenId
            },
            include: {
                token: true
            }
        });
    }

    async findManyBySocialPlatform(socialPlatform: SocialPlatform) {
        return this.prisma.alert.findMany({
            where: {
                social_platform: socialPlatform
            },
            include: {
                token: true
            }
        });
    }

    async findManyByTokenAddressAndSocialPlatform(tokenAddress: string, socialPlatform: SocialPlatform) {
        return this.prisma.alert.findMany({
            where: {
                token_address: tokenAddress,
                social_platform: socialPlatform
            },
            include: {
                token: true
            }
        });
    }

    async findManyByDateRange(startDate: Date, endDate: Date) {
        return this.prisma.alert.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                token: true
            }
        });
    }

    async findManyByMarketCapRange(minMarketCap: number, maxMarketCap: number) {
        return this.prisma.alert.findMany({
            where: {
                market_cap: {
                    gte: minMarketCap,
                    lte: maxMarketCap
                }
            },
            include: {
                token: true
            }
        });
    }

    async findManyByPriceRange(minPrice: number, maxPrice: number) {
        return this.prisma.alert.findMany({
            where: {
                price: {
                    gte: minPrice,
                    lte: maxPrice
                }
            },
            include: {
                token: true
            }
        });
    }

    async updateAlert(id: string, data: Prisma.AlertUpdateInput) {
        return this.prisma.alert.update({
            where: {
                id
            },
            data
        });
    }

    async deleteAlert(id: string) {
        return this.prisma.alert.delete({
            where: {
                id
            }
        });
    }

    async deleteManyByTokenAddress(tokenAddress: string) {
        return this.prisma.alert.deleteMany({
            where: {
                token_address: tokenAddress
            }
        });
    }

    async deleteManyByTokenId(tokenId: string) {
        return this.prisma.alert.deleteMany({
            where: {
                token_id: tokenId
            }
        });
    }

    async deleteManyBySocialPlatform(socialPlatform: SocialPlatform) {
        return this.prisma.alert.deleteMany({
            where: {
                social_platform: socialPlatform
            }
        });
    }

    async countByTokenAddress(tokenAddress: string) {
        return this.prisma.alert.count({
            where: {
                token_address: tokenAddress
            }
        });
    }

    async countByTokenId(tokenId: string) {
        return this.prisma.alert.count({
            where: {
                token_id: tokenId
            }
        });
    }

    async countBySocialPlatform(socialPlatform: SocialPlatform) {
        return this.prisma.alert.count({
            where: {
                social_platform: socialPlatform
            }
        });
    }

    async countByDateRange(startDate: Date, endDate: Date) {
        return this.prisma.alert.count({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
    }

    async findManyWithPagination(skip: number, take: number) {
        return this.prisma.alert.findMany({
            skip,
            take,
            include: {
                token: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async findManyByTokenAddressWithPagination(tokenAddress: string, skip: number, take: number) {
        return this.prisma.alert.findMany({
            where: {
                token_address: tokenAddress
            },
            skip,
            take,
            include: {
                token: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async findManyBySocialPlatformWithPagination(socialPlatform: SocialPlatform, skip: number, take: number) {
        return this.prisma.alert.findMany({
            where: {
                social_platform: socialPlatform
            },
            skip,
            take,
            include: {
                token: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }
}
