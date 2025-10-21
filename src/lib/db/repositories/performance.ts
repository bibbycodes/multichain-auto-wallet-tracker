import { Prisma, PrismaClient } from "@prisma/client";

export class PerformanceRepository {
    constructor(private prisma: PrismaClient) {}
    
    async create(performance: Prisma.WalletPerformanceCreateInput) {
        return this.prisma.walletPerformance.create({
            data: performance
        })
    }

    async findByWalletId(walletId: string) {    
        return this.prisma.walletPerformance.findMany({
            where: {
                wallet_id: walletId
            }
        })
    }

    async findByWalletAddress(walletAddress: string) {
        return this.prisma.walletPerformance.findMany({
            where: {
                wallet_address: walletAddress
            }
        })
    }

    async findByWalletAddressAndChainId(walletAddress: string, chainId: string) {
        return this.prisma.walletPerformance.findMany({
            where: {
                wallet_address: walletAddress,
                chain_id: chainId
            }
        })
    }
}