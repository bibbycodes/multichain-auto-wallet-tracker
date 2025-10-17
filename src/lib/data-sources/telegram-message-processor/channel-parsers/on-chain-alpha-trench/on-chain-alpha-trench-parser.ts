import { Api } from "telegram/tl/api";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { isSolanaAddress } from "../../../../services/util/common";
import { ChainsMap } from "../../../../../shared/chains";
import { BaseTelegramChannelParser } from "../base-telegram-message-parser/base-telegram-message-parser";

export class OnChainAlphaTrenchParser extends BaseTelegramChannelParser {
    readonly channelId: string = '2097131181'

    // "message": "🟡🚀 #BINANCECAT (BinanceUSissuperawesomeandhaszerotradingfeesregisternow) hit 406.5% (5.1X) increase!\n\n📊 Zone 1st Ping: $240,218\n💰 Current MC: $1,216,670\n🧠 Smart Wallets: 11/17\n📈 Increase: 406.5%\n\n🔎 Search on X: #BINANCECAT\n🔗 Trade: BASED\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access",
    isTokenUpdateMessage(message: Api.Message): boolean {
        return message.message?.includes('hit') && message.message?.includes('increase') && message.message?.includes('Current MC') || false;
    }

    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract symbol from hashtag pattern like #BINANCECAT
        const symbolMatch = text.match(/#([A-Z0-9]+)/);
        if (!symbolMatch) return null;

        const symbol = symbolMatch[1];

        return {
            symbol,
        } as Partial<AutoTrackerTokenData>;
    }

    // "message": "#FRAUDCOIN\n5DZ3RW9uyTBJACXTNXdgfSZdojVRkWbUzFYW6fkEpump\n\nTRADE NOW\n\n448k, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access",
    // "message": "#TOFU\nBKRa3xQPFEN1S5kaaBNiUD3AviAL5qZNb3iHJDkTpump\n\nTRADE NOW\n\n355k, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access",
    // "message": "🟡 #BINANCEUSISSUPERAWES\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW\n\n2.9M, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access",
    isNewCallMessage(message: Api.Message): boolean {
        return message.message?.includes('TRADE NOW') && 
               (message.message?.includes('pump') || message.message?.includes('0x')) || false;
    }

    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract symbol from hashtag pattern like #FRAUDCOIN, #TOFU
        const symbolMatch = text.match(/#([A-Z0-9]+)/);
        if (!symbolMatch) return null;

        const symbol = symbolMatch[1];
        
        // Extract token address - could be Solana (base58) or Ethereum (0x)
        const addressMatch = text.match(/([A-Za-z0-9]{32,44}|0x[a-fA-F0-9]{40})/);
        if (!addressMatch) return null;

        const address = addressMatch[1];
        const chainId = isSolanaAddress(address) ? ChainsMap.solana : ChainsMap.bsc;

        return {
            symbol,
            address,
            chainId,
        } as Partial<AutoTrackerTokenData>;
    }
}