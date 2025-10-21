import { ChainBaseService } from "../../src/lib/services/apis/chain-base/chain-base-service"
import { GmGnService } from "../../src/lib/services/apis/gmgn/gmgn-service"
import { ChainsMap } from "../../src/shared/chains"

export const getTopHolders = async (tokenAddress: string) => {
    const chainBaseService = ChainBaseService.getInstance()
    const gmgnService = GmGnService.getInstance()
    const topHolders = await chainBaseService.fetchTopHoldersForToken(tokenAddress, ChainsMap.bsc)
    const gmgnTopHolders = await gmgnService.getHolders(tokenAddress, ChainsMap.bsc)
    return {
        chainBase: topHolders[0],
        gmgn: gmgnTopHolders[0],
    }
}

getTopHolders('0x10326d1fd404967b617368ccad3a33b43b5c4444').then(console.log)