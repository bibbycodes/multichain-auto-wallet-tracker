import { TelegramMessageProcessor } from "../lib/services/telegram-message-processor";

// Start the processor if this file is run directly
if (require.main === module) {
    const processor = new TelegramMessageProcessor();
    processor.start().catch(console.error);
}