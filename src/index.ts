import {WalletDiscoveryService} from './modules/walletDiscovery'
import {DataIngestionService} from "./lib/services/data-ingestion/data-ingestion-service";
import {EvmSwapConsumer} from "./lib/services/consumers/evm-swap-consumer";

// const walletDiscovery = new WalletDiscoveryService({ interval: 600000 * 3 })
// walletDiscovery.startCronJob()

const dataIngestion = DataIngestionService.getInstance()
const evmSwapConsumer = new EvmSwapConsumer()
evmSwapConsumer.start()
dataIngestion.start()
