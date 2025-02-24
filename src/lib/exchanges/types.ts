import {Swap} from "../swap";
import {Log} from "ethers/lib.esm";
import {ChainId} from "../../shared/chains";

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
  isLogForExchange(log: Log, chainId: ChainId): boolean;
}

export interface ExchangeToken {
  symbol: string;
  decimals: number;
  address: string;
  chainId: number
}

export interface LiquidityPool {
  tokenA: ExchangeToken;
  tokenB: ExchangeToken;
  pairAddress: string;
  liquidity: bigint;
  marketCap: bigint;
}
