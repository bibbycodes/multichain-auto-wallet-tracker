import {BirdEyeService} from "../apis/birdeye/birdeye-service";
import {MoralisService} from "../apis/moralis/moralis-service";
import {getActiveEVMChains} from "../../../shared/chains";

export class WalletAnalyzerService {
  private birdEyeService: BirdEyeService
  private moralisService: MoralisService
  constructor() {
    this.birdEyeService = new BirdEyeService()
    this.moralisService = new MoralisService()
  }
  
  async getWalletPortfolioValue(address: string): Promise<number | null> {
    try {
      const walletValue =
        await this.birdEyeService.getMultiChainPortfolioValueUsd(
          address,
          getActiveEVMChains()
        )
      if (walletValue == null) {
        console.warn('Could not fetch wallet value')
        return null
      }
      return walletValue
    } catch (error) {
      console.error('Error fetching wallet value:', error)
      return null
    }
  }

  async isWhale(address: string): Promise<boolean> {
    try {
      const walletValue =
        await this.birdEyeService.getMultiChainPortfolioValueUsd(
          address,
          // isEVM ? getActiveEVMChains() : ['solana']
          getActiveEVMChains()
        )
      if (walletValue == null) {
        console.warn('Could not fetch wallet value')
        return false
      }
      return walletValue >= 100000
    } catch (error) {
      console.error('Error checking if wallet is a whale:', error)
      return false
    }
  }
}
