import { SendMessageToChannelData } from '../../../queues/telegram-message/types';
import { TelegramBroadcastClient } from '../telegram-bot/telegram-broadcast-client';
import { AutoTrackerToken } from '../../models/token';

export class TelegramMessageWorkerService {
    constructor(
        private readonly telegramClient: TelegramBroadcastClient = TelegramBroadcastClient.getInstance()
    ) {}

    async sendMessageToChannel(data: SendMessageToChannelData): Promise<any> {
        console.log('Sending message to channel:', data.channelId);
        
        // Reconstruct AutoTrackerToken from serialized data if needed
        const token = data.token instanceof AutoTrackerToken 
            ? data.token 
            : new AutoTrackerToken(data.token);

        await this.telegramClient.broadcast({
            channelId: data.channelId,
            text: data.caption,
            photoUrl: data.photo,
            disableWebPagePreview: true,
        });

        return { 
            sent: true, 
            channelId: data.channelId,
            tokenAddress: token.address 
        };
    }
}

