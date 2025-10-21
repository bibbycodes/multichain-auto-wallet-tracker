import { Prisma, TrackedWalletType, Wallet } from "@prisma/client";
import { ChainId } from "shared/chains";
import { AutoTrackerWalletPerformance } from "./performance/performance";
import { AutoTrackerPortfolioModel } from "./portfolio/portfolio";
import { TrackedWalletData } from "./types";
import { Database } from "../../db/database";

export class AutoTrackerWallet {
    id?: string;
    walletId?: string;
    address: string;
    chainId: ChainId;
    createdAt: Date;
    updatedAt: Date;
    types: TrackedWalletType[];
    performance?: AutoTrackerWalletPerformance;
    portfolio?: AutoTrackerPortfolioModel;
    walletData: TrackedWalletData;
    db: Database;

    constructor({
        walletData,
        performance,
        portfolio
    }: {
        walletData: TrackedWalletData,
        performance?: AutoTrackerWalletPerformance,
        portfolio?: AutoTrackerPortfolioModel
    }) {
        this.id = walletData.id
        this.walletData = walletData
        this.performance = performance
        this.portfolio = portfolio
        this.address = walletData.address;
        this.walletId = walletData.walletId
        this.chainId = walletData.chainId;
        this.createdAt = walletData.createdAt ?? new Date();
        this.updatedAt = walletData.updatedAt ?? new Date();
        this.types = walletData.types;
        this.db = Database.getInstance()
    }

    toDb(): Prisma.TrackedWalletCreateInput {
        return {
            address: this.walletData.address,
            wallet: {
                connect: {
                    id: this.walletData.walletId
                }
            },
            chain: {
                connect: {
                    chain_id: this.walletData.chainId
                }
            },
            types: this.walletData.types,
        }
    }

    async getOrCreateRelatedWallet(): Promise<Wallet> {
        const walletRecord = await this.db.wallets.getOrCreate({
            address: this.walletData.address,
            chain: {
                connect: {
                    chain_id: this.walletData.chainId
                }
            },
            created_at: this.walletData.createdAt ?? new Date(),
            updated_at: this.walletData.updatedAt ?? new Date(),
        }, this.walletData.chainId)
        this.walletData.walletId = walletRecord.id
        return walletRecord
    }

    async save() {
        await this.getOrCreateRelatedWallet()
        const trackedWallet = await this.db.trackedWallets.create(this.toDb())
        await this.portfolio?.save(this)
        await this.performance?.save(this)
        return trackedWallet
    }
}