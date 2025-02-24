import Web3 from 'web3';
import {getRandomQuicknodeEndpoint} from "./shared/env";
import {deriveTopicSha3} from "./shared/services/moralis/moralis-utils";
import {uniV2Pair} from "./lib/exchanges/uni-like-v2/abi/uni-v2-pair";
import {ChainId, ChainToId, getAllChainIds} from "./shared/chains";
import {ExchangeFactory} from "./lib/exchanges/exchange-router/exchange-factory";

class LogListener {
  private web3: Web3;

  constructor(private chainId: ChainId, private topics: string[] = [deriveTopicSha3(uniV2Pair, 'Swap') as string]) {
    const provider = getRandomQuicknodeEndpoint(chainId);
    this.web3 = new Web3(provider.wss);
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
        const swap = await exchange.getSwapFromLog(log);
        console.log({swap})
        throw new Error('End')
      })
  }
}

// Instantiate and start listening for logs
const ethListener = new LogListener(ChainToId.ethereum);
const bscListener = new LogListener(ChainToId.bsc);
const baseListener = new LogListener(ChainToId.base);
ethListener.start();
bscListener.start();
baseListener.start();
