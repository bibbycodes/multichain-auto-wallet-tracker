import {Singleton} from "../util/singleton";
import {LogListener} from "../../data-sources/evm-log-listener/log-listener";
import {ChainToId} from "../../../shared/chains";

export class DataIngestionService extends Singleton {
  constructor() {
    super();
  }
  
  async listenToEvmLogs() {
    // Instantiate and start listening for logs
    const ethListener = new LogListener(ChainToId.ethereum);
    const bscListener = new LogListener(ChainToId.bsc);
    const baseListener = new LogListener(ChainToId.base);
    ethListener.start();
    bscListener.start();
    baseListener.start();
  }
  
  async start() {
    this.listenToEvmLogs();
  }
}
