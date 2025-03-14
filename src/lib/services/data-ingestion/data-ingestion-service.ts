import {Singleton} from "../util/singleton";
import {LogListener} from "../../data-sources/evm-log-listener/log-listener";
import {ChainsMap} from "../../../shared/chains";

export class DataIngestionService extends Singleton {
  constructor() {
    super();
  }
  
  async listenToEvmLogs() {
    // Instantiate and start listening for logs
    const ethListener = new LogListener(ChainsMap.ethereum);
    const bscListener = new LogListener(ChainsMap.bsc);
    const baseListener = new LogListener(ChainsMap.base);
    ethListener.start();
    bscListener.start();
    baseListener.start();
  }
  
  async start() {
    this.listenToEvmLogs();
  }
}
