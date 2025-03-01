import {Singleton} from "../../util/singleton";
import {MoralisClient} from "./moralis-client";
import {ChainToId} from "../../../../shared/chains";
import {GetWalletNetWorthOperationResponseJSON} from "@moralisweb3/common-evm-utils";

export class MoralisService extends Singleton {
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
  
  async getWalletPortfolioDetails(address: string): Promise<GetWalletNetWorthOperationResponseJSON> {
    return (await this.client.getWalletNetWorth({address})).toJSON()
  }
}
