import {ApiService} from "./types";
import {Singleton} from "../singleton";
import {env} from "../env/env";
import {ChainBaseConfig} from "../env/types";
import {ChainToId} from "../../../../shared/chains";

export class ApiKeyRotator extends Singleton {
  private apiKeysMap: Map<ApiService, string[]> = new Map();
  private lastUsedKeysMap: Map<ApiService, number> = new Map();

  constructor() {
    super();
    this.populate()
  }

  addService(service: ApiService, apiKeys: string[]): void {
    if (this.apiKeysMap.has(service)) {
      throw new Error(`ApiService ${service} already exists.`);
    }
    this.apiKeysMap.set(service, apiKeys);
    this.lastUsedKeysMap.set(service, -1);
  }

  getNextAndUpdateKey(service: ApiService): string {
    const apiKeys = this.apiKeysMap.get(service);
    if (!apiKeys) {
      throw new Error(`ApiService ${service} not found.`);
    }

    let lastUsedIndex = this.lastUsedKeysMap.get(service) ?? -1;
    const nextIndex = (lastUsedIndex + 1) % apiKeys.length;

    // Update the last used key index to the next one
    this.lastUsedKeysMap.set(service, nextIndex);

    // Return the next API key
    return apiKeys[nextIndex];
  }

  setLastUsedApiKeyIndex(service: ApiService, index: number): void {
    const apiKeys = this.apiKeysMap.get(service);
    if (!apiKeys) {
      throw new Error(`ApiService ${service} not found.`);
    }
    if (index < 0 || index >= apiKeys.length) {
      throw new Error(`Index ${index} out of bounds for service ${service}.`);
    }

    this.lastUsedKeysMap.set(service, index);
  }

  getLastUsedApiKey(service: ApiService): string | undefined {
    const lastUsedIndex = this.lastUsedKeysMap.get(service);
    if (lastUsedIndex === undefined || lastUsedIndex === -1) {
      return undefined; // No API key has been used yet
    }

    const apiKeys = this.apiKeysMap.get(service);
    if (!apiKeys) {
      throw new Error(`ApiService ${service} not found.`);
    }

    return apiKeys[lastUsedIndex];
  }
  
  getRandomKey(service: ApiService): string {
    const apiKeys = this.apiKeysMap.get(service);
    if (!apiKeys) {
      throw new Error(`ApiService ${service} not found.`);
    }
    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
  }

  populate(): void {
    this.addService(ApiService.ChainBase, env.chainBase.map((config: ChainBaseConfig) => config.apiKey))
    this.addService(ApiService.QuicknodeBscHttps, env.quicknode[ChainToId.bsc].map(config => config.https))
    this.addService(ApiService.QuicknodeBaseHttps, env.quicknode[ChainToId.base].map(config => config.https))
    this.addService(ApiService.QuicknodeEthHttps, env.quicknode[ChainToId.ethereum].map(config => config.https))
  }
}
