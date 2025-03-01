import {Chain} from "./chains";

export type WalletDiscoveryConfig = {
  interval: number // Interval in milliseconds for the cron job or periodic task
}

export interface Token {
  id: number
  address: string
  chainType: Chain
  name: string
  symbol: string
}

export interface TrendingToken extends Token {
  trendingAt: Date
}

export interface ProviderConfig {
  https: string
  wss: string
}
