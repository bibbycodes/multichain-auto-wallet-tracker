import { BirdEyeTokenDataRawData } from "../apis/birdeye/types"
import { ChainBaseTokenDataRawData } from "../apis/chain-base/types"
import { GmGnTokenDataRawData } from "../apis/gmgn/types"
import { MoralisTokenDataRawData } from "../apis/moralis/types"

/**
 * Raw data that can be passed into or retrieved from RawData.
 * Each data source field is optional and can contain partial data
 * since data is fetched and cached lazily.
 */
export interface RawDataInput {
    birdeye?: Partial<BirdEyeTokenDataRawData>
    gmgn?: Partial<GmGnTokenDataRawData>
    moralis?: Partial<MoralisTokenDataRawData>
    chainBase?: Partial<ChainBaseTokenDataRawData>
}