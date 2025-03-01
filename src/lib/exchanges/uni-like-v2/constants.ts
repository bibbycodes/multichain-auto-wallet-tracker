import {deriveTopic, deriveTopicSha3} from "../../services/apis/moralis/moralis-utils";
import {uniV2Pair} from "./abi/uni-v2-pair";
import {ChainId, ChainToId} from "../../../shared/chains";

export const pancakeSwapSha3Topics = {
  swap: deriveTopicSha3(uniV2Pair, 'Swap') as string
}

export const pancakeSwapTopics = {
  swap: deriveTopic(uniV2Pair, 'Swap')
}

export const supportedChainIds = [
  ChainToId.bsc, 
  ChainToId.base
] as ChainId[];
