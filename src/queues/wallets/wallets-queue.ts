import {BaseQueue} from "../base-queue";
import {Queues} from "../types";

export class WalletsQueue extends BaseQueue {
  constructor() {
    super(Queues.WALLETS);
  }
}
