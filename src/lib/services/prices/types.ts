export interface PriceAndMarketCap {
    price: number;
    marketCap: number;
}

export interface PricesAndMarketCapsMap {
    [tokenAddress: string]: PriceAndMarketCap;
}