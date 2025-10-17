import { KolScopeParser } from './kol-scope-parser';
import { Api } from 'telegram';
import { ChainsMap } from '../../../../../shared/chains';

describe('KolScopeParser', () => {
    let parser: KolScopeParser;

    beforeEach(() => {
        parser = new KolScopeParser();
    });

    describe('isTopKolsMessage', () => {
        it('should identify top KOLs messages', () => {
            const messageText = "KOLscope: Trending [ LIVE ] 🟢\n\nKOLS OF THE WEEK 💍\n\n1️⃣ @alphadragonkols 🧑‍🧒 2069X\n2️⃣ @jyue_secretbase 🧑‍🧒‍🧒 2030X";
            
            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTopKolsMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-top KOLs messages', () => {
            const messageText = "Regular message without KOLS OF THE WEEK";
            
            const mockMessage = {
                message: messageText,
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTopKolsMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseTopKolsMessage', () => {
        it('should extract KOLs of the week from message', () => {
            const messageText = `KOLscope: Trending [ LIVE ] 🟢

KOLS OF THE WEEK 💍

1️⃣ @alphadragonkols 🧑‍🧒 2069X
2️⃣ @jyue_secretbase 🧑‍🧒‍🧒 2030X
3️⃣ @arcaneapes 🧑‍🧒‍🧒 2016X
4️⃣ @avrugs 🧑‍🧒‍🧒 2003X
5️⃣ @badassalphacalls 🧑‍🧒‍🧒 2000X
6️⃣ @figo4pswhaleskall 🧑‍🧒‍🧒 1579X
7️⃣ @pumpfunnevadie 🧑‍🧒‍🧒 642X
8️⃣ @zorincalls 🧑‍🧒‍🧒 554X
9️⃣ @trendingfomo 🧑‍🧒‍🧒 417X
🔟 @flokiarmywhale 🧑‍🧒‍🧒 286X

➡️ Ecosystem

💰 SOL TRENDING

1️⃣ YZY 🔘 $400.3M
2️⃣ PUMP 🔘 $3.67B
3️⃣ CARDS 🔘 $241.6M
4️⃣ NEET 🔘 $26.2M
5️⃣ QTO 🔘 $6.5M

💰 ETH TRENDING

1️⃣ JOE 🔘 $15.8M
2️⃣ VIBESTR 🔘 $7.3M
3️⃣ EMDR 🔘 $12.3M
4️⃣ MSIA 🔘 $10.0M
5️⃣ AGF 🔘 $3.2M

💰 BSC TRENDING

1️⃣ 币安人生 🔘 $155.8M
2️⃣ 4 🔘 $173.8M
3️⃣ AB 🔘 $729.9M
4️⃣ LIGHT 🔘 $406.0M
5️⃣ TST 🔘 $21.6M

💰 BASE TRENDING

1️⃣ ZFI 🔘 $11.9M
2️⃣ OPENX 🔘 $43.6M
3️⃣ GRIPPY 🔘 $1.5M
4️⃣ UNISWAPFOUNDATION 🔘 $131K
5️⃣ COIN50 🔘 $359K

Book trending through @KOLscopeBot.`;

            const mockMessage = {
                message: messageText,
                id: 3,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const expectedKols = [
                'alphadragonkols',
                'jyue_secretbase',
                'arcaneapes',
                'avrugs',
                'badassalphacalls',
                'figo4pswhaleskall',
                'pumpfunnevadie',
                'zorincalls',
                'trendingfomo',
                'flokiarmywhale',
            ];

            expect(parser.parseTopKolsMessage(mockMessage)).toEqual(expectedKols);
        });

        it('should return empty array for message without KOLs section', () => {
            const messageText = "Regular message without KOLS section";
            
            const mockMessage = {
                message: messageText,
                id: 4,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTopKolsMessage(mockMessage)).toEqual([]);
        });
    });

    describe('isTokenUpdateMessage', () => {
        it('should identify call profit messages', () => {
            const messageText = "Call Profit: @trendingfomo hit 4x+ on $BNBROS achieving +311% gains!\n\n🔶️ $102K → $418K\n\nLeaderboard Rank: 9️⃣  \n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 5,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(true);
        });

        it('should identify DIP profit messages', () => {
            const messageText = "DIP Profit: @whaleBuyBotFree hit 3x+ on $WIZ██D achieving +227% gains!\n\n🟪 $227K DIP → $744K\n\nLeaderboard Rank: Pending  \n\n🔎 View Call❕💍 KOL Stats  \n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 6,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-token update messages', () => {
            const messageText = "Regular message without profit indicators";
            
            const mockMessage = {
                message: messageText,
                id: 7,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseTokenUpdateMessage', () => {
        it('should parse call profit message correctly', () => {
            const messageText = "Call Profit: @trendingfomo hit 4x+ on $BNBROS achieving +311% gains!\n\n🔶️ $102K → $418K\n\nLeaderboard Rank: 9️⃣  \n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 8,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTokenUpdateMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'BNBROS'
            });
        });

        it('should parse DIP profit message correctly', () => {
            const messageText = "DIP Profit: @whaleBuyBotFree hit 3x+ on $WIZ██D achieving +227% gains!\n\n🟪 $227K DIP → $744K\n\nLeaderboard Rank: Pending  \n\n🔎 View Call❕💍 KOL Stats  \n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 9,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTokenUpdateMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'WIZ██D'
            });
        });

        it('should return null for invalid message', () => {
            const mockMessage = {
                message: '',
                id: 10,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });
    });

    describe('isNewCallMessage', () => {
        it('should identify new call messages', () => {
            const messageText = "🟪 New Call: @Lutherrachcalls just called $ZEBRIGRADE at 16.1K mc.\n\n4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 11,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-new call messages', () => {
            const messageText = "Regular message without New Call";
            
            const mockMessage = {
                message: messageText,
                id: 12,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseNewCallMessage', () => {
        it('should parse Solana new call message correctly', () => {
            const messageText = "🟪 New Call: @Lutherrachcalls just called $ZEBRIGRADE at 16.1K mc.\n\n4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 13,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'ZEBRIGRADE',
                address: '4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump',
                chainId: ChainsMap.solana
            });
        });

        it('should parse BSC new call message correctly with chain ID', () => {
            const messageText = "🔶️ New Call: @ForktIsPrintsAlpha just called $🫰 at 359K mc.\n\n0xd6d4854C63055E7D0caaE22aB8c4e023104a4444\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 14,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                symbol: '🫰',
                address: '0xd6d4854C63055E7D0caaE22aB8c4e023104a4444',
                chainId: ChainsMap.bsc
            });
        });

        it('should parse EVM message without emoji using address format detection', () => {
            const messageText = "New Call: @user just called $TOKEN at 16.1K mc.\n\n0x1234567890abcdef1234567890abcdef12345678\n\nLeaderboard Rank: Pending";
            
            const mockMessage = {
                message: messageText,
                id: 15,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'TOKEN',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: undefined 
            });
        });

        it('should return null for invalid message', () => {
            const mockMessage = {
                message: '',
                id: 16,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle empty message text', () => {
            const mockMessage = {
                message: '',
                id: 16,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.parseMessage(mockMessage)).toBeNull();
        });

        it('should handle message with $ but no valid symbol', () => {
            const messageText = "Call Profit: @user hit 4x+ on $ achieving gains!";

            const mockMessage = {
                message: messageText,
                id: 17,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });

        it('should handle new call message with invalid address format', () => {
            const messageText = "🟪 New Call: @user just called $TOKEN at 16.1K mc.\n\ninvalid-address\n\nLeaderboard Rank: Pending";

            const mockMessage = {
                message: messageText,
                id: 18,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle new call message without address', () => {
            const messageText = "🟪 New Call: @user just called $TOKEN at 16.1K mc.\n\nLeaderboard Rank: Pending";

            const mockMessage = {
                message: messageText,
                id: 19,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should extract symbol with special characters and emojis', () => {
            const messageText = "Call Profit: @user hit 4x+ on $TOK3N-🚀 achieving gains!";

            const mockMessage = {
                message: messageText,
                id: 20,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTokenUpdateMessage(mockMessage);
            expect(result?.symbol).toBe('TOK3N-🚀');
        });

        it('should handle parseTopKolsMessage with incomplete KOL section', () => {
            const messageText = "KOLscope: Trending [ LIVE ] 🟢\n\nKOLS OF THE WEEK 💍\n\n1️⃣ @alphadragonkols";

            const mockMessage = {
                message: messageText,
                id: 21,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTopKolsMessage(mockMessage);
            expect(result).toEqual([]);
        });

        it('should handle parseTopKolsMessage with no @ mentions', () => {
            const messageText = "KOLscope: Trending [ LIVE ] 🟢\n\nKOLS OF THE WEEK 💍\n\n1️⃣ No mentions here\n\n➡️ Ecosystem";

            const mockMessage = {
                message: messageText,
                id: 22,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTopKolsMessage(mockMessage);
            expect(result).toEqual([]);
        });

        it('should handle undefined message property', () => {
            const mockMessage = {
                id: 23,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
            expect(parser.parseTopKolsMessage(mockMessage)).toEqual([]);
        });
    });
});