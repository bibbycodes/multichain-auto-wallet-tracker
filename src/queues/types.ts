import {Job} from "bullmq";

export enum Queues {
  WALLETS = "WALLETS",
  TOKENS = "TOKENS",
  ALERTS = "ALERTS"
}

export type JobProcessorFunction<T = any, R = any> = (job: Job<T, R>) => Promise<R>;

/**
 * Generic base interface for queue job data
 */
export interface BaseQueueJobData<TJobType extends string = string, TData = any> {
  type: TJobType;
  data: TData;
}

/**
 * Generic base interface for queue job results
 */
export interface BaseQueueJobResult<TJobType extends string = string, TData = any> {
  success: boolean;
  type: TJobType;
  data?: TData;
  error?: string;
}
