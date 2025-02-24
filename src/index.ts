import { WalletDiscovery } from './modules/walletDiscovery'

const walletDiscovery = new WalletDiscovery({ interval: 600000 * 3 })
walletDiscovery.startCronJob()
