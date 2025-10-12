import { TokenDataWithMarketCapAndRawData } from '../../../models/token/types'
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview, MarketsResponse } from './client/types'

export interface BirdEyeTokenDataRawData {
  tokenOverview: BirdTokenEyeOverview
  tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity
  marketsResponse: MarketsResponse
}

export type BirdEyeTokenDataWithMarketCap = TokenDataWithMarketCapAndRawData<BirdEyeTokenDataRawData>   