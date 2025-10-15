import { Prisma, PrismaClient } from "@prisma/client";
import { Database } from "../database";
export class PortfolioSnapshotRepository {
    constructor(private prisma: PrismaClient = Database.getInstance().prismaClient) {}
    async create(portfolioSnapshot: Prisma.PortfolioSnapshotCreateInput) {
        return this.prisma.portfolioSnapshot.create({
            data: portfolioSnapshot
        })
    }

    async findByWalletId(walletId: string) {
        return this.prisma.portfolioSnapshot.findMany({
            where: {
                wallet_id: walletId
            }
        })
    }

    async findByWalletAddress(walletAddress: string) {
        return this.prisma.portfolioSnapshot.findFirst({
            where: {
                wallet_address: walletAddress
            },
            orderBy: {
                created_at: 'desc'
            }
        })
    }
}