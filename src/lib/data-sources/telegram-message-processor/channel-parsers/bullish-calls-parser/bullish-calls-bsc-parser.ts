import { Api } from "telegram";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { BaseTelegramChannelParser } from "../base-telegram-message-parser/base-telegram-message-parser";
import { DexscreenerParser } from "../../../../../utils/parsers/dexscreener/dexscreener-parser";

export class BullishBscCallsParser extends BaseTelegramChannelParser {
    readonly channelId: string = '2421215845'

    // "message": "🔔 耶稣 | $Yeshua\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!",
    // "message": "🔔 公平的鼹鼠 | $公平的鼹鼠\n\n🏦 Market Cap: 49.85K\n\n0x4444f5a24d11fb3e833ce16b099a31a286bd4566\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!",
    isNewCallMessage(message: Api.Message): boolean {
        return message.message?.includes('🔔') && message.message?.includes('Market Cap:') || false;
    }

    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract name and symbol from "🔔 name | $symbol" pattern
        const nameSymbolMatch = text.match(/🔔\s*([^|]+)\s*\|\s*\$([^\n]+)/);
        if (!nameSymbolMatch) return null;

        const name = nameSymbolMatch[1].trim();
        const symbol = nameSymbolMatch[2].trim();
        
        // Extract token address (0x format for BSC)
        const addressMatch = text.match(/(0x[a-fA-F0-9]{40})/);
        if (!addressMatch) return null;

        const address = addressMatch[1];

        return {
            name,
            symbol,
            address,
        } as Partial<AutoTrackerTokenData>;
    }

    // "message": "🚀 UPDATE\n\n✅ Token: $CAP\n🕸️ Chain:#BSC\n\n💸 2.5x From Call!\n\n🏦 MCap 18.6K ➡️ 46.4K 🤯",
    isTokenUpdateMessage(message: Api.Message): boolean {
        return message.message?.includes('🚀 UPDATE') && message.message?.includes('Token:') || false;
    }

    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract symbol from "Token: $SYMBOL" pattern
        const symbolMatch = text.match(/Token:\s*\$([^\n]+)/);
        if (!symbolMatch) return null;

        const symbol = symbolMatch[1].trim();

        return {
            symbol,
        } as Partial<AutoTrackerTokenData>;
    }
}