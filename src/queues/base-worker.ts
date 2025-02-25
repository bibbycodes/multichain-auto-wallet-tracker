import {Job, Worker, WorkerOptions} from 'bullmq';
import {Redis} from 'ioredis';
import {RedisClient} from "../cache/redis-client";
import {JobProcessorFunction} from "./types";

export abstract class BaseWorker {
  protected connection: Redis;
  protected worker?: Worker;
  protected queueName: string;
  protected lockKey: string;
  protected options: Partial<WorkerOptions>;

  protected constructor({
                          queueName,
                          lockKey,
                          options = {}
                        }: {
                          queueName: string,
                          lockKey: string,
                          options: Partial<WorkerOptions>
                        }
  ) {
    this.connection = RedisClient.getInstance().client();
    this.queueName = queueName;
    this.lockKey = lockKey;
    this.options = options;
  }

  abstract getJob(job: Job): Function | void;

  private async process(job: Job) {
    const {data} = job
    const fn = this.getJob(job)
    if (!fn) {
      return
    }
    return await fn(data)
  }

  public async start(): Promise<void> {
    console.info('Starting WalletsWorker');
    await this.processJobs(this.process);
  }

  public async processJobs<T = any, R = any>(jobProcessor: JobProcessorFunction<T, R>): Promise<void> {
    if (this.worker) {
      return;
    }

    this.worker = new Worker(this.queueName, jobProcessor, {
      connection: this.connection,
      autorun: false,
      removeOnComplete: {count: 500},
      removeOnFail: {count: 50},
      concurrency: 1,
      ...this.options,
    });

    this.worker.on('error', (error) => {
      if (!error.message.includes('Missing lock for job')) {
        console.error(`Worker error: ${error.message}`);
      }
    });

    this.worker.on('progress', (jobId) => {
      console.info(`Job ${jobId} is waiting for a worker`);
    });

    this.worker.on('active', (job) => {
      console.info(`Job ${job.id} is now active; processed by worker ${process.pid}`);
    });

    this.worker.on('completed', (job) => {
      console.info(`Job ${job.id} has been completed`);
    });

    this.worker.on('failed', (job, err) => {
      if (job) {
        console.error(`Worker ${this.queueName} failed job ${job.id}: ${err.message}`);
      }
    });

    this.worker.on('stalled', (job) => {
      console.info(`Job ${job} has stalled`);
    });

    this.worker.run();
  }
}
