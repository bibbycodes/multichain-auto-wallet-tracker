import { Prisma, PrismaClient, Token, TokenDataSource } from "@prisma/client";
import { AutoTrackerToken } from "../../models/token";
import { AutoTrackerTokenDataSource } from "../../models/token/types";

export class TokensRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async createToken(token: Prisma.TokenCreateInput) {
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

    dataSourceToEnum(dataSource: TokenDataSource): AutoTrackerTokenDataSource {
        switch (dataSource) {
            case TokenDataSource.BIRDEYE:
                return AutoTrackerTokenDataSource.BIRDEYE;
            case TokenDataSource.GMGN:
                return AutoTrackerTokenDataSource.GMGN;
            case TokenDataSource.MORALIS:
                return AutoTrackerTokenDataSource.MORALIS;
        }
    }

    toModel(token: Token): AutoTrackerToken {
        return AutoTrackerToken.fromDb(token)
    }
}

