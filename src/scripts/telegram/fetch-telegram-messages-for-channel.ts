import { TelegramMessageProcessor } from "../../lib/data-sources/telegram-message-processor/telegram-message-processor";

/**
 * Script to fetch historical messages from a Telegram channel
 * 
 * Usage:
 *   ts-node src/scripts/fetch-telegram-messages.ts
 */

async function main(channelId: string) {
    const processor = new TelegramMessageProcessor();
    try {
        const limit = 100;
        const messages = await processor.fetchHistoricalMessages(channelId, limit);
        console.log(`Fetched and saved ${messages.length} messages`);

    } catch (error) {
        console.error('Error fetching messages:', error);
    } finally {
        await processor.stop();
    }
}

main('2299278180')

