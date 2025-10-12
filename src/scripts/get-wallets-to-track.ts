import { ChainId } from "shared/chains";
import { Database } from "../lib/db/database";
import { GmGnService } from "../lib/services/apis/gmgn/gmgn-service";
import { WalletDiscoveryService } from "../lib/services/wallet-discovery/wallet-discovery-service";
export const getWalletsToTrack = async () => {
    const walletDiscoveryService = WalletDiscoveryService.getInstance()
    const database = Database.getInstance()

    const chains = await database.chains.findAll()
    for (const chain of chains.filter(chain => GmGnService.SUPPORTED_CHAIN_IDS.includes(chain.chain_id as ChainId))) {
        try {
            await walletDiscoveryService.getWalletsToTrack(chain.chain_id as ChainId)
        } catch (err) {
            console.error(err)
        }
    }
}

getWalletsToTrack().then(() => {
    console.log('done')
    process.exit(0)
})