import {Singleton} from "../../../lib/services/util/singleton";
import {EvaluateWalletJobData} from "./types";

export class WalletJobService extends Singleton {
  constructor() {
    super()
  }
  
  evaluateWallet(data: EvaluateWalletJobData) {
    return true
  }
}
