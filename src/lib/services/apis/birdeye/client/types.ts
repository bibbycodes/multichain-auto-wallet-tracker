

export interface TokenPriceResponse {
  data: {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
  };
  success: boolean;
}

export interface OhlcDataResponse {
  success: boolean;
  data: OhlcResponseData;
}

export interface OhlcResponseData {
  items: OhlcvItem[];
}

export interface TopHolderResponse {
  data: {
    items: TopHolder[];
  };
  success: boolean;
}

export interface TopHolder {
  amount: string;
  decimals: number;
  mint: string;
  owner: string;
  token_account: string;
  ui_amount: number;
}

export interface OhlcvItem {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  unixTime: number;
  address: string;
  type: string;
}

export interface CreationData {
  txHash: string,
  slot: number,
  tokenAddress: string,
  decimals: number,
  owner: string,
  blockUnixTime: number,
  blockHumanTime: string
}

export interface BirdEyeResponse<T> {
  data: T;
  success: boolean;
}


export interface BirdEyeHistoricalPriceDataResponse {
  data: HistoricalPriceDataData;
  success: boolean;
}

export interface HistoricalPriceDataData {
  items: HistoricalPriceItem[];
}

export interface HistoricalPriceItem {
  timestamp: number;
  value: number;
}

export type TimeInterval = '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '2H' | '4H' | '6H' | '12H' | '1D' | '1W'

export interface BirdEyeOverviewResponse {
  data: BirdTokenEyeOverview;
  success: boolean;
}

