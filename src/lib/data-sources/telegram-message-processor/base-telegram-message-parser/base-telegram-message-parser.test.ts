
import { Api } from 'telegram';
import { AutoTrackerTokenData } from '../../../models/token/types';
import { BaseTelegramChannelParser } from '../channel-parsers/base-telegram-message-parser/base-telegram-message-parser';

// Create a concrete implementation for testing
class TestParser extends BaseTelegramChannelParser {
    readonly channelId: string = 'test-channel';

    isTokenUpdateMessage(message: Api.Message): boolean {
        return false;
    }

    isNewCallMessage(message: Api.Message): boolean {
        return false;
    }

    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        return null;
    }

    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        return null;
    }
}

describe('BaseTelegramChannelParser', () => {
    let parser: TestParser;

    beforeEach(() => {
        parser = new TestParser();
    });

    describe('extractUrls', () => {
        it('should extract URLs from message entities', () => {
            const mockMessage = {
                message: 'Check out this link: https://example.com',
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
                        url: 'https://t.me/KOLscopeBot?start=fxxdjcddmqpcblebwhs56hgmmebwegcwwa7efqfmpump',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 1,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([
                'https://t.me/KOLscopeBot?start=fxxdjcddmqpcblebwhs56hgmmebwegcwwa7efqfmpump'
            ]);
        });

        it('should extract multiple URLs from message entities', () => {
            const mockMessage = {
                message: 'Check out these links',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 10,
                        length: 5,
                        url: 'https://another.com',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 15,
                        length: 5,
                        url: 'https://example.com', // Duplicate
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 2,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([
                'https://example.com',
                'https://another.com'
            ]);
        });

        it('should return empty array when no entities', () => {
            const mockMessage = {
                message: 'No entities here',
                entities: [],
                id: 3,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([]);
        });

        it('should return empty array when entities is null or undefined', () => {
            const mockMessageNull = {
                message: 'No entities here',
                entities: null,
                id: 4,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const mockMessageUndefined = {
                message: 'No entities here',
                id: 5,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.extractUrls(mockMessageNull)).toEqual([]);
            expect(parser.extractUrls(mockMessageUndefined)).toEqual([]);
        });

        it('should ignore non-URL entities', () => {
            const mockMessage = {
                message: 'Various entities',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        className: 'MessageEntityBold'
                    },
                    {
                        offset: 5,
                        length: 5,
                        className: 'MessageEntityItalic'
                    },
                    {
                        offset: 10,
                        length: 5,
                        className: 'MessageEntityMention'
                    }
                ],
                id: 6,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([]);
        });

        it('should handle entities without url property', () => {
            const mockMessage = {
                message: 'Entity without url',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        className: 'MessageEntityTextUrl'
                        // Missing url property
                    }
                ],
                id: 7,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([]);
        });

        it('should handle entities with empty string url', () => {
            const mockMessage = {
                message: 'Entity with empty url',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: '',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 8,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([]);
        });

        it('should handle entities with non-string url', () => {
            const mockMessage = {
                message: 'Entity with non-string url',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 12345,
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 9,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual([]);
        });

        it('should extract URLs from mixed entity types', () => {
            const mockMessage = {
                message: 'Mixed entities with URLs',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        className: 'MessageEntityBold'
                    },
                    {
                        offset: 5,
                        length: 10,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 15,
                        length: 5,
                        className: 'MessageEntityItalic'
                    },
                    {
                        offset: 20,
                        length: 10,
                        url: 'https://test.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 10,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const urls = parser.extractUrls(mockMessage);

            expect(urls).toEqual(['https://example.com', 'https://test.com']);
        });
    });

    describe('extractServiceLinks', () => {
        it('should extract DexScreener URLs', () => {
            const mockMessage = {
                message: 'Check out these links',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 'https://dexscreener.com/bsc/0x1234567890abcdef1234567890abcdef12345678',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 10,
                        length: 5,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 11,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.extractServiceLinks(mockMessage);

            expect(result.dexScreenerUrls).toEqual(['https://dexscreener.com/bsc/0x1234567890abcdef1234567890abcdef12345678']);
            expect(result.scannerUrls).toEqual([]);
            expect(result.gmgnUrls).toEqual([]);
        });

        it('should extract BSCScan URLs', () => {
            const mockMessage = {
                message: 'Check out these links',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 'https://bscscan.com/tx/0x1234567890abcdef1234567890abcdef12345678',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 10,
                        length: 5,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 12,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.extractServiceLinks(mockMessage);

            expect(result.dexScreenerUrls).toEqual([]);
            expect(result.scannerUrls).toEqual(['https://bscscan.com/tx/0x1234567890abcdef1234567890abcdef12345678']);
            expect(result.gmgnUrls).toEqual([]);
        });

        it('should extract GMGN URLs', () => {
            const mockMessage = {
                message: 'Check out these links',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 'https://gmgn.ai/token/solana/4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 10,
                        length: 5,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 13,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.extractServiceLinks(mockMessage);

            expect(result.dexScreenerUrls).toEqual([]);
            expect(result.scannerUrls).toEqual([]);
            expect(result.gmgnUrls).toEqual(['https://gmgn.ai/token/solana/4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump']);
        });

        it('should extract multiple service URLs', () => {
            const mockMessage = {
                message: 'Check out these links',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 'https://dexscreener.com/bsc/0x1234567890abcdef1234567890abcdef12345678',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 10,
                        length: 5,
                        url: 'https://bscscan.com/tx/0x1234567890abcdef1234567890abcdef12345678',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 15,
                        length: 5,
                        url: 'https://gmgn.ai/token/solana/4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 20,
                        length: 5,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 14,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.extractServiceLinks(mockMessage);

            expect(result.dexScreenerUrls).toEqual(['https://dexscreener.com/bsc/0x1234567890abcdef1234567890abcdef12345678']);
            expect(result.scannerUrls).toEqual(['https://bscscan.com/tx/0x1234567890abcdef1234567890abcdef12345678']);
            expect(result.gmgnUrls).toEqual(['https://gmgn.ai/token/solana/4eQ2uN86itsMK5rtvy598TchcttxXCKh3xpXxUa2pump']);
        });

        it('should return empty arrays when no service URLs', () => {
            const mockMessage = {
                message: 'No service links',
                entities: [
                    {
                        offset: 0,
                        length: 5,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 15,
                date: 1738429976,
                peerId: { channelId: 'test-channel', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.extractServiceLinks(mockMessage);

            expect(result.dexScreenerUrls).toEqual([]);
            expect(result.scannerUrls).toEqual([]);
            expect(result.gmgnUrls).toEqual([]);
        });
    });
});
