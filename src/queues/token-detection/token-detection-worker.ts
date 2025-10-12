import { BaseWorker, JobProcessorFunction } from '../base-worker';
import { TokenDetectionJobData, TokenDetectionJobResult, TokenDetectionJobTypes } from './types';
import { TokenDetectionWorkerService } from '../../lib/services/token-detection/token-detection-service';
import { QueueName } from '../queue-names';
import { Job } from 'bullmq';

export class TokenDetectionWorker extends BaseWorker<TokenDetectionJobData, TokenDetectionJobResult> {
    private tokenDetectionService: TokenDetectionWorkerService;

    constructor() {
        super(
            QueueName.TOKEN_DETECTION,
            `lock:${QueueName.TOKEN_DETECTION}`,
            { concurrency: 1 }
        );
        this.tokenDetectionService = new TokenDetectionWorkerService();
    }

    public async start(): Promise<void> {
        const jobProcessor: JobProcessorFunction<TokenDetectionJobData, TokenDetectionJobResult> = 
            async (job: Job<TokenDetectionJobData>) => {
                console.log('Processing job:', {
                    jobId: job.id,
                    jobName: job.name,
                    jobDataType: job.data.type,
                    fullJobData: job.data
                });
                const jobType = job.name as TokenDetectionJobTypes;
                const result = await this.routeJob(jobType, job.data.data);
                return {
                    success: true,
                    type: jobType,
                    data: result,
                };
            };

        await this.processJobs(jobProcessor);
    }

    private async routeJob(type: TokenDetectionJobTypes, data: any): Promise<any> {
        console.log('Routing job:', type);
        switch (type) {
            case TokenDetectionJobTypes.PROCESS_TELEGRAM_TOKEN_DETECTION:
                return await this.tokenDetectionService.processTelegramTokenDetection(data);
            default:
                throw new Error(`Unknown job type: ${type}`);
        }
    }
}

// Start the worker if this file is run directly
if (require.main === module) {
    const worker = new TokenDetectionWorker();
    worker.start().catch(console.error);
}
