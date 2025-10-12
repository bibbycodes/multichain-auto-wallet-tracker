import { env } from "../../../src/lib/services/util/env/env";
import { TelegramMessageQueue } from "../../../src/queues/telegram-message/telegram-message-queue";
import { SendMessageToChannelData, TelegramMessageJobTypes } from "../../../src/queues/telegram-message/types";
import { ChainsMap } from "../../../src/shared/chains";

async function testMessageBroadcast() {
    const queue = TelegramMessageQueue.getInstance();

    // Sample token data for testing
    const testToken = {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        chainId: ChainsMap.bsc,
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
        socials: {
            telegram: "https://t.me/testtoken",
            twitter: "https://twitter.com/testtoken",
            website: "https://testtoken.com"
        },
        logoUrl: "https://example.com/logo.png",
        description: "This is a test token for message broadcasting",
        totalSupply: 1000000,
        pairAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const messageData: SendMessageToChannelData = {
        channelId: env.telegram.wbbBscChannelId,
        caption: `🚀 <b>Test Token Alert</b>\n\n` +
                 `<b>Token:</b> ${testToken.name} (${testToken.symbol})\n` +
                 `<b>Address:</b> <code>${testToken.address}</code>\n` +
                 `<b>Chain:</b> BSC\n\n` +
                 `<b>Socials:</b>\n` +
                 `🌐 ${testToken.socials.website}\n` +
                 `🐦 ${testToken.socials.twitter}\n` +
                 `💬 ${testToken.socials.telegram}\n\n` +
                 `This is a test message from the auto-tracker system.`,
        photo: testToken.logoUrl,
        token: testToken
    };

    console.log('Adding test message to queue...');
    
    const jobId = await queue.addJob({
        type: TelegramMessageJobTypes.SEND_MESSAGE,
        data: messageData
    });

    if (jobId) {
        console.log(`✅ Job added successfully with ID: ${jobId}`);
        console.log(`Message will be sent to channel: ${messageData.channelId}`);
    } else {
        console.error('❌ Failed to add job to queue');
    }

    // Keep the script running for a moment to see the result
    setTimeout(async () => {
        const stats = await queue.getStats();
        console.log('\nQueue stats:', stats);
        await queue.close();
        process.exit(0);
    }, 5000);
}

testMessageBroadcast().catch(console.error);

