import { PrismaClient } from '@prisma/client'
import { env } from '../services/util/env/env';
import { Singleton } from '../services/util/singleton';
import { WalletsRepository } from './repositories/wallets';
import { TokensRepository } from './repositories/tokens';
import { ChainsRepository } from './repositories/chains';
import { TrackedWalletsRepository } from './repositories/tracked-wallets';
import { PortfolioSnapshotRepository } from './repositories/portfolio-snapshot';
import { PerformanceRepository } from './repositories/performance';
import { MentionsRepository } from './repositories/mentions';
import { AlertsRepository } from './repositories/alerts';

export class Database extends Singleton {
    constructor(
        public readonly prismaClient: PrismaClient = new PrismaClient({
            datasourceUrl: env.database.url
        }),
        public readonly wallets: WalletsRepository = new WalletsRepository(prismaClient),
        public readonly trackedWallets: TrackedWalletsRepository = new TrackedWalletsRepository(prismaClient),
        public readonly tokens: TokensRepository = new TokensRepository(prismaClient),
        public readonly chains: ChainsRepository = new ChainsRepository(prismaClient),
        public readonly portfolioSnapshots: PortfolioSnapshotRepository = new PortfolioSnapshotRepository(prismaClient),
        public readonly performance: PerformanceRepository = new PerformanceRepository(prismaClient),
        public readonly mentions: MentionsRepository = new MentionsRepository(prismaClient),
        public readonly alerts: AlertsRepository = new AlertsRepository(prismaClient)
    ) {
        super();
    }

    public static override getInstance<T extends Singleton>(this: new (params?: any) => T, params?: any): T {
        if (!Singleton.instances.has(this)) {
            const prismaConfig = params?.prismaConfig || {
                log: ['error'],
                datasources: {
                    db: {
                        url: env.database.url + '?connection_limit=10&pool_timeout=0',
                    },
                },
            }
            const prisma = new PrismaClient(prismaConfig)
            Singleton.instances.set(this, new this(prisma))
        }
        return Singleton.instances.get(this) as T
    }
    
}
