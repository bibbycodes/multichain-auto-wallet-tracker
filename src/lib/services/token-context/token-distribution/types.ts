
import { SocialMedia } from "../../../models/socials/types"
import { AutoTrackerToken } from "../../../models/token"

export interface TokenHolder {
    address: string
    amount: number
    percentage: number
    dollarValue: number
    isKOL: boolean
    isWhale: boolean
    significantHolderIn: AutoTrackerToken[]
    isPool: boolean
    isCreator: boolean
    socials?: SocialMedia
}

export interface TokenDistributionStats {
    top10Percentage: number
    top20Percentage: number
    creatorTokenPercentage: number
    numberOfHolders: number
}

export interface TokenDistributionContextData {
    tokenDistributionStats: TokenDistributionStats
    tokenHolders: TokenHolder[]
}