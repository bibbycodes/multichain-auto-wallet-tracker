import { MoralisService } from "../../../src/lib/services/apis/moralis/moralis-service"
import { ChainsMap } from "../../../src/shared/chains"



export async function testGetTokenWithMarketCap() {
  const moralisService = new MoralisService()
  await moralisService.fetchTokenWithMarketCap('0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', ChainsMap.ethereum)
  // await moralisService.fetchTokenWithMarketCap('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', ChainsMap.solana)
}

testGetTokenWithMarketCap()
