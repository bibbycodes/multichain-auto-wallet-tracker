import { Prisma, PrismaClient } from "@prisma/client";

export class ChainsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createChain(chain: Prisma.ChainCreateInput) {
        return this.prisma.chain.create({ data: chain })
    }

    async findAll() {
        return this.prisma.chain.findMany()
    }

    async findOneById(id: string) {
        return this.prisma.chain.findUnique({ where: { id } })
    }

    async createOne(chain: Prisma.ChainCreateInput) {
        return this.prisma.chain.create({ data: chain })
    }

    async createMany(chains: Prisma.ChainCreateManyInput[]) {
        return this.prisma.chain.createMany({ data: chains })
    }

    async findOrCreate(chain: Prisma.ChainCreateInput) {
        return this.prisma.chain.upsert({ where: { id: chain.id }, update: chain, create: chain })
    }

    async findMany() {
        return this.prisma.chain.findMany()
    }
}
    
    