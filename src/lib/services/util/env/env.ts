import {ChainId, ChainToId} from "../../../../shared/chains";
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
    {apiKey: '2tajV19RPv8NrJKdwfyZSv3DoKw', email: 'robertrosijigriffith@gmail.com', project: '1'},
    {apiKey: '2takGXuI9bBol0CGPhWKnsUP6KZ', email: 'robertrosijigriffith@gmail.com', project: '2'},
    {apiKey: '2takHK0NN54cU2NoMsl5F6COhtL', email: 'robertrosijigriffith@gmail.com', project: '3'},
    {apiKey: '2takHlIsUAw3j2HMurfQg3Z4znO', email: 'robertrosijigriffith@gmail.com', project: '4'},
    {apiKey: '2takIF8ESfyHkmOP1vHb5VEvI8F', email: 'robertrosijigriffith@gmail.com', project: '5'},
    {apiKey: '2takIasOb8P4VCCn2L6GyMAdHB7', email: 'robertrosijigriffith@gmail.com', project: '6'},
    {apiKey: '2takIvAW3JiSPC6seF5oQ5Z3IUQ', email: 'robertrosijigriffith@gmail.com', project: '7'},
    {apiKey: '2takJERgCPiUBllra1LCigAMZIs', email: 'robertrosijigriffith@gmail.com', project: '8'},
    {apiKey: '2miN4RFLnly6T7AnVnTwaWJu9Vt', email: 'p.ladar@icloud.com', project: 'track'},
    {apiKey: '2miN7RG3PxlZLr8kQndmWAdj0dX', email: 'p.ladar@icloud.com', project: 'track2'},
    {apiKey: '2miN8IUb9p3NM0z6MZnZE8GSM2y', email: 'p.ladar@icloud.com', project: 'track3'},
    {apiKey: '2miN8yfYXS6BvQDZDlir7D0q4TS', email: 'p.ladar@icloud.com', project: 'track4'},
    {apiKey: '2miN9v0FwULIJWCVSnPOVJ0D5KW', email: 'p.ladar@icloud.com', project: 'track5'},
    {apiKey: '2miNANpDMWYmV9aqA6StVEcZGIJ', email: 'p.ladar@icloud.com', project: 'track6'},
    {apiKey: '2miNAziV6PARk88Xl4Qun0Hyl6A', email: 'p.ladar@icloud.com', project: 'track7'},
    {apiKey: '2miNBs6AJeutSwAbKPhIURG6e9v', email: 'p.ladar@icloud.com', project: 'track8'},
  ],
  quicknode: {
    [ChainToId.bsc]: [{
      https: getOrThrowEnvVar('QUICKNODE_BSC_ENDPOINT_HTTPS_1'),
      wss: getOrThrowEnvVar('QUICKNODE_BSC_ENDPOINT_WSS_1'),
    }],
    [ChainToId.base]: [{
      https: getOrThrowEnvVar('QUICKNODE_BASE_ENDPOINT_HTTPS_1'),
      wss: getOrThrowEnvVar('QUICKNODE_BASE_ENDPOINT_WSS_1')
    }],
    [ChainToId.ethereum]: [{
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
