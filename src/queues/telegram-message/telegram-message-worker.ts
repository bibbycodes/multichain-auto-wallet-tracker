import { BaseWorker, JobProcessorFunction } from '../base-worker';
import { TelegramMessageJobData, TelegramMessageJobResult, TelegramMessageJobTypes } from './types';
import { QueueName } from '../queue-names';
import { Job } from 'bullmq';
import { TelegramMessageWorkerService } from '../../lib/services/telegram-message';

export class TelegramMessageWorker extends BaseWorker<TelegramMessageJobData, TelegramMessageJobResult> {
    private telegramMessageService: TelegramMessageWorkerService;

    constructor() {
        super(
            QueueName.TELEGRAM_MESSAGE,
            `lock:${QueueName.TELEGRAM_MESSAGE}`,
            { concurrency: 1 }
        );
        this.telegramMessageService = new TelegramMessageWorkerService();
    }

    public async start(): Promise<void> {
        const jobProcessor: JobProcessorFunction<TelegramMessageJobData, TelegramMessageJobResult> = 
            async (job: Job<TelegramMessageJobData>) => {
                const jobType = job.name as TelegramMessageJobTypes;
                const result = await this.routeJob(jobType, job.data.data);
                return {
                    success: true,
                    type: jobType,
                    data: result,
                };
            };

        await this.processJobs(jobProcessor);
    }

    private async routeJob(type: TelegramMessageJobTypes, data: any): Promise<any> {
        console.log('Routing job:', type);
        switch (type) {
            case TelegramMessageJobTypes.SEND_ALERT:
                return await this.telegramMessageService.sendMessageToChannel(data);
            default:
                throw new Error(`Unknown job type: ${type}`);
        }
    }
}