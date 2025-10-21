import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSecurityAndLaunchpad, GmGnTokenSocials, GmGnTopHolder } from "python-proxy-scraper-client"
import { TokenDataWithMarketCapAndRawData } from '../../../models/token/types'

export interface GmGnTokenDataRawData {
  tokenInfo: GmGnMultiWindowTokenInfo
  socials: GmGnTokenSocials
  holders: GmGnTokenHolder[]
  tokenSecurityAndLaunchpad: GmGnTokenSecurityAndLaunchpad
}

export type GmGnTokenDataWithMarketCap = TokenDataWithMarketCapAndRawData<Partial<GmGnTokenDataRawData>>

