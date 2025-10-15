import { TokenDataWithMarketCapAndRawData } from '../../../models/token/types'
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview, MarketsData, Markets  Response } from './client/types'

export interface BirdEyeTokenDataRawData {
  tokenOverview: BirdTokenEyeOverview
  tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity
  markets: MarketsData
}

export type BirdEyeTokenDataWithMarketCap = TokenDataWithMarketCapAndRawData<BirdEyeTokenDataRawData>   