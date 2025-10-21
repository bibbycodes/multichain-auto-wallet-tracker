import { Prisma, PrismaClient, TrackedWallet } from "@prisma/client";
import { AutoTrackerWallet } from "../../models/wallet";
import { ChainId } from "../../../shared/chains";


export class TrackedWalletsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: Prisma.TrackedWalletCreateInput): Promise<TrackedWallet> {
        return this.prisma.trackedWallet.create({ data });
    }

    async createMany(data: Prisma.TrackedWalletCreateManyInput[]): Promise<void> {
        await this.prisma.trackedWallet.createMany({ data });
    }

    async findOneByAddressAndChainIdOrFail(address: string, chainId: string): Promise<TrackedWallet> {
        return this.prisma.trackedWallet.findFirstOrThrow({
            where: { address, chain_id: chainId },
        });
    }

    async findOneByAddressAndChainId(address: string, chainId: string): Promise<TrackedWallet | null> {
        return this.prisma.trackedWallet.findFirst({
            where: { address, chain_id: chainId },
        });
    }

    async findManyByAddresses(addresses: string[]): Promise<TrackedWallet[]> {
        return this.prisma.trackedWallet.findMany({
            where: { address: { in: addresses } },
        });
    }

    async findManyByAddressesAndChainId(addresses: string[], chainId: string): Promise<TrackedWallet[]> {
        return this.prisma.trackedWallet.findMany({
            where: { address: { in: addresses }, chain_id: chainId },
        });
    }

    async existsByAddressAndChainId(address: string, chainId: string): Promise<boolean> {
        const trackedWallet = await this.prisma.trackedWallet.findFirst({
            where: { address, chain_id: chainId },
        });
        return !!trackedWallet;
    }

    async findOneAndReturnAutoTrackerWalletByAddressAndChainId(address: string, chainId: string): Promise<AutoTrackerWallet> {
        const trackedWallet = await this.prisma.trackedWallet.findFirst({
            where: { address, chain_id: chainId },
            include: {
                wallet: {
                    include: {
                        portfolio_snapshots: {
                            take: 1,
                            orderBy: {
                                created_at: 'desc',
                            },
                        },
                    }
                },
            }
        });

        if (!trackedWallet) {
            throw new Error('Tracked wallet not found');
        }

        return this.toTrackedWallet(trackedWallet);
    }

    async toTrackedWallet(data: TrackedWallet): Promise<AutoTrackerWallet> {
        return new AutoTrackerWallet({walletData: {
            id: data.id,
            address: data.address,
            chainId: data.chain_id as ChainId,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            types: data.types,
            walletId: data.wallet_id,
        }});
    }
}