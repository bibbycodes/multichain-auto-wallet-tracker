import { ChainId } from "shared/chains";
import { Database } from "../lib/db/database";
import { WalletDiscoveryService } from "../lib/services/wallet-discovery/wallet-discovery-service";
export const getWalletsToTrack = async () => {
    const walletDiscoveryService = WalletDiscoveryService.getInstance()
    const database = Database.getInstance()

    const chains = await database.chains.findAll()
    for (const chain of chains) {
        await walletDiscoveryService.getWalletsToTrack(chain.chain_id as ChainId)
    }
}

getWalletsToTrack()