import {ChainsMap} from "../../shared/chains";

export class BscChain {
  public chainId = ChainsMap.bsc;
  public name = 'Binance Smart Chain';
  public nativeToken = 'BNB';
  public wrappedNativeTokenAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  public usdcAddress = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
  public usdtAddress = '0x55d398326f99059ff775485246999027b3197955';
  
  isNativeToken(tokenAddress: string): boolean {
    return tokenAddress === this.wrappedNativeTokenAddress;
  }
  
  isQuoteToken(tokenAddress: string): boolean {
    return tokenAddress === this.usdcAddress || tokenAddress === this.usdtAddress || this.isNativeToken(tokenAddress);
  }
}
