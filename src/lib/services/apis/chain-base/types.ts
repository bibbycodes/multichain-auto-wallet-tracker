export interface ChainBaseTopHolder  {
    amount: string
    original_amount: string
    usd_value: string
    wallet_address: string
  }
  

export interface ChainBaseTokenDataRawData {
    topHolders: ChainBaseTopHolder[]
}