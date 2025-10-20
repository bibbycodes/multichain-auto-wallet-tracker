import { RawTokenDataCache } from "../../../src/lib/services/raw-data/raw-data"
import { TokenService } from "../../../src/lib/services/token-service/token-service"

export const testGetRawData = async (tokenAddress: string) => {
    const tokenService = TokenService.getInstance()
    const token = await tokenService.getOrCreateTokenWithAddress(tokenAddress)
    const rawData = new RawTokenDataCache(token.token.address, token.token.chainId, token.rawData)
    await rawData.collect()
    return rawData
}

const tokenAddress = '0x0A43fC31a73013089DF59194872Ecae4cAe14444'
testGetRawData(tokenAddress).then(rawData => {
    console.log(rawData.toObject())
})
