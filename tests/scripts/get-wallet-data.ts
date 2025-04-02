import { WalletService } from "../../src/lib/services/wallets/wallet-service";
import { ChainsMap } from "../../src/shared/chains";


export const getWalletData = async (walletAddress: string) => {
    const walletService = WalletService.getInstance();
    const wallet = await walletService.fetchWallet(walletAddress, ChainsMap.base);
}

getWalletData("0xd5ff53f48f14e9409b581e41a4cddfe0e97dc724");