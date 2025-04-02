import Web3 from 'web3';
import {getRandomQuicknodeEndpoint} from "../../services/util/env/env";
import {deriveTopicSha3} from "../../services/apis/moralis/moralis-utils";
import {uniV2Pair} from "../../exchanges/uni-like-v2/abi/uni-v2-pair";
import {ChainId} from "../../../shared/chains";
import {ExchangeFactory} from "../../exchanges/exchange-router/exchange-factory";
import {EventBus} from "../../services/event-bus";
import {Events} from "../../services/event-bus/types";

export class LogListener {
  private web3: Web3;
  private eventBus: EventBus;

  constructor(private chainId: ChainId, private topics: string[] = [
    deriveTopicSha3(uniV2Pair, 'Swap') as string]
  ) {
    const provider = getRandomQuicknodeEndpoint(chainId);
    this.web3 = new Web3(provider.wss);
    this.eventBus = EventBus.getInstance();
  }

  public async start() {
    const filter = {
      fromBlock: 'latest',
      toBlock: 'latest',
      topics: this.topics
    };
    
    const exchangeFactory = new ExchangeFactory();

    // Subscribe to logs with the specified filter
    const subscription = await this.web3.eth.subscribe('logs', filter)
    subscription
      .on('data', async (log: any) => {
        const exchange = await exchangeFactory.getExchangeByLog(log, this.chainId);
        if (!exchange) {
          console.error(`No exchange found for log`);
          return
        }
        const swap = await exchange.decodeLog(log);
        this.eventBus.emit({
          type: Events.Swap,
          data: {
            swap,
            chainId: this.chainId
          },
        });
      })
  }
}
