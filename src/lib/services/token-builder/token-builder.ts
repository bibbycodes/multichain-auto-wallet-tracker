import { ChainId } from "../../../shared/chains";
import { Database } from "../../db/database";
import { AutoTrackerToken } from "../../models/token";
import { TokenDataWithMarketCapAndRawData } from "../../models/token/types";
import { BirdeyeMapper } from "../apis/birdeye/birdeye-mapper";
import { BirdEyeFetcherService } from "../apis/birdeye/birdeye-service";
import { GmGnMapper } from "../apis/gmgn/gmgn-mapper";
import { RawTokenDataCache } from "../raw-data/raw-data";
import { RawDataData } from "../raw-data/types";

export class AutoTrackerTokenBuilder {
    constructor(
        private readonly tokenAddress: string,
        public chainId?: ChainId,
        private rawData?: RawTokenDataCache,
        private readonly birdeyeService: BirdEyeFetcherService = BirdEyeFetcherService.getInstance(),
        private db: Database = Database.getInstance(),
    ) {
    }

    async collect() {
        await this.initialiseRawData()
        if (!this.rawData) {
            throw new Error('Raw data is not set')
        }
        
        const data = await Promise.all([
            this.rawData.birdeye.getTokenOverview(),
            this.rawData.birdeye.getTokenSecurity(),
            this.rawData.birdeye.getMarkets(),
            this.rawData.gmgn.getTokenInfo(),
            this.rawData.gmgn.getGmgnSocials(),
        ])

        return {
            birdeyeTokenOverview: data[0],
            birdeyeTokenSecurity: data[1],
            birdeyeMarkets: data[2],
            gmgnTokenInfo: data[3],
            gmgnTokenSocials: data[4],
        }
    }

    async getGmgnAutoTrackerToken(): Promise<AutoTrackerToken | null> {
        if (!this.chainId) {
            throw new Error('Chain id is not set')
        }
        const {
            gmgnTokenInfo,
            gmgnTokenSocials,
        } = await this.collect()

        if (!gmgnTokenInfo || !gmgnTokenSocials) {
            return null
        }

        return GmGnMapper.mapGmGnTokenToAutoTrackerToken(gmgnTokenInfo, gmgnTokenSocials, this.chainId)
    }

    async getBirdeyeAutoTrackerToken(): Promise<AutoTrackerToken | null> {
        if (!this.chainId) {
            throw new Error('Chain id is not set')
        }
        const {
            birdeyeTokenOverview,
            birdeyeTokenSecurity,
            birdeyeMarkets,
        } = await this.collect()
        if (!birdeyeTokenOverview || !birdeyeTokenSecurity || !birdeyeMarkets || !birdeyeMarkets.items[0]) {
            return null
        }
        const pairAddress = birdeyeMarkets.items[0].address
        return BirdeyeMapper.mapBirdeyeTokenToAutoTrackerToken(birdeyeTokenOverview, birdeyeTokenSecurity, pairAddress, this.chainId)
    }

    async getToken(): Promise<AutoTrackerToken> {
        await this.getInitialData()
        const gmgnToken = await this.getGmgnAutoTrackerToken()
        const birdeyeToken = await this.getBirdeyeAutoTrackerToken()
        if (!gmgnToken && !birdeyeToken) {
            throw new Error('Could not fetch tokens')
        }
        return AutoTrackerToken.mergeMany([gmgnToken, birdeyeToken].filter(token => token !== null))
    }

    async initialiseRawData(rawDataData?: RawDataData): Promise<RawTokenDataCache> {
        if (!this.chainId) {
            throw new Error('Chain id is not set')
        }
        
        if (!this.rawData) {
            this.rawData = new RawTokenDataCache(this.tokenAddress, this.chainId)
        }

        if (rawDataData) {
            this.rawData.updateData(rawDataData)
        }
        return this.rawData
    }

    async getDbToken(): Promise<AutoTrackerToken | null> {
        const dbToken =  await this.db.tokens.findOneByTokenAddress(this.tokenAddress)
        if (!dbToken) {
            return null
        }
        return this.db.tokens.toModel(dbToken)
    }

    async getOrCreate(): Promise<AutoTrackerToken> {
        const token = await this.getDbToken()
        if (token && !token.hasMissingRequiredFields()) {
            await this.setChainIdAndInitialiseRawData(token.chainId)
            return token
        }

        if (!token?.chainId) {
            const initialData = await this.getInitialData()
            await this.setChainIdAndInitialiseRawData(initialData.token.chainId, initialData.rawData)
        }

        await this.collect()
        
        const  [
            gmgnToken,
            birdeyeToken,
        ] = await Promise.all([
            this.getGmgnAutoTrackerToken(),
            this.getBirdeyeAutoTrackerToken(),
        ])
        
        const mergedToken = AutoTrackerToken.mergeMany([gmgnToken, birdeyeToken, token].filter(token => token !== null))
        AutoTrackerToken.validate(mergedToken)
        await this.db.tokens.upsertTokenFromTokenData(mergedToken)
        return mergedToken
    }

    async getInitialData(): Promise<TokenDataWithMarketCapAndRawData<RawDataData>> {
        if (!this.chainId) {
            const data = await this.birdeyeService.fetchTokenDataWithMarketCapFromAddress(this.tokenAddress)
            if (!data.token.chainId) {
                throw new Error('Chain id not returned')
            }
            await this.setChainIdAndInitialiseRawData(data.token.chainId, data.rawData)
            return data
        } else {
            const data = await this.birdeyeService.fetchTokenWithMarketCap(this.tokenAddress, this.chainId)
            await this.setChainIdAndInitialiseRawData(data.token.chainId, data.rawData)
            return data
        }
    }

    async getRawData(): Promise<RawTokenDataCache> {
        if (!this.chainId) {
            throw new Error('Chain id is not set')
        }
        if (!this.rawData) {
            this.rawData = await this.initialiseRawData()
        }
        return this.rawData
    }

    setChainId(chainId: ChainId): void {
        this.chainId = chainId
    }

    async setChainIdAndInitialiseRawData(chainId: ChainId, rawDataData?: RawDataData): Promise<RawTokenDataCache> {
        this.setChainId(chainId)
        return await this.initialiseRawData(rawDataData)
    }
}