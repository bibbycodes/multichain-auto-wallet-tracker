import {Exchanges} from "../exchanges";
import {Exchange} from "../types";
import {UniLikeV2} from "../uni-like-v2/uni-like-v2";
import {Log} from "ethers/lib.esm";
import {ChainId, ChainsMap, getActiveEVMChains} from "../../../shared/chains";

export class ExchangeFactory {
  constructor() {
  }
  
  getUniv2LikeAcrossAllChains():  { [key: number]: Record<Exchanges, Exchange> } {
    const allChains = getActiveEVMChains();
    return allChains.reduce((acc: any, chain) => {
      const chainId = ChainsMap[chain];
      acc[chainId] = {[Exchanges.UniV2Like]: new UniLikeV2(chainId)};
      return acc
    }, {} as { [key: number]: Record<Exchanges, Exchange> });
  }
  
  getExchangeMap(): { [key: string]: Record<Exchanges, Exchange> } {
    const uniV2AcrossAllChains = this.getUniv2LikeAcrossAllChains();
    return {
      ...uniV2AcrossAllChains,
      [ChainsMap.bsc]: {
        [Exchanges.UniV2Like]: new UniLikeV2(ChainsMap.bsc)
      },
      [ChainsMap.base]: {
        [Exchanges.UniV2Like]: new UniLikeV2(ChainsMap.base)
      },
      [ChainsMap.ethereum]: {
        [Exchanges.UniV2Like]: new UniLikeV2(ChainsMap.ethereum)
      },
    }
  }

  async getExchangeByLog(log: Log, chainId: ChainId): Promise<Exchange> {
    const allExchanges = this.getExchangeMap();
    const exchangesForChain = allExchanges[chainId];
    
    if (!exchangesForChain) {
      throw new Error('No exchanges found for chain');
    }
    
    for (const exchange of Object.values(exchangesForChain)) {
      if (exchange.matchesTopic(log, chainId)) {
        return exchange;
      }
    }
    throw new Error('No exchange found for topics');
  }
}
