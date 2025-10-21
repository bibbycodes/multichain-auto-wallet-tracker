import { TokenDetectionWorker } from './token-detection-worker';

const worker = new TokenDetectionWorker();
worker.start().catch(console.error);

