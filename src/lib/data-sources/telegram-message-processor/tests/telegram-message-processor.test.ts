import { TelegramMessageParser } from '../telegram-message-parser';
import { TelegramMessageListener } from '../telegram-message-listener';
import { TelegramChannel, TelegramUpdate } from '../types';
import channelMessages from './fixtures/channel-1556094224.json';
import channelFixture from './fixtures/channel.json';

// Mock gramjs to prevent any actual connections
jest.mock('telegram', () => ({
    TelegramClient: jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        addEventHandler: jest.fn(),
        getDialogs: jest.fn().mockResolvedValue([]),
        getEntity: jest.fn().mockResolvedValue({}),
        getMessages: jest.fn().mockResolvedValue([]),
        invoke: jest.fn().mockResolvedValue({})
    })),
    StringSession: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('telegram/sessions', () => ({
    StringSession: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('telegram/Helpers', () => ({
    TotalList: jest.fn().mockImplementation(() => [])
}));

jest.mock('telegram/tl/custom/dialog', () => ({
    Dialog: jest.fn()
}));

jest.mock('telegram/tl', () => ({
    Api: {
        channels: {
            JoinChannel: jest.fn()
        }
    }
}));

jest.mock('../../../services/util/env/env', () => ({
    env: {
        telegram: {
            sessionString: 'mock-session-string',
            apiId: 12345,
            apiHash: 'mock-api-hash'
        }
    }
}));

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
    const update: TelegramUpdate = channelMessages[0].update as unknown as TelegramUpdate;

    beforeAll(() => {
        parser = new TelegramMessageParser();
    });

    it('should extract message text', () => {
        const result = parser.parseMessage(update);
        expect(result).toBeDefined();
        expect(result!.text).toBe(update.message.message);
        expect(result!.text.length).toBeGreaterThan(0);
    });

    it('should extract channelId from channel messages', () => {
        const result = parser.parseMessage(update);
        expect(result).toBeDefined();
        expect(result!.isChannel).toBe(true);
        expect(result!.channelId).toBe(1556094224);
    });

    it('should extract chatId from channel messages', () => {
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
