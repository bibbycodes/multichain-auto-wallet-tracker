import puppeteer from 'puppeteer';
import { GeonodeFetcher } from '../geonode/geonode-fetcher';

interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
}

interface CookieManagerOptions {
    domain: string;
    cookieNames: string[];
    refreshInterval: number;
    proxyOptions?: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
}

export class CookieManager {
    private readonly options: CookieManagerOptions;
    private cookies: Cookie[] | null = null;
    private lastFetchTime: number = 0;
    private readonly DEFAULT_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

    constructor(options: CookieManagerOptions) {
        this.options = {
            ...options,
            refreshInterval: options.refreshInterval || this.DEFAULT_REFRESH_INTERVAL
        };
    }

    private async fetchCookiesWithPuppeteer(): Promise<Cookie[]> {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        try {
            const page = await browser.newPage();

            // Set up proxy if provided
            if (this.options.proxyOptions) {
                await page.authenticate({
                    username: this.options.proxyOptions.username,
                    password: this.options.proxyOptions.password
                });
            }

            // Set user agent
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');

            // Visit the page
            await page.goto(`https://${this.options.domain}`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for Cloudflare challenge to complete
            await page.waitForFunction(() => {
                return !document.querySelector('#challenge-form') && 
                       !document.querySelector('#challenge-running');
            }, { timeout: 30000 });

            // Get all cookies
            const cookies = await page.cookies();
            
            // Filter for the cookies we want
            const filteredCookies = cookies.filter(cookie => 
                this.options.cookieNames.includes(cookie.name)
            );

            if (filteredCookies.length !== this.options.cookieNames.length) {
                throw new Error(`Failed to fetch all required cookies. Expected ${this.options.cookieNames.length}, got ${filteredCookies.length}`);
            }

            return filteredCookies;
        } finally {
            await browser.close();
        }
    }

    async getCookies(): Promise<Cookie[]> {
        const now = Date.now();
        
        // If we have valid cookies and they're not expired, return them
        if (this.cookies && (now - this.lastFetchTime) < this.options.refreshInterval) {
            return this.cookies;
        }

        // Otherwise, fetch new cookies
        this.cookies = await this.fetchCookiesWithPuppeteer();
        this.lastFetchTime = now;
        return this.cookies;
    }

    getCookieHeader(): string {
        if (!this.cookies) {
            throw new Error('Cookies not initialized. Call getCookies() first.');
        }
        return this.cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
    }

    // Helper method to create a Cloudflare-specific cookie manager
    static createCloudflareManager(domain: string, proxyOptions?: {
        host: string;
        port: number;
        username: string;
        password: string;
    }): CookieManager {
        return new CookieManager({
            domain,
            cookieNames: ['__cf_bm', 'cf_clearance'],
            refreshInterval: 30 * 60 * 1000, // 30 minutes
            proxyOptions
        });
    }
} 