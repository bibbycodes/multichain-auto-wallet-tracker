import { WalletDiscoveryService } from "../../../src/lib/services/wallet-discovery/wallet-discovery-service";
import { ChainsMap } from "../../../src/shared/chains";

export const getWalletsToTrack = async () => {
    const walletDiscoveryService = new WalletDiscoveryService()
    await walletDiscoveryService.getWalletsToTrack(ChainsMap.base)
}

getWalletsToTrack()