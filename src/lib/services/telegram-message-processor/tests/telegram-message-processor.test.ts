import { TelegramMessageParser } from '../telegram-message-parser';
import { TelegramMessageListener } from '../telegram-message-listener';
import { TelegramChannel } from '../types';
import channelMessages from './fixtures/channel-1556094224.json';
import channelFixture from './fixtures/channel.json';

// Mock channels data for testing
const mockChannels: TelegramChannel[] = [
    {
        id: channelFixture.id,
        title: channelFixture.title,
        username: channelFixture.username,
        type: 'megagroup',
        verified: channelFixture.verified,
        participantsCount: channelFixture.participantsCount
    }
];

describe('TelegramMessageParser', () => {
    let parser: TelegramMessageParser;

    beforeAll(() => {
        parser = new TelegramMessageParser();
    });

    it('should extract message text', () => {
        const update = channelMessages[0].update;
        const result = parser.parseMessage(update);
        expect(result).toBeDefined();
        expect(result!.text).toBe(update.message.message);
        expect(result!.text.length).toBeGreaterThan(0);
    });

    it('should extract channelId from channel messages', () => {
        const update = channelMessages[0].update;
        const result = parser.parseMessage(update);
        expect(result).toBeDefined();
        expect(result!.isChannel).toBe(true);
        expect(result!.channelId).toBe(1556094224);
    });

    it('should extract chatId from channel messages', () => {
        const update = channelMessages[0].update;
        const result = parser.parseMessage(update);
        expect(result).toBeDefined();
        expect(result!.isChannel).toBe(true);
        expect(result!.chatId).toBe(1556094224);
    });
});

describe('TelegramMessageListener', () => {
    let listener: TelegramMessageListener;

    beforeAll(() => {
        listener = new TelegramMessageListener();
        // Manually populate the channel map with fixture data for testing
        mockChannels.forEach((channel: TelegramChannel) => {
            listener['channelMap'].set(channel.id, channel);
        });
    });

    it('should load channels from fixtures', () => {
        const loadedChannels = listener.getAllChannels();
        expect(Array.isArray(loadedChannels)).toBe(true);
        expect(loadedChannels.length).toBeGreaterThan(0);
    });

    it('should get channel info by ID', () => {
        const channelId = channelFixture.id;
        const channelInfo = listener.getChannelInfo(channelId);
        expect(channelInfo).toBeDefined();
        expect(channelInfo!.title).toBe(channelFixture.title);
        expect(channelInfo!.type).toBe('megagroup');
    });

    it('should return undefined for non-existent channel', () => {
        const channelInfo = listener.getChannelInfo('999999999');
        expect(channelInfo).toBeUndefined();
    });

    it('should have channels with proper structure', () => {
        const loadedChannels = listener.getAllChannels();
        const firstChannel = loadedChannels[0];

        expect(firstChannel).toHaveProperty('id');
        expect(firstChannel).toHaveProperty('title');
        expect(firstChannel).toHaveProperty('type');
        expect(typeof firstChannel.id).toBe('string');
        expect(typeof firstChannel.title).toBe('string');
        expect(['channel', 'group', 'supergroup', 'megagroup']).toContain(firstChannel.type);
    });

    it('should extract participantsCount from channel', () => {
        const channelId = channelFixture.id;
        const channelInfo = listener.getChannelInfo(channelId);
        expect(channelInfo).toBeDefined();
        expect(channelInfo!.participantsCount).toBe(101);
    });
});
