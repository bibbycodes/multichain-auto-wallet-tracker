import { ChainId } from '../../../../shared/chains';
import { GeonodeServerClient, } from '../../proxy-fetcher/geonode/geonode-server-client';
import { getRandomProxyOptions } from '../../proxy-fetcher/geonode/utils';
import { GmgnResponse, SmartMoneyWalletData, SolanaTrendingToken, TokenSecurityAndLaunchpad, TopBuyersResponse, TopHolder, TopTrader, TrendingToken, TrendingTokensResponse, WalletHoldings } from './types';
import { chainIdToGmGnChain } from './utils';

export class GmgnClient {
    private readonly geonodeClient: GeonodeServerClient;
    private readonly baseUrl = 'https://gmgn.ai';

    constructor() {
        this.geonodeClient = new GeonodeServerClient();
    }

    private async makeRequest<T>(url: string, referer: string): Promise<T> {
        const response = await this.geonodeClient.get(url, {
            headers: { ...this.getHeaders(), 'referer': referer },
            proxy_options: getRandomProxyOptions()
        });

        if (!response.content) {
            throw new Error('No content in response');
        }

        const gmgnResponse = response.content as GmgnResponse<T>;
        if (gmgnResponse.code !== 0 || !gmgnResponse.data) {
            throw new Error(gmgnResponse.msg || 'Invalid response from GMGN');
        }

        return gmgnResponse.data;
    }

    getHeaders(): Record<string, string> {
        return {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-GB,en;q=0.6",
            "if-none-match": "W/\"68b-+4WA2VXunNsedeRRXp7Su0PpYWs\"",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Brave\";v=\"132\"",
            "sec-ch-ua-arch": "\"arm\"",
            "sec-ch-ua-bitness": "\"64\"",
            "sec-ch-ua-full-version-list": "\"Not A(Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"132.0.0.0\", \"Brave\";v=\"132.0.0.0\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": "\"\"",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-ch-ua-platform-version": "\"14.6.1\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
        }
    }

    async getSmartMoneyWalletData(walletAddress: string, chainId: ChainId): Promise<SmartMoneyWalletData> {
        const chainName = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/defi/quotation/v1/smartmoney/${chainName}/walletNew/${walletAddress}?period=7d`;
        const referer = `${this.baseUrl}/${chainName}/address/${walletAddress}`;
        return this.makeRequest<SmartMoneyWalletData>(url, referer);
    }

    async getTopTraders(tokenAddress: string, chainId: ChainId): Promise<TopTrader[]> {
        const chain = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/defi/quotation/v1/tokens/top_traders/${chain}/${tokenAddress}`;
        const referer = `https://gmgn.ai/${chain}/token/${tokenAddress}`;
        return this.makeRequest<TopTrader[]>(url, referer);
    }

    async getTokenSecurityAndLaunchpad(tokenAddress: string, chainId: ChainId): Promise<TokenSecurityAndLaunchpad> {
        const chainName = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/api/v1/mutil_window_token_security_launchpad/${chainName}/${tokenAddress}`;
        const referer = `https://gmgn.ai/${chainName}/token/${tokenAddress}`;
        return this.makeRequest<TokenSecurityAndLaunchpad>(url, referer);
    }

    async getWalletHoldings(walletAddress: string, chainId: ChainId): Promise<WalletHoldings> {
        const chainName = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/api/v1/wallet_holdings/${chainName}/${walletAddress}`;
        const referer = `https://gmgn.ai/${chainName}/address/${walletAddress}`;
        return this.makeRequest<WalletHoldings>(url, referer);
    }

    isSolanaTrendingToken(token: TrendingToken | SolanaTrendingToken): token is SolanaTrendingToken {
        return token.chain === 'sol' && 'renounced_mint' in token;
    }

    async getTrendingTokens(chainId: ChainId, timeframe: '1h' | '24h' = '1h'): Promise<TrendingTokensResponse> {
        const chainName = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/defi/quotation/v1/rank/${chainName}/swaps/${timeframe}`;
        const referer = `https://gmgn.ai/${chainName}/trending`;

        const data = await this.makeRequest<TrendingTokensResponse>(url, referer);

        // Validate and transform the response based on chain type
        data.rank = data.rank.map(token => {
            if (this.isSolanaTrendingToken(token)) {
                // Ensure numeric fields are properly typed for Solana tokens
                return {
                    ...token,
                    price: Number(token.price),
                    market_cap: Number(token.market_cap),
                    total_supply: Number(token.total_supply),
                    top_10_holder_rate: Number(token.top_10_holder_rate),
                } as SolanaTrendingToken;
            }
            return token as TrendingToken;
        });

        return data;
    }

    async getTopBuyers(tokenAddress: string, chainId: ChainId): Promise<TopBuyersResponse> {
        const chainName = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/defi/quotation/v1/tokens/top_buyers/${chainName}/${tokenAddress}`;
        const referer = `${this.baseUrl}/${chainName}/token/${tokenAddress}`;
        return this.makeRequest<TopBuyersResponse>(url, referer);
    }

    async getTopHolders(tokenAddress: string, chainId: ChainId): Promise<TopHolder[]> {
        const chainName = chainIdToGmGnChain(chainId);
        const url = `${this.baseUrl}/defi/quotation/v1/tokens/top_holders/${chainName}/${tokenAddress}`;
        const referer = `${this.baseUrl}/${chainName}/token/${tokenAddress}`;
        return this.makeRequest<TopHolder[]>(url, referer);
    }
}