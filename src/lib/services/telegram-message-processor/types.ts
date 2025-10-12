export interface TelegramChannel {
    id: string;
    title?: string;
    username?: string | null;
    type: 'channel' | 'group' | 'supergroup' | 'megagroup';
    verified?: boolean;
    participantsCount?: number;
}

export interface TelegramMessageData {
    text: string;
    channelId?: string | number;
    username?: string;
    userId?: number;
    chatId: number;
    messageId: number;
    timestamp: number;
    isChannel: boolean;
    isGroup: boolean;
    isPrivate: boolean;
    chatTitle?: string;
    firstName?: string;
    lastName?: string;
}

export interface ProcessedMessageResult {
    messageData: TelegramMessageData;
    evmContractAddresses: string[];
    solanaContractAddresses: string[];
    hasTokens: boolean;
}
