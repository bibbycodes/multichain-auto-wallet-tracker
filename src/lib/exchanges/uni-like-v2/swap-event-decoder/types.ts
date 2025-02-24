export interface PancakeSwapEvent {
  sender: string;
  amount0In: bigint;
  amount1In: bigint;
  amount0Out: bigint;
  amount1Out: bigint;
  to: string;
  pairAddress: string;
  hash: string;
  timestamp: Date
}
