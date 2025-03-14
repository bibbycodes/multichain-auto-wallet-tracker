import { exec } from 'child_process';
import { env } from '../../util/env/env';
import { GeonodeFetcher } from './geonode-fetcher';
import { PythonProxyOtions, ProxyUrlOptions } from './types';

export class CurlExecutor {
    private readonly fetcher: GeonodeFetcher;

    constructor() {
        this.fetcher = GeonodeFetcher.getInstance();
    }

    async execute(url: string, options: {
        headers?: Record<string, string>;
        method?: string;
        data?: any;
        proxyOptions?: PythonProxyOtions;
    } = {}): Promise<string> {
        const {
            headers = {},
            method = 'GET',
            data,
            proxyOptions = {}
        } = options;

        // Get proxy configuration
        const proxyUrl = this.fetcher.getProxyUrl(proxyOptions);
        const {password} = env.geonode
        const [host, port] = proxyUrl.split('@')[1].split(':');

        // Construct curl command
        let curlCommand = `curl -x ${host}:${port} -U ${this.fetcher.getUsername(proxyOptions)}:${password} '${url}'`;

        // Add method if not GET
        if (method !== 'GET') {
            curlCommand += ` -X ${method}`;
        }

        // Add data if provided
        if (data) {
            curlCommand += ` -d '${JSON.stringify(data)}'`;
        }

        // Add headers
        Object.entries(headers).forEach(([key, value]) => {
            curlCommand += ` -H '${key}: ${value}'`;
        });

        // Execute curl command
        return new Promise((resolve, reject) => {
            exec(curlCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing curl: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`Curl stderr: ${stderr}`);
                }
                resolve(stdout);
            });
        });
    }

    async get(url: string, options: {
        headers?: Record<string, string>;
        proxyOptions?: ProxyUrlOptions;
    } = {}): Promise<string> {
        return this.execute(url, { ...options, method: 'GET' });
    }

    async post(url: string, data: any, options: {
        headers?: Record<string, string>;
        proxyOptions?: ProxyUrlOptions;
    } = {}): Promise<string> {
        return this.execute(url, { ...options, method: 'POST', data });
    }
}