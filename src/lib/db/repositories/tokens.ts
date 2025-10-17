import { Prisma, PrismaClient, Token, TokenDataSource } from "@prisma/client";
import { AutoTrackerToken } from "../../models/token";


export class TokensRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createToken(token: Prisma.TokenCreateInput): Promise<Token> {
        return this.prisma.token.create({
            data: token
        });
    }

    async upsertTokenFromTokenData(token: AutoTrackerToken) {
        await this.prisma.token.upsert({
            where: { address_chain_id: { address: token.address, chain_id: token.chainId } },
            update: token.toDb(),
            create: token.toDb(),
        });
    }

    async createManyTokens(tokens: Prisma.TokenCreateManyInput[]) {
        return this.prisma.token.createMany({
            data: tokens
        });
    }

    async findOneByAddress(address: string) {
        return this.prisma.token.findUnique({
            where: {
                address
            }
        });
    }

    async findOneByAddressAndChainId(address: string, chainId: string) {
        return this.prisma.token.findUnique({
            where: {
                address_chain_id: { address, chain_id: chainId }
            }
        });
    }

    async findOneByTokenAddress(address: string): Promise<Token | null> {
        return this.prisma.token.findUnique({
            where: {
                address
            }
        });
    }

    async findManyByChainId(chainId: string) {
        return this.prisma.token.findMany({
            where: {
                chain_id: chainId
            }
        });
    }

    async findManyByAddressesAndChainId(addresses: string[], chainId: string) {
        return this.prisma.token.findMany({
            where: {
                address: { in: addresses },
                chain_id: chainId
            }
        });
    }

    async deleteToken(address: string, chainId: string) {
        return this.prisma.token.delete({
            where: {
                address_chain_id: { address, chain_id: chainId }
            }
        });
    }

    toModel(token: Token): AutoTrackerToken {
        return AutoTrackerToken.fromDb(token)
    }
}

