import { Api } from "telegram";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { isSolanaAddress } from "../../../../services/util/common";
import { ChainId, ChainsMap } from "../../../../../shared/chains";
import { BaseTelegramChannelParser } from "../base-telegram-message-parser/base-telegram-message-parser";
import { ContractAddressExtractor } from "../../../../services/contract-address-extractor";

export class KolScopeParser extends BaseTelegramChannelParser {
    readonly channelId: string = '2397610468'
    // "message": "KOLscope: Trending [ LIVE ] 🟢\n\nKOLS OF THE WEEK 💍\n\n1️⃣ @alphadragonkols 🧑‍🧒 2069X\n2️⃣ @jyue_secretbase 🧑‍🧒‍🧒 2030X\n3️⃣ @arcaneapes 🧑‍🧒‍🧒 2016X\n4️⃣ @avrugs 🧑‍🧒‍🧒 2003X\n5️⃣ @badassalphacalls 🧑‍🧒‍🧒 2000X\n6️⃣ @figo4pswhaleskall 🧑‍🧒‍🧒 1579X\n7️⃣ @pumpfunnevadie 🧑‍🧒‍🧒 642X\n8️⃣ @zorincalls 🧑‍🧒‍🧒 554X\n9️⃣ @trendingfomo 🧑‍🧒‍🧒 417X\n🔟 @flokiarmywhale 🧑‍🧒‍🧒 286X\n\n➡️ Ecosystem\n\n💰 SOL TRENDING\n\n1️⃣ YZY 🔘 $400.3M\n2️⃣ PUMP 🔘 $3.67B\n3️⃣ CARDS 🔘 $241.6M\n4️⃣ NEET 🔘 $26.2M\n5️⃣ QTO 🔘 $6.5M\n\n💰 ETH TRENDING\n\n1️⃣ JOE 🔘 $15.8M\n2️⃣ VIBESTR 🔘 $7.3M\n3️⃣ EMDR 🔘 $12.3M\n4️⃣ MSIA 🔘 $10.0M\n5️⃣ AGF 🔘 $3.2M\n\n💰 BSC TRENDING\n\n1️⃣ 币安人生 🔘 $155.8M\n2️⃣ 4 🔘 $173.8M\n3️⃣ AB 🔘 $729.9M\n4️⃣ LIGHT 🔘 $406.0M\n5️⃣ TST 🔘 $21.6M\n\n💰 BASE TRENDING\n\n1️⃣ ZFI 🔘 $11.9M\n2️⃣ OPENX 🔘 $43.6M\n3️⃣ GRIPPY 🔘 $1.5M\n4️⃣ UNISWAPFOUNDATION 🔘 $131K\n5️⃣ COIN50 🔘 $359K\n\nBook trending through @KOLscopeBot.",
    parseTopKolsMessage(message: Api.Message): string[] {
        if (!message.message) {
            return [];
        }

        const text = message.message;
        const kolsSectionMatch = text.match(/KOLS OF THE WEEK 💍\n\n([\s\S]*?)\n\n➡️ Ecosystem/);
        
        if (!kolsSectionMatch) {
            return [];
        }

        const kolsSection = kolsSectionMatch[1];
        const kolMatches = kolsSection.match(/@(\w+)/g);
        
        if (!kolMatches) {
            return [];
        }

        return [...new Set(kolMatches.map(match => match.substring(1)))];
    }

    isTopKolsMessage(message: Api.Message): boolean {
        return message.message?.includes('KOLS OF THE WEEK 💍');
    }

    // "message": "Call Profit: @trendingfomo hit 4x+ on $BNBROS achieving +311% gains!\n\n🔶️ $102K → $418K\n\nLeaderboard Rank: 9️⃣  \n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️",
    isTokenUpdateMessage(message: Api.Message): boolean {
        return message.message?.includes('Call Profit:') || message.message?.includes('DIP Profit:') || false;
    }

    // "message": "🟪 New Call: @Lutherrachcalls just called $ZEBRIGRADE at 16.1K mc.\n\n4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️",
    // "message": "🔶️ New Call: @ForktIsPrintsAlpha just called $🫰 at 359K mc.\n\n0xd6d4854C63055E7D0caaE22aB8c4e023104a4444\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️",
    isNewCallMessage(message: Api.Message): boolean {
        return message.message?.includes('New Call:') || false;
    }

    // "message": "Call Profit: @trendingfomo hit 4x+ on $BNBROS achieving +311% gains!\n\n🔶️ $102K → $418K\n\nLeaderboard Rank: 9️⃣  \n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️",
    // "message": "DIP Profit: @whaleBuyBotFree hit 3x+ on $WIZ██D achieving +227% gains!\n\n🟪 $227K DIP → $744K\n\nLeaderboard Rank: Pending  \n\n🔎 View Call❕💍 KOL Stats  \n\n🆖 DM to Advertise on KOLscope ♨️",
    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract symbol from $SYMBOL pattern (including emojis)
        const symbolMatch = text.match(/\$([^\s\n]+)/);
        if (!symbolMatch) return null;

        const symbol = symbolMatch[1];

        return {
            symbol,
        } as Partial<AutoTrackerTokenData>;
    }

    // "message": "🟪 New Call: @Lutherrachcalls just called $ZEBRIGRADE at 16.1K mc.\n\n4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️",
    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;
        
        // Extract symbol from $SYMBOL pattern (including emojis)
        const symbolMatch = text.match(/\$([^\s\n]+)/);
        if (!symbolMatch) return null;

        const symbol = symbolMatch[1];
        
        // Extract token address - could be Solana (base58) or Ethereum (0x)
        const addresses = ContractAddressExtractor.extractAllContractAddresses(text);

        let address: string | null = null;
        let chainId: ChainId | undefined = undefined;
        const {
            evm,
            solana,
        } = addresses;

        if (evm.length > 0) {
            address = evm[0];
        } else if (solana.length > 0) {
            address = solana[0];
        } else {
            return null;
        }
        
        if (isSolanaAddress(address)) {
            chainId = ChainsMap.solana;
        } else {
            chainId = this.extractChainId(text) || undefined
        }

        const result: Partial<AutoTrackerTokenData> = {
            symbol,
            address,
            chainId: chainId || undefined,
        };

        return result;
    }

    private extractChainId(messageText: string): ChainId | null {
        // Check for Solana emoji (🟪)
        if (messageText.includes('🟪')) {
            return ChainsMap.solana;
        }
        
        // Check for BSC emoji (🔶 or 🔶️)
        if (messageText.includes('🔶')) {
            return ChainsMap.bsc;
        }
        
        return null;
    }

}