import { PrismaClient } from '@prisma/client'
import { TokenRepository } from './tokenRepository'
import { TrendingToken } from '../types'

const prisma = new PrismaClient()
const tokenRepository = new TokenRepository()

export class TrendingTokenRepository {
  async upsertTrendingToken(
    trendingToken: Omit<TrendingToken, 'id'> | TrendingToken
  ): Promise<TrendingToken | null> {
    try {
      const token = await tokenRepository.upsertToken({
        address: trendingToken.address,
        name: trendingToken.name,
        symbol: trendingToken.symbol,
        chainType: trendingToken.chainType,
      })

      if (!token) {
        console.error(
          `Error upserting token for trending token: ${trendingToken.name}`
        )
        return null
      }

      const createdRecord = await prisma.trendingToken.create({
        data: {
          tokenId: token.id,
          trendingAt: new Date(),
        },
      })

      console.log(`Upserted trending token: ${trendingToken.name}`)
      return {
        ...token,
        trendingAt: createdRecord.trendingAt,
      }
    } catch (error) {
      console.error('Error upserting trending token:', error)
      return null
    }
  }
}
