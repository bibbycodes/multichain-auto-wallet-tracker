import { ChainId } from "../../../shared/chains"
import { Database } from "../../db/database"
import { AutoTrackerToken } from "../../models/token"
import { BirdEyeFetcherService } from "../apis/birdeye/birdeye-service"
import { GmGnService } from "../apis/gmgn/gmgn-service"
import { MoralisService } from "../apis/moralis/moralis-service"
import { Singleton } from "../util/singleton"

export class TokenService extends Singleton {
    constructor(
        private readonly db: Database = Database.getInstance(),
        private readonly gmgnService: GmGnService = GmGnService.getInstance(),
        private readonly moralisService: MoralisService = MoralisService.getInstance(),
        private readonly birdeyeService: BirdEyeFetcherService = BirdEyeFetcherService.getInstance(),
    ) {
        super()
    }

    async getOrCreateTokenWithAddressAndChainId(tokenAddress: string, chainId: ChainId): Promise<{token: AutoTrackerToken, rawData: any}> {
        const token = await this.db.tokens.findOneByAddressAndChainId(tokenAddress, chainId)
        if (token) {
            return {token: this.db.tokens.toModel(token), rawData: null}
        }
        const tokenData = await this.birdeyeService.fetchTokenWithMarketCap(tokenAddress, chainId)
        const autoTrackerToken = AutoTrackerToken.fromTokenDataWithMarketCap(tokenData.token)
        await this.db.tokens.createToken(autoTrackerToken.toDb())
        return {token: autoTrackerToken, rawData: tokenData.rawData}
    }

    async getOrCreateTokenWithAddress(tokenAddress: string): Promise<{token: AutoTrackerToken, rawData: any}> {
        const token = await this.db.tokens.findOneByTokenAddress(tokenAddress)
        if (token) {
            return {token: this.db.tokens.toModel(token), rawData: null}
        }
        const tokenData = await this.birdeyeService.fetchTokenDataWithMarketCapFromAddress(tokenAddress)
        const autoTrackerToken = AutoTrackerToken.fromTokenDataWithMarketCap(tokenData.token)
        await this.db.tokens.createToken(autoTrackerToken.toDb())
        return {token: autoTrackerToken, rawData: tokenData.rawData}
    }

    async getOrCreateManyTokens(tokenAddresses: string[], chainId: ChainId): Promise<{token: AutoTrackerToken, rawData: any}[]> {
        const tokens = await this.db.tokens.findManyByAddressesAndChainId(tokenAddresses, chainId)
        const tokensToCreate = tokenAddresses.filter(tokenAddress => !tokens.find(t => t.address === tokenAddress))
        const createdTokens = await Promise.all(tokensToCreate.map(tokenAddress => this.getOrCreateTokenWithAddressAndChainId(tokenAddress, chainId)))
        return [...tokens.map(t => ({token: this.db.tokens.toModel(t), rawData: null})), ...createdTokens]
    }
}
