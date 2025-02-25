import {BaseWorker} from "../base-worker";
import {Job} from "bullmq";
import {Queues} from "../types";
import {WalletJobs} from "./types";
import {WalletJobService} from "./wallet-job-service/wallet-job-service";

export class WalletsWorker extends BaseWorker {
  constructor(private walletJobService: WalletJobService) {
    super({
      queueName: Queues.WALLETS,
      lockKey: 'wallets-worker-lock',
      options: {
        removeOnComplete: {count: 500},
        removeOnFail: {count: 50},
        concurrency: 1,
      },
    });
  }

  getJob(job: Job): Function | void {
    switch (job.name) {
      case WalletJobs.EVALUATE:
        return (data: any) => this.walletJobService.evaluateWallet(data);
      default:
        throw new Error(`No job found for ${job.name}`);
    }
  }
}
