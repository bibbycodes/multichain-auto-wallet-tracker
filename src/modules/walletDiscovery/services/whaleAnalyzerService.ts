import {BirdEyeService, MultiChainPortfolioResponse} from '@shared/services/birdEyeService'
import { getActiveEVMChains } from '@shared/chains'

export class WhaleAnalyzerService {
  private birdEyeService: BirdEyeService

  constructor() {
    this.birdEyeService = new BirdEyeService()
  }
  
  // async getBirdeyeMultichainPortfolioValueUsd(address: string): Promise<MultiChainPortfolioResponse> {
  //   return this.birdEyeService.getMultiChainPortfolioValueUsd(
  //     address,
  //     getActiveEVMChains()
  //   )
  // }

  async isWhale(address: string): Promise<boolean> {
    try {
      // todo: this is a bit ugly innit?
      const isEVM = address.startsWith('0x')
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