export interface BirdTokenEyeOverview {
  address: string;
  decimals: number;
  extensions: {
    "coingeckoId": string,
    "serumV3Usdc": string,
    "serumV3Usdt": string,
    "website": string,
    "telegram": string,
    "twitter": string,
    "description": string,
    "discord": string,
    "medium": string,
  };
  logoURI: string;
  liquidity: number;
  lastTradeUnixTime: number;
  lastTradeHumanTime: Date;
  price: number;
  history30mPrice: number;
  priceChange30mPercent: number;
  history1hPrice: number;
  priceChange1hPercent: number;
  history2hPrice: number;
  priceChange2hPercent: number;
  history4hPrice: number;
  priceChange4hPercent: number;
  history6hPrice: number;
  priceChange6hPercent: number;
  history8hPrice: number;
  priceChange8hPercent: number;
  history12hPrice: number;
  priceChange12hPercent: number;
  history24hPrice: number;
  priceChange24hPercent: number;
  uniqueWallet30m: number;
  uniqueWalletHistory30m: number;
  uniqueWallet30mChangePercent: number;
  uniqueWallet1h: number;
  uniqueWalletHistory1h: number;
  uniqueWallet1hChangePercent: number;
  uniqueWallet2h: number;
  marketCap: number;
  fdv: number;
  uniqueWalletHistory2h: number;
  uniqueWallet2hChangePercent: number;
  uniqueWallet4h: number;
  uniqueWalletHistory4h: number;
  uniqueWallet4hChangePercent: number;
  uniqueWallet8h: number;
  uniqueWalletHistory8h: number;
  uniqueWallet8hChangePercent: number;
  uniqueWallet24h: number;
  uniqueWalletHistory24h: number;
  uniqueWallet24hChangePercent: number;
  supply: number;
  totalSuply: number;
  mc: number;
  circulatingSupply: number;
  realMc: number;
  holder: number;
  trade5m: number;
  tradeHistory5m: number;
  trade5mChangePercent: number;
  sell5m: number;
  sellHistory5m: number;
  sell5mChangePercent: number;
  buy5m: number;
  buyHistory5m: number;
  buy5mChangePercent: number;
  v5m: number;
  v5mUSD: number;
  vHistory5m: number;
  vHistory5mUSD: number;
  v5mChangePercent: number;
  vBuy5m: number;
  vBuy5mUSD: number;
  vBuyHistory5m: number;
  vBuyHistory5mUSD: number;
  vBuy5mChangePercent: number;
  vSell5m: number;
  vSell5mUSD: number;
  vSellHistory5m: number;
  vSellHistory5mUSD: number;
  vSell5mChangePercent: number;
  trade30m: number;
  tradeHistory30m: number;
  trade30mChangePercent: number;
  sell30m: number;
  sellHistory30m: number;
  sell30mChangePercent: number;
  buy30m: number;
  buyHistory30m: number;
  buy30mChangePercent: number;
  v30m: number;
  v30mUSD: number;
  vHistory30m: number;
  vHistory30mUSD: number;
  v30mChangePercent: number;
  vBuy30m: number;
  vBuy30mUSD: number;
  vBuyHistory30m: number;
  vBuyHistory30mUSD: number;
  vBuy30mChangePercent: number;
  vSell30m: number;
  vSell30mUSD: number;
  vSellHistory30m: number;
  vSellHistory30mUSD: number;
  vSell30mChangePercent: number;
  trade1h: number;
  tradeHistory1h: number;
  trade1hChangePercent: number;
  sell1h: number;
  sellHistory1h: number;
  sell1hChangePercent: number;
  buy1h: number;
  buyHistory1h: number;
  buy1hChangePercent: number;
  v1h: number;
  v1hUSD: number;
  vHistory1h: number;
  vHistory1hUSD: number;
  v1hChangePercent: number;
  vBuy1h: number;
  vBuy1hUSD: number;
  vBuyHistory1h: number;
  vBuyHistory1hUSD: number;
  vBuy1hChangePercent: number;
  vSell1h: number;
  vSell1hUSD: number;
  vSellHistory1h: number;
  vSellHistory1hUSD: number;
  vSell1hChangePercent: number;
  trade2h: number;
  tradeHistory2h: number;
  trade2hChangePercent: number;
  sell2h: number;
  sellHistory2h: number;
  sell2hChangePercent: number;
  buy2h: number;
  buyHistory2h: number;
  buy2hChangePercent: number;
  v2h: number;
  v2hUSD: number;
  vHistory2h: number;
  vHistory2hUSD: number;
  v2hChangePercent: number;
  vBuy2h: number;
  vBuy2hUSD: number;
  vBuyHistory2h: number;
  vBuyHistory2hUSD: number;
  vBuy2hChangePercent: number;
  vSell2h: number;
  vSell2hUSD: number;
  vSellHistory2h: number;
  vSellHistory2hUSD: number;
  vSell2hChangePercent: number;
  trade4h: number;
  tradeHistory4h: number;
  trade4hChangePercent: number;
  sell4h: number;
  sellHistory4h: number;
  sell4hChangePercent: number;
  buy4h: number;
  buyHistory4h: number;
  buy4hChangePercent: number;
  v4h: number;
  v4hUSD: number;
  vHistory4h: number;
  vHistory4hUSD: number;
  v4hChangePercent: number;
  vBuy4h: number;
  vBuy4hUSD: number;
  vBuyHistory4h: number;
  vBuyHistory4hUSD: number;
  vBuy4hChangePercent: number;
  vSell4h: number;
  vSell4hUSD: number;
  vSellHistory4h: number;
  vSellHistory4hUSD: number;
  vSell4hChangePercent: number;
  trade8h: number;
  tradeHistory8h: number;
  trade8hChangePercent: number;
  sell8h: number;
  sellHistory8h: number;
  sell8hChangePercent: number;
  buy8h: number;
  buyHistory8h: number;
  buy8hChangePercent: number;
  v8h: number;
  v8hUSD: number;
  vHistory8h: number;
  vHistory8hUSD: number;
  v8hChangePercent: number;
  vBuy8h: number;
  vBuy8hUSD: number;
  vBuyHistory8h: number;
  vBuyHistory8hUSD: number;
  vBuy8hChangePercent: number;
  vSell8h: number;
  vSell8hUSD: number;
  vSellHistory8h: number;
  vSellHistory8hUSD: number;
  vSell8hChangePercent: number;
  trade24h: number;
  tradeHistory24h: number;
  trade24hChangePercent: number;
  sell24h: number;
  sellHistory24h: number;
  sell24hChangePercent: number;
  buy24h: number;
  buyHistory24h: number;
  buy24hChangePercent: number;
  v24h: number;
  v24hUSD: number;
  vHistory24h: number;
  vHistory24hUSD: number;
  v24hChangePercent: number;
  vBuy24h: number;
  vBuy24hUSD: number;
  vBuyHistory24h: number;
  vBuyHistory24hUSD: number;
  vBuy24hChangePercent: number;
  vSell24h: number;
  vSell24hUSD: number;
  vSellHistory24h: number;
  vSellHistory24hUSD: number;
  vSell24hChangePercent: number;
  watch: null;
  name: string;
  symbol: string;
  numberMarkets: number;
}

