import { BscHouseSignalVipParser } from './bschouse-signal-vip-parser';
import { Api } from 'telegram';
import { ChainsMap } from '../../../../../shared/chains';
import fixture8641 from '../../../../../../tests/fixtures/tg-updates/bschouse-signal-vip/8641.json';
import fixture8640 from '../../../../../../tests/fixtures/tg-updates/bschouse-signal-vip/8640.json';

describe('BscHouseSignalVipParser', () => {
    let parser: BscHouseSignalVipParser;

    beforeEach(() => {
        parser = new BscHouseSignalVipParser();
    });

    describe('isNewCallMessage', () => {
        it('should identify new call messages', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: openai mascot\n➡️ TICKER: Froge\n➡️ CHAIN: bsc\n➡️ MC: 49.55K\n\n➡️ CA:\n0x444401802C4eD91211b2ffdceb58C1F934f56783\n\n🌐 Website\n\n📈 Chart | Mevx Chart";

            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(true);
        });

        it('should not identify non-new call messages', () => {
            const messageText = "Regular message without NEW CALL";

            const mockMessage = {
                message: messageText,
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });

        it('should handle undefined message', () => {
            const mockMessage = {
                id: 3,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseNewCallMessage', () => {
        it('should parse BSC new call message correctly', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: openai mascot\n➡️ TICKER: Froge\n➡️ CHAIN: bsc\n➡️ MC: 49.55K\n\n➡️ CA:\n0x444401802C4eD91211b2ffdceb58C1F934f56783\n\n🌐 Website\n\n📈 Chart | Mevx Chart";

            const mockMessage = {
                message: messageText,
                id: 4,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'openai mascot',
                symbol: 'Froge',
                address: '0x444401802C4eD91211b2ffdceb58C1F934f56783',
                chainId: ChainsMap.bsc,
                socials: {}
            });
        });

        it('should parse Ethereum new call message correctly', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: eth\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678\n\n🌐 Website\n\n📈 Chart";

            const mockMessage = {
                message: messageText,
                id: 5,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Test Token',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: ChainsMap.ethereum,
                socials: {}
            });
        });

        it('should parse Ethereum new call message with "ethereum" chain name', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: ethereum\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 6,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result?.chainId).toBe(ChainsMap.ethereum);
        });


        it('should parse Base new call message correctly', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Base Token\n➡️ TICKER: BASETEST\n➡️ CHAIN: base\n➡️ MC: 75K\n\n➡️ CA:\n0xabcdef1234567890abcdef1234567890abcdef12\n\n🌐 Website";

            const mockMessage = {
                message: messageText,
                id: 9,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Base Token',
                symbol: 'BASETEST',
                address: '0xabcdef1234567890abcdef1234567890abcdef12',
                chainId: ChainsMap.base,
                socials: {}
            });
        });

        it('should handle message without TOKEN field', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TICKER: Froge\n➡️ CHAIN: bsc\n➡️ MC: 49.55K\n\n➡️ CA:\n0x444401802C4eD91211b2ffdceb58C1F934f56783";

            const mockMessage = {
                message: messageText,
                id: 10,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                symbol: 'Froge',
                address: '0x444401802C4eD91211b2ffdceb58C1F934f56783',
                chainId: ChainsMap.bsc,
                socials: {}
            });
        });

        it('should handle message with unknown chain', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: unknown\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 11,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Test Token',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: undefined,
                socials: {}
            });
        });

        it('should return null when TICKER is missing', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 12,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toBeNull();
        });

        it('should return null when contract address is missing', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K";

            const mockMessage = {
                message: messageText,
                id: 13,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toBeNull();
        });

        it('should return null when message is empty', () => {
            const mockMessage = {
                message: '',
                id: 14,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toBeNull();
        });

        it('should return null when message is undefined', () => {
            const mockMessage = {
                id: 15,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toBeNull();
        });

        it('should handle contract address on same line as CA label', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA: 0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 16,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Test Token',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: ChainsMap.bsc,
                socials: {}
            });
        });

        it('should handle ticker with special characters', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST-123\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 17,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result?.symbol).toBe('TEST-123');
        });

        it('should handle token name with emojis', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: 🚀 Rocket Token 🚀\n➡️ TICKER: ROCKET\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 18,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result?.name).toBe('🚀 Rocket Token 🚀');
        });

        it('should extract first EVM address when multiple addresses are present', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Multi Chain\n➡️ TICKER: MULTI\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678\n0xabcdef1234567890abcdef1234567890abcdef12";

            const mockMessage = {
                message: messageText,
                id: 19,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result?.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
        });

        it('should handle chain value with different casing', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: BSC\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 20,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result?.chainId).toBe(ChainsMap.bsc);
        });

        it('should handle message without CHAIN field', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 21,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Test Token',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: undefined,
                socials: {}
            });
        });
    });

    describe('edge cases', () => {
        it('should handle whitespace variations in field values', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN:   Test Token   \n➡️ TICKER:   TEST   \n➡️ CHAIN:   bsc   \n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 22,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Test Token',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: ChainsMap.bsc,
                socials: {}
            });
        });

        it('should handle invalid contract address format', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\ninvalid-address";

            const mockMessage = {
                message: messageText,
                id: 23,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toBeNull();
        });
    });

    describe('extractSocialLinks', () => {
        it('should extract website and twitter URLs from entities', () => {
            const mockMessage = fixture8641.message as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({
                website: 'https://www.boredbinanceclub.com/',
                twitter: 'https://x.com/boredbinance'
            });
        });

        it('should extract only website URL when X is not present', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678\n\n🌐 Website";

            const mockMessage = {
                message: messageText,
                id: 24,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message',
                entities: [
                    {
                        offset: 134,
                        length: 7,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    }
                ]
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({
                website: 'https://example.com'
            });
        });

        it('should extract only twitter URL when Website is not present', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678\n\n🔗 X";

            const mockMessage = {
                message: messageText,
                id: 25,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message',
                entities: [
                    {
                        offset: 134,
                        length: 1,
                        url: 'https://x.com/test',
                        className: 'MessageEntityTextUrl'
                    }
                ]
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({
                twitter: 'https://x.com/test'
            });
        });

        it('should return empty object when no entities are present', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 26,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({});
        });

        it('should return empty object when message is undefined', () => {
            const mockMessage = {
                id: 27,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({});
        });

        it('should ignore non-TextUrl entities', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678";

            const mockMessage = {
                message: messageText,
                id: 28,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message',
                entities: [
                    {
                        offset: 3,
                        length: 8,
                        className: 'MessageEntityBold'
                    },
                    {
                        offset: 96,
                        length: 42,
                        className: 'MessageEntityCode'
                    }
                ]
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({});
        });

        it('should extract Telegram link from TG text', () => {
            const mockMessage = fixture8640.message as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({
                telegram: 'https://t.me/CCDAO_CC',
                twitter: 'https://x.com/Michael198341'
            });
        });

        it('should extract only Telegram link when other socials are not present', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678\n\n✅ TG";

            const mockMessage = {
                message: messageText,
                id: 29,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message',
                entities: [
                    {
                        offset: 133,
                        length: 2,
                        url: 'https://t.me/testchannel',
                        className: 'MessageEntityTextUrl'
                    }
                ]
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({
                telegram: 'https://t.me/testchannel'
            });
        });

        it('should extract all three social links (website, telegram, twitter)', () => {
            const messageText = "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: Test Token\n➡️ TICKER: TEST\n➡️ CHAIN: bsc\n➡️ MC: 100K\n\n➡️ CA:\n0x1234567890abcdef1234567890abcdef12345678\n\n🌐 Website | ✅ TG | 🔗 X";

            const mockMessage = {
                message: messageText,
                id: 30,
                date: 1738429976,
                peerId: { channelId: '2312141364', className: 'PeerChannel' },
                className: 'Message',
                entities: [
                    {
                        offset: 134,
                        length: 7,
                        url: 'https://example.com',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 146,
                        length: 2,
                        url: 'https://t.me/testchannel',
                        className: 'MessageEntityTextUrl'
                    },
                    {
                        offset: 154,
                        length: 1,
                        url: 'https://x.com/test',
                        className: 'MessageEntityTextUrl'
                    }
                ]
            } as unknown as Api.Message;

            const socials = parser.extractSocialLinks(mockMessage);

            expect(socials).toEqual({
                website: 'https://example.com',
                telegram: 'https://t.me/testchannel',
                twitter: 'https://x.com/test'
            });
        });
    });

    describe('parseNewCallMessage with fixture', () => {
        it('should parse real fixture 8641 correctly including socials (website and twitter)', () => {
            const mockMessage = fixture8641.message as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Bored Binance Club',
                symbol: 'BBC',
                address: '0xc85Db6914B5fC816Acd7901FA74Bd7e1c1A44444',
                chainId: ChainsMap.bsc,
                socials: {
                    website: 'https://www.boredbinanceclub.com/',
                    twitter: 'https://x.com/boredbinance'
                }
            });
        });

        it('should parse real fixture 8640 correctly including socials (telegram and twitter)', () => {
            const mockMessage = fixture8640.message as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'CCDS',
                symbol: 'CCDS',
                address: '0x271b70f71C46bc76482ad7976B3173Bcb2A14F60',
                chainId: ChainsMap.bsc,
                socials: {
                    telegram: 'https://t.me/CCDAO_CC',
                    twitter: 'https://x.com/Michael198341'
                }
            });
        });
    });
});
