import {Exchanges} from "../exchanges";
import {Exchange} from "../types";
import {UniLikeV2} from "../uni-like-v2/uni-like-v2";
import {Log} from "ethers/lib.esm";
import {ChainId, ChainToId, getActiveEVMChains} from "../../../shared/chains";

export class ExchangeFactory {
  constructor() {
  }
  
  getUniv2LikeAcrossAllChains():  { [key: number]: Record<Exchanges, Exchange> } {
    const allChains = getActiveEVMChains();
    return allChains.reduce((acc: any, chain) => {
      const chainId = ChainToId[chain];
      acc[chainId] = {[Exchanges.UniV2Like]: new UniLikeV2(chainId)};
      return acc
    }, {} as { [key: number]: Record<Exchanges, Exchange> });
  }
  
  getExchangeMap(): { [key: number]: Record<Exchanges, Exchange> } {
    const uniV2AcrossAllChains = this.getUniv2LikeAcrossAllChains();
    return {
      ...uniV2AcrossAllChains,
      [ChainToId.bsc]: {
        [Exchanges.UniV2Like]: new UniLikeV2(ChainToId.bsc)
      },
      [ChainToId.base]: {
        [Exchanges.UniV2Like]: new UniLikeV2(ChainToId.base)
      },
      [ChainToId.ethereum]: {
        [Exchanges.UniV2Like]: new UniLikeV2(ChainToId.ethereum)
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
      if (exchange.isLogForExchange(log, chainId)) {
        return exchange;
      }
    }
    throw new Error('No exchange found for topics');
  }
}
