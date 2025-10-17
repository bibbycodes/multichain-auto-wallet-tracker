

/**
 * Script to fetch a specific message from a Telegram channel
 * 
 * Usage:
 *   ts-node src/scripts/fetch-specific-message.ts
 */

import { TelegramMessageProcessor } from "../../lib/data-sources/telegram-message-processor";

async function main() {
    const processor = new TelegramMessageProcessor();

    try {
        const channelId = "2397610468";  // Channel ID (get from getAllChannels())
        const messageId = 64;
        const saveToFixture = true;

        console.log(`Fetching message ${messageId} from channel ${channelId}...`);

        const message = await processor.fetchMessage(
            channelId,
            messageId,
            saveToFixture
        );

        if (message) {
            console.log(`\nMessage fetched successfully:`);
            console.log(`  ID: ${message.id}`);
            console.log(`  Date: ${new Date(message.date * 1000).toISOString()}`);
            console.log(`  Text: ${message.message}`);
        } else {
            console.log(`Message not found`);
        }

    } catch (error) {
        console.error('Error fetching message:', error);
    } finally {
        await processor.stop();
    }
}

main();

