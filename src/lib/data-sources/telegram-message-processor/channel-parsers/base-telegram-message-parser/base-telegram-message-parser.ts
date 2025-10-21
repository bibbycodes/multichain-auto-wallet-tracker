import { Api } from "telegram";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { DexscreenerParser } from "../../../../../utils/parsers/dexscreener/dexscreener-parser";
import { GmGnParser } from "../../../../../utils/parsers/gmgn/gmgn-parser";
import { BscscanParser } from "../../../../../utils/parsers/bscscan/bscscan-parser";

export interface TelegramChannelParser {
    readonly channelId: string;
    parseMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null;
    isTokenUpdateMessage(message: Api.Message): boolean;
    isNewCallMessage(message: Api.Message): boolean;
    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null;
    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null;
}

export abstract class BaseTelegramChannelParser implements TelegramChannelParser {
    abstract readonly channelId: string;

    parseMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (this.isTokenUpdateMessage(message)) {
            return this.parseTokenUpdateMessage(message);
        }
        
        if (this.isNewCallMessage(message)) {
            return this.parseNewCallMessage(message);
        }
        
        return null;
    }

    /**
     * Extract URLs from a message object by parsing entities
     * @param message - The Telegram message object
     * @returns Array of URLs found in the message entities
     */
    extractUrls(message: Api.Message): string[] {
        if (!message.entities || !Array.isArray(message.entities)) {
            return [];
        }

        const urls: string[] = [];
        
        for (const entity of message.entities) {
            if (entity.className === 'MessageEntityTextUrl' && 'url' in entity) {
                const url = (entity as any).url;
                if (url && typeof url === 'string') {
                    urls.push(url);
                }
            }
        }
        
        return [...new Set(urls)]; // Remove duplicates
    }

    extractServiceLinks(message: Api.Message): {dexScreenerUrls: string[], scannerUrls: string[], gmgnUrls: string[]} {
        const urls = this.extractUrls(message);
        const dexScreenerUrls = urls.filter(url => DexscreenerParser.isDexScreenerUrl(url));
        const bscscanUrls = urls.filter(url => BscscanParser.isBscscanUrl(url));
        const gmgnUrls = urls.filter(url => GmGnParser.isGmGnUrl(url));
        return {
            dexScreenerUrls,
            scannerUrls: bscscanUrls,
            gmgnUrls,
        }
    }

    abstract isTokenUpdateMessage(message: Api.Message): boolean;
    abstract isNewCallMessage(message: Api.Message): boolean;
    abstract parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null;
    abstract parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null;
}
