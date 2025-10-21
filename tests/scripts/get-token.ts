import { BirdEyeFetcherService } from "../../src/lib/services/apis/birdeye/birdeye-service"
import { GmGnService } from "../../src/lib/services/apis/gmgn/gmgn-service"
import { MoralisService } from "../../src/lib/services/apis/moralis/moralis-service"
import { ChainId, ChainsMap } from "../../src/shared/chains"

const solanaTokenAddress = 'GHE4fYyf3wwZdYrXk2bBQ7mBoCEGDdHpDKtSHv9Zpump'
const solanaChainId = ChainsMap.solana
const tokenAddress = '0x10326d1fD404967B617368CcAD3A33B43b5C4444'
const chainId = ChainsMap.bsc
export const getToken = async (tokenAddress: string, chainId: ChainId) => {
    const moralisService = MoralisService.getInstance()
    const birdeyeService = BirdEyeFetcherService.getInstance()
    const gmgnService = GmGnService.getInstance()
    
    const [moralisResult, birdeyeResult, gmgnResult] = await Promise.allSettled([
        moralisService.fetchTokenWithMarketCap(tokenAddress, chainId),
        birdeyeService.fetchTokenWithMarketCap(tokenAddress, chainId),
        gmgnService.fetchTokenWithMarketCap(tokenAddress, chainId)
    ])
    
    const token = {
        moralis: moralisResult.status === 'fulfilled' ? moralisResult.value : { error: moralisResult.reason?.message },
        birdeye: birdeyeResult.status === 'fulfilled' ? birdeyeResult.value : { error: birdeyeResult.reason?.message },
        gmgn: gmgnResult.status === 'fulfilled' ? gmgnResult.value : { error: gmgnResult.reason?.message }
    }
    
    console.log(JSON.stringify(token, null, 2))
}

getToken(tokenAddress, chainId)