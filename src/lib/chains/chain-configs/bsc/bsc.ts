import { ChainsMap } from "../../../../shared/chains";
import { ChainConfig } from "../../types";
import { KNOWN_ADDRESSES_MAP, KNOWN_LIQUIDITY_ADDRESSES } from "./known-addresses";

export const BSC_CONFIG: ChainConfig = {
  chainId: ChainsMap.bsc,
  chainName: 'Binance Smart Chain',
  nativeToken: 'BNB',
  wrappedNativeTokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  usdcAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  usdtAddress: '0x55d398326f99059ff775485246999027b3197955',
  burnAddresses: ['0x000000000000000000000000000000000000dead'],
  nullAddresses: ['0x0000000000000000000000000000000000000000'],
  knownAddresses: new Map(Object.entries(KNOWN_ADDRESSES_MAP)),
  knownLiquidityAddresses: new Map(Object.entries(KNOWN_LIQUIDITY_ADDRESSES)),
}