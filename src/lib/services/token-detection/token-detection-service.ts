import { TelegramMessageQueue } from '../../../queues/telegram-message/telegram-message-queue';
import { TelegramMessageJobData, TelegramMessageJobTypes } from '../../../queues/telegram-message/types';
import { TelegramTokenDetectionJobData } from '../../../queues/token-detection/types';
import { Database } from '../../db/database';
import { TokenService } from '../token-service/token-service';
import { env } from '../util/env/env';

export class TokenDetectionWorkerService {
    constructor(
        private readonly tokenService: TokenService = new TokenService(),
        private readonly telegramMessageQueue: TelegramMessageQueue = new TelegramMessageQueue(),
        private readonly db: Database = Database.getInstance(),
    ) {
    }

    async processTelegramTokenDetection(data: TelegramTokenDetectionJobData): Promise<any> {
        // Implementation here
        // Resolve the chain id for the token
        console.log('Processing token', data);
        const token = await this.tokenService.getOrCreateTokenWithAddress(data.tokenAddress)
        console.log({token})

        await this.telegramMessageQueue.addJob<TelegramMessageJobData>({
            type: TelegramMessageJobTypes.SEND_MESSAGE,
            data: {
                channelId: env.telegram.wbbBscChannelId,
                caption: `Token detected: ${data.tokenAddress}`,
                token: token
            }
        });

        return { processed: true, tokenAddress: data.tokenAddress};
    }
}

