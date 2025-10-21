import { SendMessageToChannelData } from '../../../queues/telegram-message/types';
import { TelegramBroadcastClient } from '../telegram-bot/telegram-broadcast-client';
import { AutoTrackerToken } from '../../models/token';
import { AlertsService } from '../alerts';
import { SocialPlatform } from '@prisma/client';

export class TelegramMessageWorkerService {
    constructor(
        private readonly telegramClient: TelegramBroadcastClient = TelegramBroadcastClient.getInstance(),
        private readonly alertsService: AlertsService = new AlertsService()
    ) { }

    async sendMessageToChannel(data: SendMessageToChannelData): Promise<any> {
        console.log('Sending message to channel:', data.channelId);
        console.log({ data });

        // Reconstruct AutoTrackerToken from serialized data if needed
        const token = data.token instanceof AutoTrackerToken
            ? data.token
            : new AutoTrackerToken(data.token);

        await this.telegramClient.broadcast({
            channelId: data.channelId,
            text: data.caption,
            photoUrl: token.logoUrl,
            disableWebPagePreview: true,
        });

        await this.alertsService.createAlertForToken(
            token,
            data.priceDetails.marketCap,
            data.priceDetails.price,
            SocialPlatform.TELEGRAM
        );

        return {
            sent: true,
            channelId: data.channelId,
            tokenAddress: token.address
        };
    }
}

