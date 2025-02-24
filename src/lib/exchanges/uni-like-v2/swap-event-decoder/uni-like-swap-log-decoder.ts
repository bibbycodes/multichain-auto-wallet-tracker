import Web3 from "web3";
import {Log} from "ethers/lib.esm";
import {PancakeSwapEvent} from "./types";
import {swapEventAbi} from "../abi/swap-event-abi";
import {pancakeSwapSha3Topics} from "../constants";

export class UniLikeSwapLogDecoder {
  private web3: Web3;

  constructor(web3Provider: string) {
    this.web3 = new Web3(web3Provider);
  }

  public decodeSwapEvent(log: Log): PancakeSwapEvent {
    const decoded = this.web3.eth.abi.decodeLog(
      swapEventAbi.inputs,
      log.data,
      log.topics as string[]
    );
    
    return {
      sender: decoded['sender'] as string,
      amount0In: BigInt(decoded['amount0In'] as string),
      amount1In: BigInt(decoded['amount1In'] as string),
      amount0Out: BigInt(decoded['amount0Out'] as string),
      amount1Out: BigInt(decoded['amount1Out'] as string),
      to: decoded['to'] as string,
      pairAddress: log.address,
      hash: log.transactionHash,
      timestamp: new Date()
    };
  }
  
  isLogForExchange(log: Log): boolean {
    const exchangeRelatedTopics = Object.values(pancakeSwapSha3Topics);
    return exchangeRelatedTopics.some(topic => log.topics.includes(topic));
  }

  // Helper to format amounts to human readable numbers
  public formatAmount(amount: bigint, decimals: number): string {
    const divisor = BigInt(10) ** BigInt(decimals);
    const beforeDecimal = amount / divisor;
    const afterDecimal = amount % divisor;

    // Pad the after decimal part with leading zeros if needed
    const afterDecimalStr = afterDecimal.toString().padStart(decimals, '0');

    // Trim trailing zeros after decimal
    const trimmedAfterDecimal = afterDecimalStr.replace(/0+$/, '');

    return trimmedAfterDecimal.length > 0
      ? `${beforeDecimal}.${trimmedAfterDecimal}`
      : beforeDecimal.toString();
  }
}
