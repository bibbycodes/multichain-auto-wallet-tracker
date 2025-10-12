export interface EnvConfig {
  chainBase: ChainBaseConfig[];
  quicknode: QuicknodeConfig;
  redis: RedisConfig;
  birdeye: BirdEyeConfig;
  moralis: MoralisConfig;
  geonode: GeoNodeConfig;
  telegram: TelegramConfig;
  database: DatabaseConfig;
}

export interface TelegramConfig {
  sessionString: string
  apiId: number
  apiHash: string
  wbbBscBotToken: string
  wbbBscChannelId: string
}

export interface DatabaseConfig {
  url: string;
}

export interface ChainBaseConfig {
  apiKey: string;
  email: string;
  project: string
}

export interface QuicknodeConfig {
  [chainId: string]: {
    https: string;
    wss: string;
    email?: string
  }[]
}

export interface RedisConfig {
  host: string;
  port: number;
  db: number
}

export interface BirdEyeConfig {
  apikey: string;
}

export interface MoralisConfig {
  apiKey: string;
  streamsSecret: string;
}

export interface GeoNodeConfig {
  username: string;
  password: string;
}
