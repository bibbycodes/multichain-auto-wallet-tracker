import { JobType, TokenDetectionQueue } from "../../../queues/token-detection";
import { TelegramTokenDetectionJobData } from "../../../queues/token-detection/types";
import { ChainsMap } from "../../../shared/chains";
import { isSolanaAddress } from "../../services/util/common";
import { TelegramMessageListener } from "./telegram-message-listener";
import { TelegramMessageParser } from "./telegram-message-parser";
import { ProcessedMessageResult, TelegramChannel, TelegramUpdate } from "./types";

/**
 * Orchestrates Telegram message processing pipeline:
 * 1. Listens to messages from Telegram channels
 * 2. Parses messages to extract contract addresses
 * 3. Queues token detection jobs for found addresses
 */
export class TelegramMessageProcessor {
    public listener: TelegramMessageListener;
    private parser: TelegramMessageParser;
    private tokenDetectionQueue: TokenDetectionQueue;

    constructor(
        listener?: TelegramMessageListener,
        parser?: TelegramMessageParser,
        queue?: TokenDetectionQueue
    ) {
        this.listener = listener || new TelegramMessageListener();
        this.parser = parser || new TelegramMessageParser();
        this.tokenDetectionQueue = queue || TokenDetectionQueue.getInstance();
    }

    public async start(): Promise<void> {
        this.listener.onMessage((result: ProcessedMessageResult) => {
            this.handleProcessedMessage(result);
        });
        await this.listener.start();
    }


    public async stop(): Promise<void> {
        await this.listener.disconnect();
    }

    public getChannelInfo(channelId: string): TelegramChannel | undefined {
        return this.listener.getChannelInfo(channelId);
    }

    public getAllChannels(): TelegramChannel[] {
        return this.listener.getAllChannels();
    }

    public processMessage(update: TelegramUpdate) {
        return this.parser.processMessage(update);
    }

    /**
     * Fetch historical messages from a channel and save to fixtures
     * @param channelId - Channel ID
     * @param limit - Number of messages to fetch (default: 100)
     */
    public async fetchHistoricalMessages(
        channelId: string,
        limit: number = 100
    ): Promise<any[]> {
        const messages = await this.listener.getMessages(channelId, limit);

        console.log(`Fetched ${messages.length} messages from channel ${channelId}`);

        // Process and save each message using same flow as live messages
        messages.forEach((msg: any) => {
            if (msg) {
                const update = { message: msg };
                this.listener.processAndSaveMessage(update);
            }
        });

        return messages;
    }

    /**
     * Fetch a specific message from a channel
     * @param channelId - Channel ID
     * @param messageId - Message ID
     * @param saveToFixture - Whether to save the message to fixtures (default: true)
     */
    public async fetchMessage(
        channelId: string,
        messageId: number,
        saveToFixture: boolean = true
    ): Promise<any | null> {
        const message = await this.listener.getMessage(channelId, messageId);

        if (!message) {
            console.log(`Message ${messageId} not found in channel ${channelId}`);
            return null;
        }

        console.log(`Fetched message ${messageId} from channel ${channelId}`);

        if (saveToFixture) {
            const update = { message };
            this.listener.processAndSaveMessage(update);
        }

        return message;
    }

    /**
     * Join a Telegram channel
     * @param channelIdentifier - Channel username (@username), invite link, or channel ID
     */
    public async joinChannel(channelIdentifier: string): Promise<any> {
        return await this.listener.joinChannel(channelIdentifier);
    }

    private handleProcessedMessage(result: ProcessedMessageResult): void {
        if (!result.hasTokenData) {
            return;
        }

        const { messageData, tokenData } = result;

        if (!tokenData.address) {
            return;
        }

        if (tokenData.chainId === ChainsMap.solana) {
            return;
        }

        if (isSolanaAddress(tokenData.address)) {
            return;
        }

        this.tokenDetectionQueue.addJob<TelegramTokenDetectionJobData>({
            type: JobType.PROCESS_TELEGRAM_TOKEN_DETECTION,
            data: {
                tokenData,
                messageData
            }
        });

    }
}
