import {Singleton} from "../../../shared/util/singleton";

export class WalletJobService extends Singleton {
  constructor() {
    super()
  }
  
  evaluateWallet(data: any) {
    return true
  }
}
