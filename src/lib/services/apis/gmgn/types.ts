import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSocials, GmGnTopHolder } from "python-proxy-scraper-client"
import { TokenDataWithMarketCapAndRawData } from '../../../models/token/types'

export interface GmGnTokenDataRawData {
  tokenInfo: GmGnMultiWindowTokenInfo
  socials: GmGnTokenSocials
  holders: GmGnTokenHolder[]
}

export type GmGnTokenDataWithMarketCap = TokenDataWithMarketCapAndRawData<GmGnTokenDataRawData>

