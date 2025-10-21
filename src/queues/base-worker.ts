import IORedis, { Redis } from 'ioredis';
import { Worker, WorkerOptions, Job } from 'bullmq';
import { RedisClient } from '../cache/redis-client';

export interface BaseJobData {
    type: string;
    data: any;
}

export interface BaseJobResult {
    success: boolean;
    type: string;
    data?: any;
    error?: string;
}

export type JobProcessorFunction<T = any, R = any> = (job: Job<T, R>) => Promise<R>;

export abstract class BaseWorker<TJobData extends BaseJobData, TJobResult extends BaseJobResult> {
    protected connection: Redis;
    protected worker?: Worker<TJobData, TJobResult>;
    protected queueName: string;
    private lockKey: string;
    private options: Partial<WorkerOptions>;
    private lockTTL: number;

    constructor(
        queueName: string,
        lockKey: string,
        options: Partial<WorkerOptions> = {},
        lockTTL: number = 60000
    ) {
        this.queueName = queueName;
        this.lockKey = lockKey;
        this.options = options;
        this.lockTTL = lockTTL;
        
        const redisClient = RedisClient.getInstance();
        const redis = redisClient.client();

        // Create a new Redis connection for BullMQ
        this.connection = redis.duplicate();
        this.connection.options.maxRetriesPerRequest = null;
    }

    protected async withLockAndDelay(job: Job, callback: () => Promise<void>): Promise<void> {
        return this.withDelay(job, async () => {
            return this.withLock(job, callback);
        });
    }
    
    protected async withLock(job: Job, callback: () => Promise<void>): Promise<void> {
        const lockAcquired = await this.acquireLock();
        if (!lockAcquired) {
            await job.moveToDelayed(Date.now() + 5000);
            return;
        }
        
        const lockExtensionInterval = setInterval(async () => {
            await this.extendLock();
        }, this.lockTTL / 2); // Extend the lock every half TTL

        try {
            await callback();
        } finally {
            clearInterval(lockExtensionInterval); // Clear the interval to stop extending the lock
            await this.releaseLock();
        }
    }

    protected withDelay = async (job: Job, callback: () => Promise<void>): Promise<void> => {
        await callback();
        await this.sleep(job.delay ?? 2000);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async processJobs(jobProcessor: JobProcessorFunction<TJobData, TJobResult>): Promise<void> {
        if (this.worker) {
            return;
        }

        // Wrap the job processor with enhanced error handling
        const wrappedJobProcessor = async (job: Job<TJobData, TJobResult>) => {
            try {
                console.log(`Processing job ${job.id} of type ${job.name} in queue ${this.queueName}`);
                return await jobProcessor(job);
            } catch (error) {
                const err = error as Error;
                console.error(`Error in job ${job.id} (${job.name}):`, {
                    message: err.message,
                    stack: err.stack,
                    name: err.name,
                    jobId: job.id,
                    jobName: job.name,
                    jobData: job.data
                });
                
                // Re-throw the error so BullMQ can handle it properly
                throw error;
            }
        };

        this.worker = new Worker<TJobData, TJobResult>(this.queueName, wrappedJobProcessor, {
            connection: this.connection,
            autorun: false,
            removeOnComplete: { count: 300 },
            removeOnFail: { count: 10 },
            concurrency: 1,
            ...this.options,
        });

        this.worker.on('error', (error) => {
            if (!error.message.includes('Missing lock for job')) {
                console.log(error);
                console.error(`Worker error: ${error.message}`);
            }
        });
        
        this.worker.on('progress', (jobId) => {
            console.log(`Job ${jobId} is waiting for a worker`);
        });

        this.worker.on('active', (job) => {
            console.log(`Job ${job.id} is now active; processed by worker ${process.pid}`);
        });
        
        this.worker.on('completed', (job) => {
            console.log(`Job ${job.id} has been completed`);
        });

        this.worker.on('failed', (job, err) => {
            if (job) {
                console.error(`Worker ${this.queueName} failed job ${job.id}: ${err.message}`);
                
                // Log the full error with stack trace
                console.error('Worker error details:', {
                    message: err.message,
                    stack: err.stack,
                    name: err.name,
                    jobId: job.id,
                    jobData: job.data
                });
                
                // Also log the raw error for full stack trace visibility
                console.error('Full error stack trace:');
                console.error(err);
            }
        });
        
        this.worker.on('stalled', (job) => {
            console.log(`Job ${job} has stalled`);
        });

        this.worker.run();
        console.log(`${this.queueName} worker started and listening for jobs...`);
    }

    async acquireLock(): Promise<boolean> {
        const result = await this.connection.set(this.lockKey, 'locked', 'EX', 60, 'NX');
        return result === 'OK';
    }

    async releaseLock(): Promise<void> {
        await this.connection.del(this.lockKey);
    }

    async extendLock(): Promise<void> {
        await this.connection.pexpire(this.lockKey, this.lockTTL); // Extend the lock TTL
    }

    async shutdown(): Promise<void> {
        console.log(`Shutting down ${this.queueName} worker...`);
        if (this.worker) {
            await this.worker.close();
        }
        await this.connection.quit();
        console.log(`${this.queueName} worker shut down successfully`);
    }

    getWorker(): Worker<TJobData, TJobResult> | undefined {
        return this.worker;
    }
}