export interface BirdEyeGetResponse<T> {
  success: boolean;
  data: T;
}

export type BirdeyeTokenListResponse = BirdEyeGetResponse<TokenListResponseData>;

export type BirdeyeTrendingTokenListResponse = BirdEyeGetResponse<TokenTrendingListResponseData>;

export interface TokenListResponseData {
  updateUnixTime: number;
  updateTime: Date;
  tokens: TokenListItem[];
  total: number;
}

export interface TokenTrendingListResponseData {
  updateUnixTime: number;
  updateTime: Date;
  tokens: TrendingTokenListItem[];
  total: number;
}

export interface TokenListItem {
  address: string;
  decimals: number;
  lastTradeUnixTime: number;
  liquidity: number;
  logoURI: string;
  mc: number;
  name: string;
  symbol: string;
  v24hChangePercent: number;
  v24hUSD: number;
}

export interface TrendingTokenListItem {
  address: string,
  decimals: number,
  liquidity: number,
  logoURI: string,
  name: string,
  symbol: string,
  volume24hUSD: number,
  rank: number,
  price: number
}

export interface MarketsResponse {
  success: boolean;
  data: MarketsData;
}

export interface MarketsData {
  items: MarketItem[];
  total: number;
}

export interface MarketItem {
  address: string;
  base: TokenInfo;
  createdAt: string;
  liquidity: number;
  name: string;
  price: number;
  quote: TokenInfo;
  source: string;
  volume24h: number;
  trade24h: number;
  trade24hChangePercent: number | null;
  uniqueWallet24h: number;
  uniqueWallet24hChangePercent: number | null;
}

export interface TokenInfo {
  address: string;
  decimals: number;
  symbol?: string;
  icon?: string;
}


export interface TradesResponse {
  success: boolean;
  data: { items: Trade[], has_next: boolean };
}

export interface TradeToken {
  symbol: string
  address: string
  decimals: number
  price: number
  amount: string
  ui_amount: number
  ui_change_amount: number
  type_swap: 'from' | 'to'
  is_scaled_ui_token: boolean
  multiplier: number | null
}

export interface Trade {
  base: TradeToken
  quote: TradeToken
  tx_type: string
  tx_hash: string
  ins_index: number
  inner_ins_index: number
  block_unix_time: number
  block_number: number
  volume_usd: number
  volume: number
  owner: string
  signers: string[]
  source: string
  interacted_program_id: string
  pool_id: string
}

export interface TradesSeekByTimeToken {
  symbol: string
  decimals: number
  address: string
  amount: string
  uiAmount: number
  price: number
  changeAmount: number
  uiChangeAmount: number
  isScaledUiToken: boolean
  multiplier: number | null
}

export interface TradesSeekByTimeItem {
  quote: TradesSeekByTimeToken
  base: TradesSeekByTimeToken
  basePrice: number
  quotePrice: number
  txHash: string
  source: string
  blockUnixTime: number
  txType: string
  owner: string
  side: 'buy' | 'sell'
  alias: string | null
  pricePair: number
  from: TradesSeekByTimeToken
  to: TradesSeekByTimeToken
  tokenPrice: number
  poolId: string
}

export interface TradesSeekByTimeData {
  items: TradesSeekByTimeItem[]
  hasNext: boolean
}

export interface TradesSeekByTimeResponse {
  success: boolean
  data: TradesSeekByTimeData
}

export interface WalletPnlMeta {
  address: string
  currency: string
  holdingCheck: boolean
  time: string
}

export interface WalletPnlCounts {
  totalBuy: number
  totalSell: number
  totalTrade: number
}

