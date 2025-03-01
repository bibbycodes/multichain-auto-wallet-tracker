import { PrismaClient } from '@prisma/client'
import { Token } from '../../../shared/types'

const prisma = new PrismaClient()

export class TokenRepository {
  async upsertToken(token: Omit<Token, 'id'> | Token): Promise<Token | null> {
    try {
      const existingToken = await prisma.token.findFirst({
        where: {
          address: token.address,
          chainType: token.chainType,
        },
      })

      let upsertedToken: Token
      if (existingToken) {
        upsertedToken = (await prisma.token.update({
          where: { id: existingToken.id },
          data: {
            name: token.name,
            symbol: token.symbol,
          },
        })) as Token
        console.log(`Updated token: ${token.name}`)
      } else {
        upsertedToken = (await prisma.token.create({
          data: {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            chainType: token.chainType,
            createdAt: new Date(),
          },
        })) as Token
        console.log(`Created new token: ${token.name}`)
      }

      return upsertedToken
    } catch (error) {
      console.error('Error upserting token:', error)
      return null
    }
  }
}
