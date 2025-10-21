import { TelegramMessageProcessor } from "../lib/data-sources/telegram-message-processor/telegram-message-processor";

/**
 * Script to join a Telegram channel
 * 
 * Usage:
 *   ts-node src/scripts/join-telegram-channel.ts
 * 
 * Examples:
 *   - Public channel by username: "@channelname"
 *   - Private channel by invite link: "https://t.me/+InviteCode"
 *   - Channel by ID: "1234567890" (if you know it)
 */

async function main() {
    const processor = new TelegramMessageProcessor();

    try {
        // Configure the channel to join
        const channelToJoin = "@KOLscope";  // or invite link, or channel ID

        console.log(`Joining channel: ${channelToJoin}...`);

        const result = await processor.joinChannel(channelToJoin);

        console.log(`\nSuccessfully joined the channel!`);
        console.log(`Result:`, result);

        // You can now list all channels to see the new one
        const allChannels = processor.getAllChannels();
        console.log(`\nTotal channels: ${allChannels.length}`);

    } catch (error: any) {
        if (error.message?.includes('CHANNELS_TOO_MUCH')) {
            console.error('Error: You have joined too many channels. Leave some channels first.');
        } else if (error.message?.includes('INVITE_HASH_EXPIRED')) {
            console.error('Error: The invite link has expired.');
        } else if (error.message?.includes('CHANNEL_PRIVATE')) {
            console.error('Error: This is a private channel. You need an invite link to join.');
        } else if (error.message?.includes('USER_ALREADY_PARTICIPANT')) {
            console.error('Info: You are already a member of this channel.');
        } else {
            console.error('Error joining channel:', error.message || error);
        }
    } finally {
        await processor.stop();
    }
}

main();

