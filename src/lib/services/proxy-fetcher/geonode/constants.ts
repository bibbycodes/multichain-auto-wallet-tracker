import { GatewayCountry, PythonProxyOtions, ProxySourceType, SessionType } from "./types";

export const DEFAULT_PROXY_OPTIONS: PythonProxyOtions = {
    country: "US",
    ip_source_type: ProxySourceType.RESIDENTIAL,
    session_type: SessionType.ROTATING,
    lifetime: 5,
    gateway: GatewayCountry.UNITED_STATES
}

export const supportedCountries = [
    "US",
    "FR",
    "SG",
    "DE",
    "GB",
    "CA",
    "AU",
    "JP",
    "HK",
    "NZ",
    "MX",
    "BR",
    "AR",
] as string[];