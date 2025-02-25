import {ChainId, ChainToId} from "../shared/chains";
import {ProviderConfig} from "../shared/types";

require('dotenv').config();

export const getOrThrowEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env: any = {
  moralis: {
    apikey: getOrThrowEnvVar('MORALIS_API_KEY'),
    streamsSecret: getOrThrowEnvVar('MORALIS_STREAMS_SECRET'),
  },
  geonode: {
    username: getOrThrowEnvVar('GEO_NODE_API_USERNAME'),
    password: getOrThrowEnvVar('GEO_NODE_API_PASSWORD'),
  },
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
