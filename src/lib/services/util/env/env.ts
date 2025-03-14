import {ChainId, ChainsMap} from "../../../../shared/chains";
import {ProviderConfig} from "../../../../shared/types";
import {EnvConfig} from "./types";
require('dotenv').config();

export const getOrThrowEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  moralis: {
    apiKey: getOrThrowEnvVar('MORALIS_API_KEY'),
    streamsSecret: getOrThrowEnvVar('MORALIS_STREAMS_SECRET'),
  },
  geonode: {
    username: getOrThrowEnvVar('GEO_NODE_API_USERNAME'),
    password: getOrThrowEnvVar('GEO_NODE_API_PASSWORD'),
  },
  birdeye: {
    apikey: getOrThrowEnvVar('BIRD_EYE_API_KEY'),
  },
  telegram: {
    sessionString: getOrThrowEnvVar('TELEGRAM_SESSION_STRING'),
    apiId: parseInt(getOrThrowEnvVar('TELEGRAM_API_ID')),
    apiHash: getOrThrowEnvVar('TELEGRAM_API_HASH')
  },
  chainBase: [
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_1'), email: 'robertrosijigriffith@gmail.com', project: '1'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_2'), email: 'robertrosijigriffith@gmail.com', project: '2'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_3'), email: 'robertrosijigriffith@gmail.com', project: '3'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_4'), email: 'robertrosijigriffith@gmail.com', project: '4'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_5'), email: 'robertrosijigriffith@gmail.com', project: '5'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_6'), email: 'robertrosijigriffith@gmail.com', project: '6'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_7'), email: 'robertrosijigriffith@gmail.com', project: '7'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_8'), email: 'robertrosijigriffith@gmail.com', project: '8'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_9'), email: 'p.ladar@icloud.com', project: 'track'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_10'), email: 'p.ladar@icloud.com', project: 'track2'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_11'), email: 'p.ladar@icloud.com', project: 'track3'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_12'), email: 'p.ladar@icloud.com', project: 'track4'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_13'), email: 'p.ladar@icloud.com', project: 'track5'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_14'), email: 'p.ladar@icloud.com', project: 'track6'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_15'), email: 'p.ladar@icloud.com', project: 'track7'},
    {apiKey: getOrThrowEnvVar('CHAIN_BASE_API_KEY_16'), email: 'p.ladar@icloud.com', project: 'track8'},
  ],
  quicknode: {
    [ChainsMap.bsc]: [{
      https: getOrThrowEnvVar('QUICKNODE_BSC_ENDPOINT_HTTPS_1'),
      wss: getOrThrowEnvVar('QUICKNODE_BSC_ENDPOINT_WSS_1'),
    }],
    [ChainsMap.base]: [{
      https: getOrThrowEnvVar('QUICKNODE_BASE_ENDPOINT_HTTPS_1'),
      wss: getOrThrowEnvVar('QUICKNODE_BASE_ENDPOINT_WSS_1')
    }],
    [ChainsMap.ethereum]: [{
      https: getOrThrowEnvVar('QUICKNODE_ETH_ENDPOINT_HTTPS_1'),
      wss: getOrThrowEnvVar('QUICKNODE_ETH_ENDPOINT_WSS_1')
    }],
  },
  redis: {
    host: getOrThrowEnvVar('REDIS_HOST'),
    port: parseInt(getOrThrowEnvVar('REDIS_PORT')),
    db: parseInt(getOrThrowEnvVar('REDIS_DB')),
  }
};

export const getRandomQuicknodeEndpoint = (chainId: ChainId): ProviderConfig => {
  const endpoints = env.quicknode[chainId];
  return endpoints[Math.floor(Math.random() * endpoints.length)];
}
