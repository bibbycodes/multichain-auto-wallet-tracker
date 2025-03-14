import { GeonodeServerClient } from '../../proxy-fetcher/geonode/geonode-server-client';
import { getRandomProxyOptions } from '../../proxy-fetcher/geonode/utils';
import { SolanaTokenSecurityInfo, SolanaTokenSecurityResponse, TokenSecurityInfo, TokenSecurityResponse } from './types';
import { ChainId } from 'shared/chains';
export class GoPlusClient {
    private readonly geonodeClient: GeonodeServerClient;
    private readonly baseUrl = 'https://api.gopluslabs.io/api/v1';

    constructor() {
        this.geonodeClient = new GeonodeServerClient();
    }

    private getHeaders(): Record<string, string> {
        return {
            'accept': 'application/json',
            'content-type': 'application/json'
        };
    }

    /**
     * Get token security information for a specific token address on a given chain
     * @param chainId - The chain ID of the token (e.g., ChainId.ETH for Ethereum)
     * @param tokenAddress - The token contract address
     * @returns TokenSecurityInfo object containing detailed security information
     * @throws Error if the request fails or returns invalid data
     */
    async getEvmTokenSecurity(chainId: ChainId, tokenAddress: string): Promise<TokenSecurityInfo> {
        const url = `${this.baseUrl}/token_security/${chainId}?contract_addresses=${tokenAddress}`;

        const response = await this.geonodeClient.get(url, {
            headers: this.getHeaders(),
            proxy_options: getRandomProxyOptions()
        });

        if (!response.content) {
            throw new Error('No content in response');
        }

        const securityResponse = response.content as TokenSecurityResponse;

        if (securityResponse.code !== 1) {
            throw new Error(securityResponse.message || 'Failed to fetch token security info');
        }

        const tokenInfo = securityResponse.result[tokenAddress.toLowerCase()];
        if (!tokenInfo) {
            throw new Error('No security information found for the specified token');
        }

        return tokenInfo;
    }

    async getSolanaTokenSecurity(tokenAddress: string): Promise<SolanaTokenSecurityInfo> {
        const url = `${this.baseUrl}/token_security/solana?contract_addresses=${tokenAddress}`;

        const response = await this.geonodeClient.get(url, {
            headers: this.getHeaders(),
            proxy_options: getRandomProxyOptions()
        });

        if (!response.content) {
            throw new Error('No content in response');
        }

        const securityResponse = response.content as SolanaTokenSecurityResponse;

        if (securityResponse.code !== 1) {
            throw new Error(securityResponse.message || 'Failed to fetch token security info');
        }

        const tokenInfo = securityResponse.result[tokenAddress];
        if (!tokenInfo) {
            throw new Error('No security information found for the specified token');
        }

        return tokenInfo;
    }
}