import {Swap} from "../swap";
import {Log} from "ethers/lib.esm";
import {ChainId} from "../../shared/chains";
import {Univ2LikeSwapEvent} from "./uni-like-v2/swap-event-decoder/types";

export interface Exchange {
  getLiquidity(pairAddress: string): Promise<bigint>;
  getReserves(pairAddress: string): Promise<{
    tokenA: bigint;
    tokenB: bigint;
  }>;
  getTokenPair(pairAddress: string): Promise<{
    tokenA: ExchangeToken;
    tokenB: ExchangeToken;
  }>;
  getMarketCap(tokenAddress: string): Promise<number>;
  getPrice(tokenAddress: string): Promise<number>;
  getSwapFromLog(log: Log): Promise<Swap>;
  decodeLog(log: Log): Univ2LikeSwapEvent;
  matchesTopic(log: Log, chainId: ChainId): boolean;
}

export interface ExchangeToken {
  symbol: string;
  decimals: number;
  address: string;
  chainId: string
}

export interface LiquidityPool {
  tokenA: ExchangeToken;
  tokenB: ExchangeToken;
  pairAddress: string;
  liquidity: bigint;
  marketCap: bigint;
}
