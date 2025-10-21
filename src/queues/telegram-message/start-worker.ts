import { TelegramMessageWorker } from './telegram-message-worker';

const worker = new TelegramMessageWorker();
worker.start().catch(console.error);

