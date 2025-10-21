import IORedis, { Redis } from 'ioredis';
import { Queue, QueueEvents, QueueOptions, JobsOptions } from 'bullmq';
import { RedisClient } from '../cache/redis-client';
import { Singleton } from '../lib/services/util/singleton';

export interface BaseJobData {
    type: string;
    data: any;
}

export abstract class BaseQueue<TJobData extends BaseJobData> extends Singleton {
    protected connection: Redis;
    public queue: Queue<TJobData>;
    protected queueEvents: QueueEvents;
    protected queueName: string;

    constructor(queueName: string, queueOptions?: QueueOptions) {
        super();
        this.queueName = queueName;
        const redisClient = RedisClient.getInstance();
        const redis = redisClient.client();

        // Create a new Redis connection for BullMQ
        this.connection = redis.duplicate();
        this.connection.options.maxRetriesPerRequest = null;

        this.queue = new Queue<TJobData>(queueName, {
            connection: this.connection,
            streams: {
                events: { maxLen: 1000 },
            },
            defaultJobOptions: {
                removeOnComplete: { age: 3600, count: 300 }, // remove jobs older than 1 hour OR keep only 300
                removeOnFail: { age: 86400, count: 300 }, // failed jobs: keep 24h or 300
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
            ...queueOptions,
        });

        this.queueEvents = new QueueEvents(queueName, {
            connection: this.connection,
        });

        this.setupEventListeners();
    }

    protected setupEventListeners(): void {
        this.queueEvents.on('failed', (event) => {
            console.error(
                `Job failed: ${event.jobId}, failedReason: ${event.failedReason}, queue: ${this.queue.name}`
            );
        });

        this.queueEvents.on('completed', (event) => {
            console.log(`Job completed: ${event.jobId}, queue: ${this.queue.name}`);
        });

        this.queueEvents.on('active', (event) => {
            console.log(`Job active: ${event.jobId}, queue: ${this.queue.name}`);
        });

        this.queueEvents.on('waiting', (event) => {
            console.log(`Job waiting: ${event.jobId}, queue: ${this.queue.name}`);
        });
    }

    async addJob<t = any>(
        data: TJobData,
        options?: JobsOptions
    ): Promise<string | undefined> {
        console.log(`Adding job to ${this.queueName}: ${data.type}`);
        try {
            const job = await this.queue.add(data.type as any, data as any, options);
            return job.id;
        } catch (error: any) {
            console.error(
                `Error adding job to queue: ${error.message}, queue: ${this.queue.name}, jobType: ${data.type}`
            );
            return undefined;
        }
    }

    async addBulkJobs(
        jobs: Array<{ data: TJobData; options?: JobsOptions }>
    ): Promise<string[]> {
        try {
            const bullJobs = jobs.map(job => ({
                name: job.data.type as any,
                data: job.data,
                opts: job.options || {},
            }));

            const addedJobs = await this.queue.addBulk(bullJobs as any);
            return addedJobs.map(job => job.id).filter(Boolean) as string[];
        } catch (error: any) {
            console.error(`Error adding bulk jobs: ${error.message}`);
            return [];
        }
    }

    async getJob(jobId: string) {
        return this.queue.getJob(jobId);
    }

    async getStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.queue.getWaitingCount(),
            this.queue.getActiveCount(),
            this.queue.getCompletedCount(),
            this.queue.getFailedCount(),
            this.queue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed,
        };
    }

    async pause(): Promise<void> {
        await this.queue.pause();
    }

    async resume(): Promise<void> {
        await this.queue.resume();
    }

    async clean(grace: number = 24 * 3600 * 1000, status: 'completed' | 'failed' = 'completed'): Promise<void> {
        await this.queue.clean(grace, 100, status);
    }

    async addJobWithDelay(
        data: TJobData,
        delay: number,
        options?: JobsOptions
    ): Promise<string | undefined> {
        return await this.addJob(data, { delay, ...options });
    }

    async getActiveJobsCount(): Promise<number> {
        return await this.queue.getActiveCount();
    }

    async cleanStaleJobs(staleTimeout: number) {
        try {
            const activeJobs = await this.queue.getActive();

            for (let job of activeJobs) {
                if (Date.now() - job.timestamp > staleTimeout) {
                    console.warn(
                        `Removing stale job: ${job.id} from ${this.queue.name}`
                    );
                    await job.remove();
                }
            }

            console.log("Stale jobs cleanup completed.");
        } catch (error: any) {
            console.error(`Error cleaning stale jobs: ${error.message}`);
        }
    }

    getQueue(): Queue<TJobData> {
        return this.queue;
    }

    async close(): Promise<void> {
        await this.queue.close();
        await this.queueEvents.close();
        await this.connection.quit();
    }
}