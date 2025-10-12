import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from "python-proxy-scraper-client"
import { TokenDataWithMarketCapAndRawData } from '../../../models/token/types'

export interface GmGnTokenDataRawData {
  tokenInfo: GmGnMultiWindowTokenInfo
  socials: GmGnTokenSocials
}

export type GmGnTokenDataWithMarketCap = TokenDataWithMarketCapAndRawData<GmGnTokenDataRawData>

