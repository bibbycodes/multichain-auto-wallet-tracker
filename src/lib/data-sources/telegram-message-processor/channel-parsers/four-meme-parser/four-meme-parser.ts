import { Api } from "telegram";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { BaseTelegramChannelParser } from "../base-telegram-message-parser/base-telegram-message-parser";
import { ChainsMap } from "../../../../../shared/chains";

export class FourMemeParser extends BaseTelegramChannelParser {
    readonly channelId: string = '2649439684';

    // Example message format:
    // "CiciBytedanceComp (Cici)\nPair: Cici/BNB\n\nCA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444\nVolume: $0\nSearch on 𝕏\nCreated: 11s ago | Dex Paid: ❌\nMarketCap: $46,672 \nHolders: 18 | TOP 10: 56.9%\n  └12.8%| 9.3%| 8.1%| 6.1%| 4.1%| 3.7%| 3.5%| 👨‍💻3.3%| 3.2%| 2.8%\n\nCreator: 0x699EFd2d1B482c1eBCB2C5D44ceDb2857C610a4B\n ├BNB: 0.15 BNB\n └Token: 3.34%\nSocials: Website\n\nMevX | Dexscreener | Four.Meme"
    
    isNewCallMessage(message: Api.Message): boolean {
        return message.message?.includes('Pair:') && 
               message.message?.includes('CA:') && 
               message.message?.includes('MarketCap:') || false;
    }

    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract token name and symbol from "Name (Symbol)" pattern
        const nameSymbolMatch = text.match(/^([^(]+)\s*\(([^)]+)\)/);
        if (!nameSymbolMatch) return null;

        const name = nameSymbolMatch[1].trim();
        const symbol = nameSymbolMatch[2].trim();
        
        // Extract token address from "CA: 0x..." pattern
        const addressMatch = text.match(/CA:\s*(0x[a-fA-F0-9]{40})/);
        if (!addressMatch) return null;

        const address = addressMatch[1];

        // Extract pair address from "Pair: Symbol/BNB" - we'll need to construct this
        // For BSC, pair address is typically the token address itself or we can derive it
        // Since we don't have the actual pair address in the message, we'll use the token address
        const pairAddress = address;

        // Extract creator address from "Creator: 0x..." pattern
        const creatorMatch = text.match(/Creator:\s*(0x[a-fA-F0-9]{40})/);
        const createdBy = creatorMatch ? creatorMatch[1] : undefined;

        return {
            name,
            symbol,
            address,
            chainId: ChainsMap.bsc, // Always BSC for this channel
            pairAddress,
            createdBy,
        } as Partial<AutoTrackerTokenData>;
    }

    // FourMeme doesn't seem to have update messages based on the format
    isTokenUpdateMessage(message: Api.Message): boolean {
        return false;
    }

    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        return null;
    }
}
