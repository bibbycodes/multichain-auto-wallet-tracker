import { TelegramMessageProcessor } from "../../lib/data-sources/telegram-message-processor/telegram-message-processor";

export const getChannels = async () => {
    const channelName = 'bullish';
    const telegramMessageProcessor = new TelegramMessageProcessor();
    telegramMessageProcessor.listener.start().then(() => {
        const channels = telegramMessageProcessor.getAllChannels();
        console.log(channels.filter((c) => c.title?.toLowerCase().includes(channelName.toLowerCase()) || c.username?.toLowerCase().includes(channelName.toLowerCase())));
    }).catch((error) => {
        console.error(error);
    });
}

getChannels().then((channels) => {
    console.log(channels);
}); 