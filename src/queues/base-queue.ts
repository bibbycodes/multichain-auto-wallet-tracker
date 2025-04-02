import {Redis} from 'ioredis';
import {JobsOptions, Queue, QueueEvents, QueueOptions} from 'bullmq';
import {RedisClient} from "../cache/redis-client";
import {Singleton} from "../lib/services/util/singleton";
import {Queues} from "./types";

export abstract class BaseQueue extends Singleton {
  protected connection: Redis;
  public queue: Queue;
  protected queueEvents: QueueEvents;

  protected constructor(queueName: Queues, queueOptions?: QueueOptions) {
    super()
    this.connection = RedisClient.getInstance().client();
    this.queue = new Queue(queueName, {connection: this.connection, ...queueOptions});
    this.queueEvents = new QueueEvents(queueName, {connection: this.connection});
    this.queueEvents.on('failed', (event) => {
      console.error(`Job failed: ${event.jobId}, failedReason: ${event.failedReason}`);
    });
  }

  public async addJob<T>({name, data, options}: {
    name: string,
    data: T,
    options?: JobsOptions
  }): Promise<string | undefined> {
    console.info(`Adding Job: ${name}`)
    try {
      const job = await this.queue.add(name, data, options);
      return job.id;
    } catch (error: any) {
      console.error(`Error adding job to queue: ${error.message}`);
      return undefined;
    }
  }

  public async cleanStaleJobs(staleTimeout: number) {
    try {
      // Get all jobs in waiting, delayed, or active states
      // const waitingJobs = await this.queue.getWaiting();
      // const delayedJobs = await this.queue.getDelayed();
      const activeJobs = await this.queue.getActive();

      // Function to remove jobs that are too old
      const removeOldJobs = async (jobs: any[]) => {
        for (let job of jobs) {
          if (Date.now() - job.timestamp > staleTimeout) {
            console.warn(`Removing stale job: ${job.id} from ${this.queue.name}`);
            await job.remove();
          }
        }
      };

      // Check and remove stale jobs from each state
      // await removeOldJobs(waitingJobs);
      // await removeOldJobs(delayedJobs);
      await removeOldJobs(activeJobs);

      console.info('Stale jobs cleanup completed.');
    } catch (error: any) {
      console.error(`Error cleaning stale jobs: ${error.message}`);
    }
  }
}
