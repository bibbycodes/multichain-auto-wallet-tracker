import { BaseQueue } from '../base-queue';
import { TokenDetectionJobData } from './types';
import { QueueName } from '../queue-names';

export class TokenDetectionQueue extends BaseQueue<TokenDetectionJobData> {
    constructor() {
        super(QueueName.TOKEN_DETECTION);
    }
}
