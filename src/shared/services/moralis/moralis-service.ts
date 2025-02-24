import {BaseSingleton} from "../../util/base-singleton";
import {MoralisClient} from "./moralis-client";
import {uniV2Pair} from "../../../lib/exchanges/uni-like-v2/abi/uni-v2-pair";
import {deriveTopic} from "./moralis-utils";
import {ChainToId} from "../../chains";

export class MoralisService extends BaseSingleton {
  constructor(private client = new MoralisClient()) {
    super();
  }

  async createStream({
                       addresses,
                       webhookUrl,
                       topics,
                       abi

                     }: {
    addresses: string[],
    webhookUrl: string,
    topics: string[],
    abi: any[]
  }) {
    const stream = await this.client.createStream({
      webhookUrl,
      description: "Monitor Addresses Swaps and Transfers",
      tag: "addresses",
      chains: [ChainToId.bsc.toString()],
      includeNativeTxs: true,
    })

    const jsonStream = await stream.toJSON()

    await this.client.updateStream({
      id: jsonStream.id,
      abi,
      includeContractLogs: true,
      topic0: topics,
    })

    await this.client.addAddressesToStream({
      id: jsonStream.id,
      addresses
    })
    
    if (jsonStream.status !== 'active') {
      await this.client.resumeStream(jsonStream.id)
    }
    
    return jsonStream
  }
}

const mrls = MoralisService.getInstance()
const topics = [deriveTopic(uniV2Pair, "Swap")]

mrls.createStream({
  addresses: ["0x8622Da2cd359D9c6B9855aaF7C28606E87C75915"],
  webhookUrl: "https://degengalore.a.pinggy.link/webhooks/moralis",
  topics,
  abi: uniV2Pair
})
  .then(console.log)
  .catch(console.log)
