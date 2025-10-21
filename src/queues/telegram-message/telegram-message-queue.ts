import { BaseQueue } from '../base-queue';
import { TelegramMessageJobData } from './types';
import { QueueName } from '../queue-names';

export class TelegramMessageQueue extends BaseQueue<TelegramMessageJobData> {
    constructor() {
        super(QueueName.TELEGRAM_MESSAGE);
    }
}

