import { RawTokenDataCache } from "../../../src/lib/services/raw-data/raw-data"
import { BaseContext } from "../../../src/lib/services/token-context/base-context"
import { TokenService } from "../../../src/lib/services/token-service/token-service"

export const getBaseContext = async (tokenAddress: string) => {
    const tokenService = TokenService.getInstance()
    const token = await tokenService.getOrCreateTokenWithAddress(tokenAddress)
    const rawData = new RawTokenDataCache(token.token, token.rawData)
    await rawData.collect()
    const baseContext = new BaseContext(token.token, rawData)
    return baseContext.toObject()
}

getBaseContext('0x0A43fC31a73013089DF59194872Ecae4cAe14444').then(console.log)