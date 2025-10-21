import { BirdEyeFetcherService } from "../../../src/lib/services/apis/birdeye/birdeye-service"
import { ChainsMap } from "../../../src/shared/chains"


export async function fetchTokenWithMarketCap() {
    const birdeyeService = new BirdEyeFetcherService()
    // const tokenWithMarketCap = await birdeyeService.fetchTokenWithMarketCap('0xf94e7d0710709388bCe3161C32B4eEA56d3f91CC', ChainsMap.ethereum)
    const tokenWithMarketCap2 = await birdeyeService.fetchTokenWithMarketCap('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', ChainsMap.solana)
    // console.log(tokenWithMarketCap)
    console.log(tokenWithMarketCap2)
}   

fetchTokenWithMarketCap()