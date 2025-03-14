import { BrowserType, PythonProxyOtions } from './types';
interface RequestParams {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    data?: Record<string, any>;
    proxy_options?: PythonProxyOtions;
    browser_type?: BrowserType;
}

interface ProxyResponse<T> {
    status_code: number;
    headers: Record<string, string>;
    content: T;
}

export class GeonodeServerClient {
    private readonly serverUrl: string;

    constructor(serverUrl: string = 'http://localhost:8000') {
        this.serverUrl = serverUrl;
    }

    async makeRequest<T>(params: RequestParams): Promise<ProxyResponse<T>> {
        try {
            const response = await fetch(`${this.serverUrl}/proxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to make request through proxy');
            }

            return await response.json();
        } catch (error) {
            console.error('Error making request through Geonode proxy:', error);
            throw error;
        }
    }

    async get<T>(url: string, options: Omit<RequestParams, 'url' | 'method'> = {}): Promise<ProxyResponse<T>> {
        return this.makeRequest({ ...options, url, method: 'GET' });
    }

    async post<T>(url: string, options: Omit<RequestParams, 'url' | 'method'> = {}): Promise<ProxyResponse<T>> {
        return this.makeRequest({ ...options, url, method: 'POST' });
    }

    async put<T>(url: string, options: Omit<RequestParams, 'url' | 'method'> = {}): Promise<ProxyResponse<T>> {
        return this.makeRequest({ ...options, url, method: 'PUT' });
    }

    async delete<T>(url: string, options: Omit<RequestParams, 'url' | 'method'> = {}): Promise<ProxyResponse<T>> {
        return this.makeRequest({ ...options, url, method: 'DELETE' });
    }
}