import { AutoTrackerToken } from "../../models/token"
import { TokenPriceDetails, TokenSecurity } from "../../models/token/types"
import { RawDataData } from "../raw-data/types"
import { TokenDistributionContextData } from "./token-distribution/types"


export interface BaseContextData {
    tokenDistribution: TokenDistributionContextData
    tokenSecurity: TokenSecurity
    token: AutoTrackerToken
    rawData: RawDataData
    priceDetails: TokenPriceDetails
}