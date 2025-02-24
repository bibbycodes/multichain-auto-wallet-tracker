import {Exchange, ExchangeToken} from "../types";
import {ChainId} from "../../../shared/chains";
import {ethers} from "ethers"; // Import ethers.js
import {uniV2Pair} from "./abi/uni-v2-pair";
import {erc20} from "../../../evm/abis/erc20";
import {PancakeSwapEvent} from "./swap-event-decoder/types";
import {Swap} from "../../swap";
import {BigMath} from "../../../utils/math";
import {Log} from "ethers/lib.esm";
import {UniLikeSwapLogDecoder} from "./swap-event-decoder/uni-like-swap-log-decoder";
import {getRandomQuicknodeEndpoint} from "../../../shared/env";

export class UniLikeV2 implements Exchange {
  private provider: ethers.Provider;
  private abi = uniV2Pair;
  private decoder: UniLikeSwapLogDecoder;

  constructor(private chainId: ChainId) {
    const connectionConfig = getRandomQuicknodeEndpoint(chainId);  // Get a random QuickNode endpoint
    if (!connectionConfig) {
      throw new Error('No connection string found');
    }
    this.provider = new ethers.JsonRpcProvider(connectionConfig.https);  // Use ethers provider for the connection
    this.decoder = new UniLikeSwapLogDecoder(connectionConfig.https);  // Initialize the log decoder
  }

  // Get the token pair details for the given pair address
  async getTokenPair(pairAddress: string): Promise<{ tokenA: ExchangeToken; tokenB: ExchangeToken }> {
    console.log({pairAddress})
    try {
      const pairContract = new ethers.Contract(pairAddress, this.abi, this.provider);
      // Get the addresses of the two tokens in the pair
      const tokenAAddress = await pairContract.token0();
      const tokenBAddress = await pairContract.token1();

      // Fetch token details for both tokens
      const tokenA = await this.getTokenDetails(tokenAAddress);
      const tokenB = await this.getTokenDetails(tokenBAddress);

      return {tokenA, tokenB};
    } catch (error) {
      console.error('Error fetching token pair:', error);
      throw new Error('Failed to fetch token pair');
    }
  }

  // Get the liquidity of the pair (not implemented yet)
  async getLiquidity(pairAddress: string): Promise<bigint> {
    throw new Error("Method not implemented.");
  }

  // Get the reserves of the pair (not implemented yet)
  async getReserves(pairAddress: string): Promise<{ tokenA: bigint; tokenB: bigint }> {
    throw new Error("Method not implemented.");
  }

  // Get the market cap of the token (not implemented yet)
  async getMarketCap(tokenAddress: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  // Get the price of the token (not implemented yet)
  async getPrice(tokenAddress: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async getSwap(rawSwap: PancakeSwapEvent): Promise<Swap> {
    console.log({rawSwap})
    const token0Delta = rawSwap.amount0In - rawSwap.amount0Out;
    const token1Delta = rawSwap.amount1In - rawSwap.amount1Out;
    const tokenDetails = await this.getTokenPair(rawSwap.pairAddress);

    // If token0Delta is positive, token0 is being swapped in
    const inputToken = token0Delta > 0 ? tokenDetails.tokenA : tokenDetails.tokenB;
    const outputToken = token0Delta > 0 ? tokenDetails.tokenB : tokenDetails.tokenA;
    const amountIn = token0Delta > 0 ? token0Delta : token1Delta;
    const amountOut = token0Delta > 0 ? -token1Delta : -token0Delta;

    return {
      sender: rawSwap.sender,
      amountIn: BigMath.abs(BigInt(amountIn)),
      amountOut: BigMath.abs(BigInt(amountOut)),
      tokenIn: inputToken,
      tokenOut: outputToken,
      signer: rawSwap.sender,
      pairAddress: rawSwap.pairAddress,
      hash: rawSwap.hash
    };
  }
  
  async getSwapFromLog(log: Log): Promise<Swap> {
    const decoded = this.decoder.decodeSwapEvent(log);
    return this.getSwap(decoded);
  }
  
  isLogForExchange(log: Log): boolean {
    return this.decoder.isLogForExchange(log);
  }

  // Fetch the details of the token (symbol, decimals, etc.)
  async getTokenDetails(tokenAddress: string): Promise<ExchangeToken> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, erc20, this.provider);

      // Get the token symbol and decimals
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();

      return {
        address: tokenAddress,
        symbol,
        decimals: decimals,
        chainId: this.chainId
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      throw new Error('Failed to fetch token details');
    }
  }
}
