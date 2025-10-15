import { TelegramMessageQueue } from '../../../queues/telegram-message/telegram-message-queue';
import { TelegramMessageJobData, TelegramMessageJobTypes } from '../../../queues/telegram-message/types';
import { TelegramTokenDetectionJobData } from '../../../queues/token-detection/types';
import { Database } from '../../db/database';
import { TelegramMessageFormatter } from '../telegram-message-formatter/telegram-message-formatter';
import { AutoTrackerTokenBuilder } from '../token-builder/token-builder';
import { BaseContext } from '../token-context/base-context';
import { env } from '../util/env/env';

export class TokenDetectionWorkerService {
    constructor(
        private readonly telegramMessageQueue: TelegramMessageQueue = new TelegramMessageQueue(),
        private readonly db: Database = Database.getInstance(),
    ) {
    }

    async processTelegramTokenDetection(data: TelegramTokenDetectionJobData): Promise<any> {
        const tokenBuilder = new AutoTrackerTokenBuilder(data.tokenAddress, data.chainId)
        const token = await tokenBuilder.getOrCreate()
        const rawData = tokenBuilder.getRawData()
        await rawData.collect()
        const baseContext = new BaseContext(token, rawData)
        const baseContextData = await baseContext.toObject()
        console.log(token.toJson())
        // Check if we have already sent an alert for this token.If we have, return early
        // Fetch the token context, passing in all our raw data
        // Decide if we should send an aler

        await this.telegramMessageQueue.addJob<TelegramMessageJobData>({
            type: TelegramMessageJobTypes.SEND_ALERT,
            data: {
                channelId: env.telegram.wbbBscChannelId,
                caption: new TelegramMessageFormatter(baseContextData).getAlertMessage(),
                token: token,
            }
        });

        return { processed: true, tokenAddress: data.tokenAddress};
    }
}