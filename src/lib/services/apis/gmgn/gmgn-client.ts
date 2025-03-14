import { SessionType, GatewayCountry, ProxySourceType, BrowserType } from '../../proxy-fetcher/geonode/types';
import { GeonodeServerClient } from '../../proxy-fetcher/geonode/geonode-server-client';
import { sleep } from '../../../../utils/async';
import { GmgnResponse, SmartMoneyWalletData, TopTrader } from './types';
import { ChainId } from 'shared/chains';
import { chainIdToChain } from './utils';


export class GmgnClient {
    private readonly geonodeClient: GeonodeServerClient;
    private readonly baseUrl = 'https://gmgn.ai/defi';

    constructor() {
        this.geonodeClient = new GeonodeServerClient();
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
        const chain = chainIdToChain(chainId);
        const url = `${this.baseUrl}/quotation/v1/smartmoney/${chain}/walletNew/${walletAddress}?period=7d`;
        const referer = `${this.baseUrl}/${chain}/address/${walletAddress}`;
        const response = await this.geonodeClient.get(url, {
            headers: { ...this.getHeaders(), 'referer': referer },
            proxy_options: {
                country: "US",
                ip_source_type: ProxySourceType.RESIDENTIAL,
                session_type: SessionType.ROTATING,
                lifetime: 5,
                gateway: GatewayCountry.UNITED_STATES
            }
        });

        if (!response.content) {
            throw new Error('No content in response');
        }

        const gmgnResponse = response.content as GmgnResponse<SmartMoneyWalletData>;
        if (gmgnResponse.code !== 0 || !gmgnResponse.data) {
            throw new Error(gmgnResponse.msg || 'Invalid response from GMGN');
        }

        return gmgnResponse.data;
    }

    async getTopTraders(tokenAddress: string, chainId: ChainId): Promise<TopTrader[]> {
        const chain = chainIdToChain(chainId);
        const url = `${this.baseUrl}/quotation/v1/tokens/top_traders/${chain}/${tokenAddress}`;
        const referer = `https://gmgn.ai/${chain}/token/${tokenAddress}`;

        const response = await this.geonodeClient.get(url, {
            headers: { ...this.getHeaders(), 'referer': referer },
            proxy_options: {
                country: "US",
                ip_source_type: ProxySourceType.RESIDENTIAL,
                session_type: SessionType.ROTATING,
                lifetime: 5,
                gateway: GatewayCountry.UNITED_STATES
            }
        });

        if (!response.content) {
            throw new Error('No content in response');
        }

        const gmgnResponse = response.content as GmgnResponse<TopTrader[]>;
        if (gmgnResponse.code !== 0 || !gmgnResponse.data) {
            throw new Error(gmgnResponse.msg || 'Invalid response from GMGN');
        }

        return gmgnResponse.data;
    }
}

// Test the client
if (require.main === module) {
    const testTokens = [
        'J2JtfsdDaQWbkJdSwF83J66XBds5SRoP1RkYxwmgpump',
    ];

    const client = new GmgnClient();

    // Process tokens sequentially with delay
    async function processTokens() {
        for (const token of testTokens) {
            console.log(`\nFetching top traders for token: ${token}`);
            try {
                const traders = await client.getTopTraders(token, 'solana');
                console.log('Top traders:', JSON.stringify(traders, null, 2));
            } catch (error: any) {
                console.error('Error:', error.message);
            }
            // Wait 1 second before next request
            await sleep(1000);
        }
    }

    processTokens().catch(console.error);
}