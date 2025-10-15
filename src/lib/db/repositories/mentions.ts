import { Prisma, PrismaClient } from "@prisma/client";

export class MentionsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createMention(mention: Prisma.MentionsCreateInput) {
        return this.prisma.mentions.create({
            data: mention
        });
    }

    async createManyMentions(mentions: Prisma.MentionsCreateManyInput[]) {
        return this.prisma.mentions.createMany({
            data: mentions
        });
    }

    async findOneById(id: string) {
        return this.prisma.mentions.findUnique({
            where: {
                id
            },
            include: {
                social_channel: true,
                chain: true,
                token: true
            }
        });
    }

    async findManyByTokenAddress(tokenAddress: string) {
        return this.prisma.mentions.findMany({
            where: {
                token_address: tokenAddress
            },
            include: {
                social_channel: true,
                chain: true,
                token: true
            }
        });
    }

    async findManyByChainId(chainId: string) {
        return this.prisma.mentions.findMany({
            where: {
                chain_id: chainId
            },
            include: {
                social_channel: true,
                chain: true,
                token: true
            }
        });
    }

    async findManyBySocialChannelId(socialChannelId: string) {
        return this.prisma.mentions.findMany({
            where: {
                social_channel_id: socialChannelId
            },
            include: {
                social_channel: true,
                chain: true,
                token: true
            }
        });
    }

    async findManyByTokenAddressAndChainId(tokenAddress: string, chainId: string) {
        return this.prisma.mentions.findMany({
            where: {
                token_address: tokenAddress,
                chain_id: chainId
            },
            include: {
                social_channel: true,
                chain: true,
                token: true
            }
        });
    }

    async findManyByDateRange(startDate: Date, endDate: Date) {
        return this.prisma.mentions.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                social_channel: true,
                chain: true,
                token: true
            }
        });
    }

    async updateMention(id: string, data: Prisma.MentionsUpdateInput) {
        return this.prisma.mentions.update({
            where: {
                id
            },
            data
        });
    }

    async deleteMention(id: string) {
        return this.prisma.mentions.delete({
            where: {
                id
            }
        });
    }

    async deleteManyByTokenAddress(tokenAddress: string) {
        return this.prisma.mentions.deleteMany({
            where: {
                token_address: tokenAddress
            }
        });
    }

    async deleteManyByChainId(chainId: string) {
        return this.prisma.mentions.deleteMany({
            where: {
                chain_id: chainId
            }
        });
    }

    async countByTokenAddress(tokenAddress: string) {
        return this.prisma.mentions.count({
            where: {
                token_address: tokenAddress
            }
        });
    }

    async countByChainId(chainId: string) {
        return this.prisma.mentions.count({
            where: {
                chain_id: chainId
            }
        });
    }

    async countBySocialChannelId(socialChannelId: string) {
        return this.prisma.mentions.count({
            where: {
                social_channel_id: socialChannelId
            }
        });
    }
}
