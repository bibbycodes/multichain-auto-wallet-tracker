import { DexscreenerChain } from "../../../lib/services/apis/dexscreener/dexscreener-chain-map";
import { DexscreenerMapper } from "../../../lib/services/apis/dexscreener/dexscreener-mapper";
import { ParsedDexscreenerPairUrlData } from "./types";

export class DexscreenerParser {
    static parsePairUrl(url: string): ParsedDexscreenerPairUrlData | null {
        const regex = /https:\/\/dexscreener\.com\/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/;
        const match = url.match(regex);
        if (match) {
            try {
                return {
                    pairAddress: match[2],
                    chainId: DexscreenerMapper.chainToChainId(match[1] as DexscreenerChain),
                };
            } catch (error) {
                // Chain not supported in our mapping
                return {
                    pairAddress: match[2],
                    chainId: undefined as any,
                };
            }
        }
        return null;
    }

    static isDexScreenerUrl(url: string): boolean {
        return url.includes('https://dexscreener.com/');
    }
}

