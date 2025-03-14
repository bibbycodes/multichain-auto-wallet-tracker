import { countries } from "countries-list";

export enum SessionType {
    STICKY = "sticky",
    ROTATING = "rotating"
}

export enum GatewayCountry {
    FRANCE = "france",
    UNITED_STATES = "united_states",
    SINGAPORE = "singapore"
}

export enum ProxySourceType {
    RESIDENTIAL = "residential",
    MOBILE = "mobile",
    DATA_CENTER = "datacenter"
}

export enum BrowserType {
    CHROME = "chrome",
    FIREFOX = "firefox",
    SAFARI = "safari",
    EDGE = "edge",
    OPERA = "opera",
    RANDOM = "random"
}

export type CountryCode = keyof typeof countries;

export interface PythonProxyOtions {
    country?: string;
    ip_source_type?: ProxySourceType;
    session_type?: SessionType;
    lifetime?: number;
    gateway?: GatewayCountry;
}

export interface ProxyUrlOptions {
    country?: string;
    ipSourceType?: ProxySourceType;
    sessionType?: SessionType;
    lifetime?: number;
    gateway?: GatewayCountry;
}