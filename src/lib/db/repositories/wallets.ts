import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ChainId } from "../../../shared/chains";

export class WalletsRepository {
    constructor(private readonly prisma: PrismaClient) {}
    
    async create(wallet: Prisma.WalletCreateInput) {
        return this.prisma.wallet.create({
            data: wallet
        });
    }

    async getOrCreate(wallet: Prisma.WalletCreateInput, chainId: ChainId) {
        const existingWallet = await this.findOneByAddressAndChainId(wallet.address, chainId)
        if (existingWallet) {
            return existingWallet
        }
        return this.create(wallet)
    }
    
    async createManyWallets(wallets: Prisma.WalletCreateManyInput[]) {
        return this.prisma.wallet.createMany({
            data: wallets
        });
    }

    async findManyByAddresses(addresses: string[]) {
        return this.prisma.wallet.findMany({
            where: {
                address: { in: addresses }
            }
        });
    }

    async findOneByAddressAndChainId(address: string, chainId: string) {
        return this.prisma.wallet.findUnique({
            where: {
                address_chain_id: { address, chain_id: chainId }
            }
        });
    }

    async findManyByChainId(chainId: string) {
        return this.prisma.wallet.findMany({
            where: {
                chain_id: chainId
            }
        });
    }
}
