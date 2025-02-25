import {Job} from "bullmq";

export enum Queues {
  WALLETS = "WALLETS",
  TOKENS = "TOKENS",
  ALERTS = "ALERTS"
}

export type JobProcessorFunction<T = any, R = any> = (job: Job<T, R>) => Promise<R>;
