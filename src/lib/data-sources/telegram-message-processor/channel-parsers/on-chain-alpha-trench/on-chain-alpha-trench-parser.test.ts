import { ChainsMap } from '../../../../../shared/chains';
import { OnChainAlphaTrenchParser } from './on-chain-alpha-trench-parser';
import { Api } from 'telegram/tl/api';

describe('OnChainAlphaTrenchParser', () => {
    let parser: OnChainAlphaTrenchParser;

    beforeEach(() => {
        parser = new OnChainAlphaTrenchParser();
    });

    describe('isTokenUpdateMessage', () => {
        it('should identify token update messages', () => {
            const messageText = "🟡🚀 #BINANCECAT (BinanceUSissuperawesomeandhaszerotradingfeesregisternow) hit 406.5% (5.1X) increase!\n\n📊 Zone 1st Ping: $240,218\n💰 Current MC: $1,216,670\n🧠 Smart Wallets: 11/17\n📈 Increase: 406.5%\n\n🔎 Search on X: #BINANCECAT\n🔗 Trade: BASED\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-token update messages', () => {
            const messageText = "Regular message without token update indicators";
            
            const mockMessage = {
                message: messageText,
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseTokenUpdateMessage', () => {
        it('should parse token update message correctly', () => {
            const messageText = "🟡🚀 #BINANCECAT (BinanceUSissuperawesomeandhaszerotradingfeesregisternow) hit 406.5% (5.1X) increase!\n\n📊 Zone 1st Ping: $240,218\n💰 Current MC: $1,216,670\n🧠 Smart Wallets: 11/17\n📈 Increase: 406.5%\n\n🔎 Search on X: #BINANCECAT\n🔗 Trade: BASED\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseTokenUpdateMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'BINANCECAT',
            });
        });

        it('should return null for invalid message', () => {
            const mockMessage = {
                message: '',
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });
    });

    describe('isNewCallMessage', () => {
        it('should identify new call messages with Solana address', () => {
            const messageText = "#FRAUDCOIN\n5DZ3RW9uyTBJACXTNXdgfSZdojVRkWbUzFYW6fkEpump\n\nTRADE NOW\n\n448k, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 3,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(true);
        });

        it('should identify new call messages with EVM address', () => {
            const messageText = "🟡 #BINANCEUSISSUPERAWES\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW\n\n2.9M, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 4,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-new call messages', () => {
            const messageText = "Regular message without TRADE NOW";
            
            const mockMessage = {
                message: messageText,
                id: 5,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseNewCallMessage', () => {
        it('should parse Solana new call message correctly', () => {
            const messageText = "#TOFU\nBKRa3xQPFEN1S5kaaBNiUD3AviAL5qZNb3iHJDkTpump\n\nTRADE NOW\n\n355k, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 6,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'TOFU',
                address: 'BKRa3xQPFEN1S5kaaBNiUD3AviAL5qZNb3iHJDkTpump',
                chainId: ChainsMap.solana
            });
        });

        it('should parse Ethereum new call message correctly', () => {
            const messageText = "🟡 #BINANCEUSISSUPERAWES\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW\n\n2.9M, 2x up in the zone, Please DYOR it's NFA\n\nFor first Calls with Data Tools, Join the Zone - Use @zonepaymentbot for access";
            
            const mockMessage = {
                message: messageText,
                id: 7,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'BINANCEUSISSUPERAWES',
                address: '0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb',
                chainId: ChainsMap.bsc
            });
        });

        it('should return null for invalid message', () => {
            const mockMessage = {
                message: '',
                id: 8,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle empty message text', () => {
            const mockMessage = {
                message: '',
                id: 9,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.parseMessage(mockMessage)).toBeNull();
        });

        it('should handle message with hashtag but no address', () => {
            const messageText = "#TOKEN\n\nTRADE NOW\n\n448k, 2x up in the zone";

            const mockMessage = {
                message: messageText,
                id: 10,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle message without hashtag', () => {
            const messageText = "TOKEN\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW";

            const mockMessage = {
                message: messageText,
                id: 11,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle message with lowercase hashtag', () => {
            const messageText = "#token\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW";

            const mockMessage = {
                message: messageText,
                id: 12,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle message with multiple hashtags and extract first', () => {
            const messageText = "#FIRST #SECOND\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW";

            const mockMessage = {
                message: messageText,
                id: 13,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);
            expect(result?.symbol).toBe('FIRST');
        });

        it('should handle token update message without hashtag', () => {
            const messageText = "BINANCECAT hit 406.5% (5.1X) increase!\n\nCurrent MC: $1,216,670";

            const mockMessage = {
                message: messageText,
                id: 14,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });

        it('should correctly identify Solana addresses', () => {
            const messageText = "#TOKEN\nBKRa3xQPFEN1S5kaaBNiUD3AviAL5qZNb3iHJDkTpump\n\nTRADE NOW";

            const mockMessage = {
                message: messageText,
                id: 15,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);
            expect(result?.chainId).toBe(ChainsMap.solana);
        });

        it('should correctly identify BSC addresses', () => {
            const messageText = "#TOKEN\n0x4444854e2480f5c79aae6e5bfe1ec139d63c9ddb\n\nTRADE NOW";

            const mockMessage = {
                message: messageText,
                id: 16,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);
            expect(result?.chainId).toBe(ChainsMap.bsc);
        });

        it('should handle message with invalid address format', () => {
            const messageText = "#TOKEN\ninvalidaddress\n\nTRADE NOW";

            const mockMessage = {
                message: messageText,
                id: 17,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle undefined message property', () => {
            const mockMessage = {
                id: 18,
                date: 1738429976,
                peerId: { channelId: '2097131181', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });
    });
});
