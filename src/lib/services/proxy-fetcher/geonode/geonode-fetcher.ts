import axios from 'axios';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import { countries } from 'countries-list';
import { Singleton } from '../../util/singleton';
import { env } from '../../util/env/env';
import { GatewayCountry, SessionType, ProxySourceType, CountryCode, ProxyUrlOptions } from './types';

export class GeonodeFetcher extends Singleton {
    private readonly httpAgent: HttpProxyAgent;
    private readonly httpsAgent: HttpsProxyAgent;

    constructor(
        private readonly username: string = env.geonode.username,
        private readonly password: string = env.geonode.password,
        private proxyOptions: ProxyUrlOptions = {}
    ) {
        super();
    
        const agentConfig = {
            proxy: this.getProxyUrl(),
            keepAlive: false,
        };

        this.httpAgent = new HttpProxyAgent(agentConfig);
        this.httpsAgent = new HttpsProxyAgent(agentConfig);
    }

    getProxyUrl(options: ProxyUrlOptions = defaultProxyOptions): string {
        const {
            country,
            ipSourceType,
            sessionType,
            lifetime,
            gateway
        } = options;
        return `http://${this.getUsername({country, ipSourceType, lifetime})}:${this.password}@${this.getGatewayIp(gateway)}:${this.getPort(sessionType)}`;
    }

    getProxyOptions(): ProxyUrlOptions {
        return this.proxyOptions;
    }

    getUsername({
        country = 'US',
        ipSourceType = ProxySourceType.RESIDENTIAL,
        lifetime = 3,
    }: ProxyUrlOptions = {}): string {
        return `${this.username}-${this.getIpSourceType(ipSourceType)}-${this.getCountry(country)}-${this.getLifetime(lifetime)}`;
    }

    async fetch(url: string, options: any = {}): Promise<any> {
        try {
            const response = await axios({
                ...options,
                url,
                httpAgent: this.httpAgent,
                httpsAgent: this.httpsAgent,
                timeout: 30000, // 30 second timeout
                validateStatus: (status) => status >= 200 && status < 300,
                headers: {
                    'User-Agent': 'curl/8.4.0',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            return response;
        } catch (error) {
            console.error(`Error making request through Geonode proxy to ${url}:`, error);
            throw error;
        }
    }

    getGatewayIp(country: GatewayCountry = GatewayCountry.FRANCE): string {
        switch (country) {
            case GatewayCountry.FRANCE:
                return '92.204.164.15';
            case GatewayCountry.UNITED_STATES:
                return '192.155.103.209';
            case GatewayCountry.SINGAPORE:
                return '172.104.161.166';
            default:
                throw new Error(`Unsupported gateway country: ${country}`);
        }
    }

    getLifetime(minutes: number = 3): string {
        return `lifetime-${minutes}`;
    }

    getCountry(country: CountryCode = 'US'): string {
        if (!countries[country]) {
            throw new Error(`Invalid ISO 3166-1 country code: ${country}`);
        }
        return `country-${country.toLowerCase()}`;
    }

    getPort(sessionType: SessionType = SessionType.STICKY): number {
        switch (sessionType) {
            case SessionType.STICKY:
                return 9000;
            case SessionType.ROTATING:
                return 10000;
            default:
                throw new Error(`Unsupported session type: ${sessionType}`);
        }
    }

    getIpSourceType(type: ProxySourceType): string {
        switch (type) {
            case ProxySourceType.RESIDENTIAL:
                return 'type-residential';
            case ProxySourceType.MOBILE:
                return 'type-mobile';
            case ProxySourceType.DATA_CENTER:
                return 'type-datacenter';
            default:
                throw new Error(`Unsupported proxy source type: ${type}`);
        }
    }

    async get(url: string, options: any = {}): Promise<any> {
        return this.fetch(url, { ...options, method: 'GET' });
    }

    async post(url: string, data: any, options: any = {}): Promise<any> {
        return this.fetch(url, { ...options, method: 'POST', data });
    }

    async put(url: string, data: any, options: any = {}): Promise<any> {
        return this.fetch(url, { ...options, method: 'PUT', data });
    }

    async delete(url: string, options: any = {}): Promise<any> {
        return this.fetch(url, { ...options, method: 'DELETE' });
    }

    getAgentConfig() {
        return {
            httpAgent: this.httpAgent,
            httpsAgent: this.httpsAgent,
        };
    }
}

export const defaultProxyOptions: ProxyUrlOptions = {
    country: 'US',
    ipSourceType: ProxySourceType.RESIDENTIAL,
    lifetime: 3,
    gateway: GatewayCountry.FRANCE
}