export interface WalletPnlQuantity {
  totalBoughtAmount: number
  totalSoldAmount: number
  holding: number
}

export interface WalletPnlCashflow {
  costOfQuantitySold: number
  totalInvested: number
  totalSold: number
  currentValue: number
}

export interface WalletPnlPnl {
  realizedProfitUsd: number
  realizedProfitPercent: number
  unrealizedUsd: number
  unrealizedPercent: number
  totalUsd: number
  totalPercent: number
  avgProfitPerTradeUsd: number
}

export interface WalletPnlPricing {
  currentPrice: number
  avgBuyCost: number
  avgSellCost: number
}

export interface WalletPnlToken {
  symbol: string
  decimals: number
  counts: WalletPnlCounts
  quantity: WalletPnlQuantity
  cashflowUsd: WalletPnlCashflow
  pnl: WalletPnlPnl
  pricing: WalletPnlPricing
}

export interface WalletPnlData {
  meta: WalletPnlMeta
  tokens: Record<string, WalletPnlToken>
}

export interface WalletPnlResponse {
  success: boolean
  data: WalletPnlData
}

// Token Security Types
export interface LpHolder {
  address: string
  tag: string
  value: number | null
  is_contract: number
  balance: string
  percent: string
  NFT_list: any | null
  is_locked: number
  locked_detail?: Array<{
    amount: string
    end_time: string
    opt_time: string
  }>
}

export interface BirdeyeEvmTokenSecurity {
  antiWhaleModifiable: string
  buyTax: string
  canTakeBackOwnership: string
  cannotBuy: string
  cannotSellAll: string
  creatorAddress: string
  creatorBalance: string
  creatorPercentage: string
  externalCall: string
  hiddenOwner: string
  holderCount: string
  honeypotWithSameCreator: string
  isAntiWhale: string
  isBlacklisted: string
  isHoneypot: string
  isInDex: string
  isMintable: string
  isOpenSource: string
  isProxy: string
  isWhitelisted: string
  lpHolderCount: string
  lpHolders: LpHolder[]
  lpTotalSupply: string
  ownerAddress: string
  ownerBalance: string
  ownerChangeBalance: string
  ownerPercentage: string
  personalSlippageModifiable: string
  sellTax: string
  slippageModifiable: string
  tokenName: string
  tokenSymbol: string
  totalSupply: string
  tradingCooldown: string
  transferPausable: string
}

export interface BirdeyeSolanaTokenSecurity {
  creatorAddress: string
  creatorOwnerAddress: string | null
  ownerAddress: string | null
  ownerOfOwnerAddress: string | null
  creationTx: string
  creationTime: number
  creationSlot: number
  mintTx: string
  mintTime: number
  mintSlot: number
  creatorBalance: number
  ownerBalance: number | null
  ownerPercentage: number | null
  creatorPercentage: number
  metaplexUpdateAuthority: string
  metaplexOwnerUpdateAuthority: string | null
  metaplexUpdateAuthorityBalance: number
  metaplexUpdateAuthorityPercent: number
  mutableMetadata: boolean
  top10HolderBalance: number
  top10HolderPercent: number
  top10UserBalance: number
  top10UserPercent: number
  isTrueToken: boolean | null
  fakeToken: any | null
  totalSupply: number
  preMarketHolder: any[]
  lockInfo: any | null
  freezeable: boolean | null
  freezeAuthority: string | null
  transferFeeEnable: boolean | null
  transferFeeData: any | null
  isToken2022: boolean
  nonTransferable: boolean | null
  jupStrictList: boolean
}

export interface BirdeyeTokenSecurityResponse {
  success: boolean
  data: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity
}

// Token Metadata Types
export interface BirdeyeTokenMetadataExtensions {
  coingecko_id?: string
  website?: string
  twitter?: string
  discord?: string
  medium?: string
  telegram?: string
  description?: string
}

export interface BirdeyeTokenMetadata {
  address: string
  symbol: string
  name: string
  decimals: number
  extensions?: BirdeyeTokenMetadataExtensions
  logo_uri?: string
}

export interface BirdeyeTokenMetadataResponse {
  success: boolean
  data: BirdeyeTokenMetadata
}