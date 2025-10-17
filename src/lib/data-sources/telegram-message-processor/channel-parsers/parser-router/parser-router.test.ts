import { TelegramParserRouter } from './parser-router';
import { Api } from 'telegram';

describe('TelegramParserRouter', () => {
    describe('parseMessage', () => {
        it('should route to OnChainAlphaTrenchParser for channel 2097131181', () => {
            const messageText = "🟡🚀 #BINANCECAT (BinanceUSissuperawesomeandhaszerotradingfeesregisternow) hit 406.5% (5.1X) increase!\n\n📊 Zone 1st Ping: $240,218\n💰 Current MC: $1,216,670\n🧠 Smart Wallets: 11/17\n📈 Increase: 406.5%\n\n🔎 Search on X: #BINANCECAT\n🔗 Trade: BASED\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);

            expect(result).not.toBeNull();
            expect(result?.symbol).toBe('BINANCECAT');
        });

        it('should route to KolScopeParser for channel 2397610468', () => {
            const messageText = "🟪 New Call: @Lutherrachcalls just called $ZEBRIGRADE at 16.1K mc.\n\n4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump\n\nLeaderboard Rank: Pending\n\n🔎 View Call❕💍 KOL Stats\n\n🆖 DM to Advertise on KOLscope ♨️";
            
            const mockMessage = {
                message: messageText,
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2397610468', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);

            expect(result).not.toBeNull();
            expect(result?.symbol).toBe('ZEBRIGRADE');
            expect(result?.address).toBe('4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump');
        });

        it('should route to BullishBscCallsParser for channel 2421215845', () => {
            const messageText = "🔔 耶稣 | $Yeshua\n\n🏦 Market Cap: 26.60K\n\n0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444\n\n🌐 WEB | 🐦 X | 💬 TG\n4️⃣ FourMeme\n\n💹 DexScreener | MevX | GMGN\n\n‼️ Dear Degen, #DYOR!";
            
            const mockMessage = {
                message: messageText,
                id: 3,
                date: 1738429976,
                peerId: { channelId: '2421215845', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('耶稣');
            expect(result?.symbol).toBe('Yeshua');
            expect(result?.address).toBe('0xcf75b6b3fe60dfd52cc3bf47c71ea3fbed754444');
        });

        it('should return null for unsupported channel', () => {
            const messageText = "Some message";
            
            const mockMessage = {
                message: messageText,
                id: 4,
                date: 1738429976,
                peerId: { channelId: '9999999999', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);

            expect(result).toBeNull();
        });

        it('should return null for non-channel message', () => {
            const messageText = "Some message";
            
            const mockMessage = {
                message: messageText,
                id: 5,
                date: 1738429976,
                peerId: { userId: '123456', className: 'PeerUser' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);

            expect(result).toBeNull();
        });
    });

    describe('parser management', () => {
        it('should add a new parser', () => {
            const mockParser = {
                channelId: '1234567890',
                parseMessage: jest.fn().mockReturnValue({ symbol: 'TEST' }),
                isTokenUpdateMessage: jest.fn().mockReturnValue(false),
                isNewCallMessage: jest.fn().mockReturnValue(false),
                parseTokenUpdateMessage: jest.fn().mockReturnValue(null),
                parseNewCallMessage: jest.fn().mockReturnValue(null),
            };

            TelegramParserRouter.addParser('1234567890', mockParser);

            const result = TelegramParserRouter.getParser('1234567890');
            expect(result).toBe(mockParser);
        });

        it('should remove a parser', () => {
            const result = TelegramParserRouter.removeParser('1234567890');
            expect(result).toBe(true);

            const parser = TelegramParserRouter.getParser('1234567890');
            expect(parser).toBeUndefined();
        });

        it('should get all parsers', () => {
            const parsers = TelegramParserRouter.getAllParsers();
            expect(parsers.size).toBeGreaterThan(0);
            expect(parsers.has('2097131181')).toBe(true);
            expect(parsers.has('2397610468')).toBe(true);
            expect(parsers.has('2421215845')).toBe(true);
        });

        it('should get supported channel IDs', () => {
            const channelIds = TelegramParserRouter.getSupportedChannelIds();
            expect(channelIds).toContain('2097131181');
            expect(channelIds).toContain('2397610468');
            expect(channelIds).toContain('2421215845');
        });
    });

    describe('edge cases', () => {
        it('should handle message with null peerId', () => {
            const mockMessage = {
                message: 'Some message',
                id: 6,
                date: 1738429976,
                peerId: null,
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);
            expect(result).toBeNull();
        });

        it('should handle message with undefined peerId', () => {
            const mockMessage = {
                message: 'Some message',
                id: 7,
                date: 1738429976,
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);
            expect(result).toBeNull();
        });

        it('should handle message with PeerUser instead of PeerChannel', () => {
            const mockMessage = {
                message: 'Some message',
                id: 8,
                date: 1738429976,
                peerId: { userId: '123456', className: 'PeerUser' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);
            expect(result).toBeNull();
        });

        it('should handle message with PeerChat', () => {
            const mockMessage = {
                message: 'Some message',
                id: 9,
                date: 1738429976,
                peerId: { chatId: '123456', className: 'PeerChat' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);
            expect(result).toBeNull();
        });

        it('should handle parser returning null', () => {
            const mockParser = {
                channelId: '9999999999',
                parseMessage: jest.fn().mockReturnValue(null),
                isTokenUpdateMessage: jest.fn().mockReturnValue(false),
                isNewCallMessage: jest.fn().mockReturnValue(false),
                parseTokenUpdateMessage: jest.fn().mockReturnValue(null),
                parseNewCallMessage: jest.fn().mockReturnValue(null),
            };

            TelegramParserRouter.addParser('9999999999', mockParser);

            const mockMessage = {
                message: 'Some message',
                id: 10,
                date: 1738429976,
                peerId: { channelId: '9999999999', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = TelegramParserRouter.parseMessage(mockMessage);
            expect(result).toBeNull();
            expect(mockParser.parseMessage).toHaveBeenCalledWith(mockMessage);

            TelegramParserRouter.removeParser('9999999999');
        });

        it('should return false when removing non-existent parser', () => {
            const result = TelegramParserRouter.removeParser('non-existent-id');
            expect(result).toBe(false);
        });

        it('should return undefined when getting non-existent parser', () => {
            const result = TelegramParserRouter.getParser('non-existent-id');
            expect(result).toBeUndefined();
        });
    });
});
