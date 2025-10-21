import { GmGnChain } from "../../../lib/services/apis/gmgn/gmgn-chain-map";
import { GmGnMapper } from "../../../lib/services/apis/gmgn/gmgn-mapper";
import { ParsedGmGnTokenUrlData } from "./types";

export class GmGnParser {
    static parseTokenUrl(url: string): ParsedGmGnTokenUrlData | null {
        // https://gmgn.ai/bsc/token/0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a
        const regex = /https:\/\/gmgn\.ai\/([a-zA-Z0-9]+)\/token\/([a-zA-Z0-9]+)/;
        const match = url.match(regex);
        if (match) {
            return {
                tokenAddress: match[2],
                chainId: GmGnMapper.chainToChainId(match[1] as GmGnChain),
            };
        }
        return null;
    }

    static isGmGnUrl(url: string): boolean {
        return url.includes('https://gmgn.ai/');
    }
}