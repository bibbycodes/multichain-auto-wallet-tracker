import { ChainsMap } from "../../../shared/chains";
import { ParsedBscscanAddressUrlData, ParsedBscscanTokenUrlData } from "./types";

export class BscscanParser {
    static parseAddressUrl(url: string): ParsedBscscanAddressUrlData | null {
        // https://bscscan.com/address/0x36a2f74b4ecc8d0a832c18cfcfffe01904d70095
        const regex = /https:\/\/bscscan\.com\/address\/([a-zA-Z0-9]+)/;
        const match = url.match(regex);
        if (match) {
            return {
                address: match[1],
                chainId: ChainsMap.bsc,
            };
        }
        return null;
    }

    static parseTokenUrl(url: string): ParsedBscscanTokenUrlData | null {
        // https://bscscan.com/token/0x2170ed0880ac9a755fd29b2688956bd959f933f8
        const regex = /https:\/\/bscscan\.com\/token\/([a-zA-Z0-9]+)/;
        const match = url.match(regex);
        if (match) {
            return {
                tokenAddress: match[1],
                chainId: ChainsMap.bsc,
            };
        }
        return null;
    }

    static isBscscanUrl(url: string): boolean {
        return url.includes('https://bscscan.com/');
    }
}

