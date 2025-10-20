import { GoPlusRugpullDetection, GoPlusTokenSecurity, GoPlusSolanaTokenSecurity } from "python-proxy-scraper-client";

export interface GoPlusTokenDataRawData {
    tokenSecurity: GoPlusTokenSecurity | GoPlusSolanaTokenSecurity
    rugpullDetection: GoPlusRugpullDetection
}