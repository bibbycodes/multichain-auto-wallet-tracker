import { BullishBscCallsParser } from './bullish-calls-bsc-parser';
import { Api } from 'telegram';

describe('BullishBscCallsParser', () => {
    let parser: BullishBscCallsParser;

    beforeEach(() => {
        parser = new BullishBscCallsParser();
    });

    describe('isNewCallMessage', () => {
        it('should identify new call messages', () => {
            const messageText = "🔔 耶稣 | $Yeshua\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!";
            
            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-new call messages', () => {
            const messageText = "Regular message without 🔔 and Market Cap";
            
            const mockMessage = {
                message: messageText,
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseNewCallMessage', () => {
        it('should parse Chinese new call message correctly', () => {
            const messageText = "🔔 耶稣 | $Yeshua\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!";
            
            const mockMessage = {
                message: messageText,
                entities: [
                    {
                        offset: 0,
                        length: 2,
                        className: 'MessageEntityCustomEmoji'
                    },
                    {
                        offset: 3,
                        length: 9,
                        className: 'MessageEntityBold'
                    },
                    {
                        offset: 13,
                        length: 15,
                        className: 'MessageEntityMention'
                    },
                    {
                        offset: 41,
                        length: 2,
                        url: 'https://dexscreener.com/bsc/0x1234567890abcdef1234567890abcdef12345678',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 3,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: '耶稣',
                symbol: 'Yeshua',
                address: '0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444'
            });
        });

        it('should parse Chinese mole new call message correctly', () => {
            const messageText = "🔔 公平的鼹鼠 | $公平的鼹鼠\n\n🏦 Market Cap: 49.85K\n\n0x4444f5a24d11fb3e833ce16b099a31a286bd4566\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!";
            
            const mockMessage = {
                message: messageText,
                entities: [
                    {
                        offset: 0,
                        length: 2,
                        className: 'MessageEntityCustomEmoji'
                    },
                    {
                        offset: 3,
                        length: 9,
                        className: 'MessageEntityBold'
                    },
                    {
                        offset: 13,
                        length: 15,
                        className: 'MessageEntityMention'
                    },
                    {
                        offset: 41,
                        length: 2,
                        url: 'https://dexscreener.com/bsc/0xabcdef1234567890abcdef1234567890abcdef12',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 4,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: '公平的鼹鼠',
                symbol: '公平的鼹鼠',
                address: '0x4444f5a24d11fb3e833ce16b099a31a286bd4566'
            });
        });

        it('should parse message with non-DexScreener URLs', () => {
            const messageText = "🔔 TestToken | $TEST\n\n🏦 Market Cap: 10.00K\n\n0x1234567890abcdef1234567890abcdef12345678\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!";
            
            const mockMessage = {
                message: messageText,
                entities: [
                    {
                        offset: 0,
                        length: 2,
                        className: 'MessageEntityCustomEmoji'
                    },
                    {
                        offset: 3,
                        length: 9,
                        className: 'MessageEntityBold'
                    },
                    {
                        offset: 13,
                        length: 15,
                        className: 'MessageEntityMention'
                    },
                    {
                        offset: 41,
                        length: 2,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 5,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'TestToken',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678'
            });
        });

        it('should return null for invalid message', () => {
            const mockMessage = {
                message: '',
                id: 6,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });
    });

    describe('isTokenUpdateMessage', () => {
        it('should identify token update messages', () => {
            const messageText = "🚀 UPDATE\n\n✅ Token: $CAP\n🕸️ Chain:#BSC\n\n💸 2.5x From Call!\n\n🏦 MCap 18.6K ➡️ 46.4K 🤯";
            
            const mockMessage = {
                message: messageText,
                id: 6,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-token update messages', () => {
            const messageText = "Regular message without UPDATE and Token";
            
            const mockMessage = {
                message: messageText,
                id: 7,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseTokenUpdateMessage', () => {
        it('should parse token update message correctly', () => {
            const messageText = "🚀 UPDATE\n\n✅ Token: $CAP\n🕸️ Chain:#BSC\n\n💸 2.5x From Call!\n\n🏦 MCap 18.6K ➡️ 46.4K 🤯";
            
            const mockMessage = {
                message: messageText,
                id: 8,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTokenUpdateMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'CAP'
            });
        });

        it('should return null for invalid message', () => {
            const mockMessage = {
                message: '',
                id: 9,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle empty message text', () => {
            const mockMessage = {
                message: '',
                id: 10,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.parseMessage(mockMessage)).toBeNull();
        });

        it('should handle new call message without pipe separator', () => {
            const messageText = "🔔 耶稣 $Yeshua\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444";

            const mockMessage = {
                message: messageText,
                id: 11,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle new call message without address', () => {
            const messageText = "🔔 耶稣 | $Yeshua\n\n🏦 Market Cap: 26.60K\n\nNo address here";

            const mockMessage = {
                message: messageText,
                id: 12,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle new call message with invalid address format', () => {
            const messageText = "🔔 耶稣 | $Yeshua\n\n🏦 Market Cap: 26.60K\n\n0xINVALID";

            const mockMessage = {
                message: messageText,
                id: 13,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle token update message without symbol', () => {
            const messageText = "🚀 UPDATE\n\n✅ Token: \n🕸️ Chain:#BSC\n\n💸 2.5x From Call!";

            const mockMessage = {
                message: messageText,
                id: 14,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });

        it('should handle new call with special characters in name and symbol', () => {
            const messageText = "🔔 特殊字符@#$ | $SPEC!AL\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444";

            const mockMessage = {
                message: messageText,
                id: 15,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);
            expect(result?.name).toBe('特殊字符@#$');
            expect(result?.symbol).toBe('SPEC!AL');
        });

        it('should handle message with multiple addresses and extract first valid one', () => {
            const messageText = "🔔 Token | $SYM\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444\n0x1234567890123456789012345678901234567890";

            const mockMessage = {
                message: messageText,
                id: 16,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);
            expect(result?.address).toBe('0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444');
        });

        it('should handle undefined message property', () => {
            const mockMessage = {
                id: 17,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });
    });
});
