import { TelegramMessageQueue } from '../../../queues/telegram-message/telegram-message-queue';
import { TelegramMessageJobData, TelegramMessageJobTypes } from '../../../queues/telegram-message/types';
import { TelegramTokenDetectionJobData } from '../../../queues/token-detection/types';
import { Database } from '../../db/database';
import { TelegramMessageFormatter } from '../telegram-message-formatter/telegram-message-formatter';
import { AutoTrackerTokenBuilder } from '../token-builder/token-builder';
import { BaseContext } from '../token-context/base-context';
import { AlertsService } from '../alerts/alerts-service';
import { env } from '../util/env/env';

export class TokenDetectionWorkerService {
    constructor(
        private readonly telegramMessageQueue: TelegramMessageQueue = new TelegramMessageQueue(),
        private readonly db: Database = Database.getInstance(),
        private readonly alertsService: AlertsService = new AlertsService(),
    ) {
    }

    async processTelegramTokenDetection(data: TelegramTokenDetectionJobData): Promise<any> {
        if (!data.tokenData.address) {
            return;
        }

        // Check if we have already sent an alert for this token. If we have, return early
        const hasAlerted = await this.alertsService.hasTokenAlerted(data.tokenData.address);
        if (hasAlerted) {
            console.log(`Token ${data.tokenData.address} has already been alerted on, skipping processing`);
            return { processed: false, reason: 'already_alerted', tokenAddress: data.tokenData.address };
        }

        // TODOS:
        // Assemble Notification Context
        // Pass Notification Context to AlertDiscriminator
        // If AlertDiscriminator returns true, send alert
        // If AlertDiscriminator returns false, do not send alert
        // Save Mention to Database every time
        // Figure out list of telegram channels to pass to token detector (Hardcoded for now)
        // Security Service returning false data for token security at the moment. Need to fix this.
        // How can we filter ahead of time addresses that are not token addresses - Parse incoming data more effectively
        const tokenBuilder = new AutoTrackerTokenBuilder(data.tokenData.address, data.tokenData.chainId)
        const token = await tokenBuilder.getOrCreate()
        const rawData = tokenBuilder.getRawData()
        await rawData.collect()
        const baseContext = new BaseContext(token, rawData)
        const baseContextData = await baseContext.toObject()

        await this.telegramMessageQueue.addJob<TelegramMessageJobData>({
            type: TelegramMessageJobTypes.SEND_ALERT,
            data: {
                channelId: env.telegram.wbbBscChannelId,
                caption: new TelegramMessageFormatter(baseContextData).getAlertMessage(),
                token: token,
                priceDetails: baseContextData.priceDetails,
            }
        });

        return { processed: true, tokenAddress: data.tokenData.address};
    }
}