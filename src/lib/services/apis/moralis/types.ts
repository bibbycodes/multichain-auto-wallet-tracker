import { TokenDataWithMarketCapAndRawData } from "../../../models/token/types";

export interface CreateStreamParams {
  webhookUrl: string;
  description: string;
  tag: string;
  chains: string[];
  includeNativeTxs: boolean;
}

export interface MoralisEvmTokenPrice {
  tokenName:                 string;
  tokenSymbol:               string;
  tokenLogo:                 string;
  tokenDecimals:             string;
  nativePrice:               NativePrice;
  usdPrice:                  number;
  usdPriceFormatted:         string;
  exchangeName:              string;
  exchangeAddress:           string;
  tokenAddress:              string;
  priceLastChangedAtBlock:   string;
  blockTimestamp:            string;
  possibleSpam:              boolean;
  verifiedContract:          boolean;
  pairAddress:               string;
  pairTotalLiquidityUsd:     string;
  securityScore:             number;
  usdPrice24hr:              number;
  usdPrice24hrUsdChange:     number;
  usdPrice24hrPercentChange: number;
  "24hrPercentChange":       string;
}

export interface NativePrice {
  value:    string;
  decimals: number;
  name:     string;
  symbol:   string;
  address:  string;
}


export interface MoralisSolanaTokenPrice {
  tokenAddress: string;
  pairAddress: string;
  exchangeName: string;
  exchangeAddress: string;
  nativePrice: NativePrice;
  usdPrice: number;
  usdPrice24h: number;
  usdPrice24hrUsdChange: number;
  usdPrice24hrPercentChange: number;
  logo: string | null;
  name: string;
  symbol: string;
}

export interface MoralisSolanaTokenMetadata {
  mint:                 string;
  standard:             string;
  name:                 string;
  symbol:               string;
  logo:                 string;
  decimals:             string;
  metaplex:             Metaplex;
  fullyDilutedValue:    string;
  totalSupply:          string;
  totalSupplyFormatted: string;
  links:                Links;
  description:          string;
}

export interface Links {
  twitter: string;
  website: string;
  discord: string;
  reddit:  string;
  moralis: string;
}

export interface Metaplex {
  metadataUri:          string;
  masterEdition:        boolean;
  isMutable:            boolean;
  sellerFeeBasisPoints: number;
  updateAuthority:      string;
  primarySaleHappened:  number;
}

export interface MoralisEvmTokenMetaData {
  address:                 string;
  address_label:           null;
  name:                    string;
  symbol:                  string;
  decimals:                string;
  logo:                    string;
  logo_hash:               null;
  thumbnail:               string;
  total_supply:            string;
  total_supply_formatted:  string;
  fully_diluted_valuation: string;
  block_number:            string;
  validated:               number;
  created_at:              Date;
  possible_spam:           boolean;
  verified_contract:       boolean;
  categories:              string[];
  links:                   Links;
  security_score:          number;
  description:             string;
  circulating_supply:      string;
  market_cap:              string;
}

export interface Links {
  discord:   string;
  reddit:    string;
  telegram:  string;
  twitter:   string;
  website:   string;
  instagram: string;
  moralis:   string;
}


export interface MoralisSolanaTokenPairResponseData {
  exchangeAddress:           string;
  exchangeName:              string;
  exchangeLogo:              string;
  pairAddress:               string;
  pairLabel:                 string;
  usdPrice:                  number;
  usdPrice24hrPercentChange: number;
  usdPrice24hrUsdChange:     number;
  volume24hrNative:          number;
  volume24hrUsd:             number;
  liquidityUsd:              number;
  baseToken:                 string;
  quoteToken:                string;
  inactivePair:              boolean;
  pair:                      MoralisPair[];
}

export interface MoralisPair {
  tokenAddress:  string;
  tokenName:     string;
  tokenSymbol:   string;
  tokenLogo:     null | string;
  tokenDecimals: string;
  pairTokenType: string;
  liquidityUsd:  number;
}

export interface MoralisTokenDataRawData {
  tokenMetadata: MoralisEvmTokenMetaData | MoralisSolanaTokenMetadata
  tokenPrice: MoralisEvmTokenPrice | MoralisSolanaTokenPrice
}

export type MoralisTokenDataWithMarketCap = TokenDataWithMarketCapAndRawData<MoralisTokenDataRawData>
