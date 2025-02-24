import {ExchangeToken} from "./exchanges/types";

export interface Swap {
  sender: string;
  amountIn: bigint;
  amountOut: bigint;
  tokenIn: ExchangeToken;
  tokenOut: ExchangeToken;
  signer: string;
  pairAddress: string;
  hash: string;
}
