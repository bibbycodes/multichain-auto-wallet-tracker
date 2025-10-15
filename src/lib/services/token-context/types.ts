import { AutoTrackerToken } from "../../models/token"
import { TokenPriceDetails, TokenSecurity } from "../../models/token/types"
import { RawDataInput } from "../raw-data/types"
import { TokenDistributionContextData } from "./token-distribution/types"


export interface BaseContextData {
    tokenDistribution: TokenDistributionContextData
    tokenSecurity: TokenSecurity
    token: AutoTrackerToken
    rawData: RawDataInput
    priceDetails: TokenPriceDetails
}