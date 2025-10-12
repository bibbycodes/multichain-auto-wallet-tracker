import { TelegramMessageListener } from "./telegram-message-listener";
import { TelegramMessageParser } from "./telegram-message-parser";
import { JobType, TokenDetectionQueue } from "../../../queues/token-detection";
import { ChainsMap } from "../../../shared/chains";
import { ProcessedMessageResult, TelegramChannel } from "./types";
import { TelegramTokenDetectionJobData } from "../../../queues/token-detection/types";

/**
 * Orchestrates Telegram message processing pipeline:
 * 1. Listens to messages from Telegram channels
 * 2. Parses messages to extract contract addresses
 * 3. Queues token detection jobs for found addresses
 */
export class TelegramMessageProcessor {
    private listener: TelegramMessageListener;
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

    public parseMessage(update: any) {
        return this.parser.parseMessage(update);
    }

    public processMessage(update: any) {
        return this.parser.processMessage(update);
    }

    private handleProcessedMessage(result: ProcessedMessageResult): void {
        if (!result.hasTokens) {
            return;
        }

        const { messageData, evmContractAddresses, solanaContractAddresses } = result;

        if (evmContractAddresses.length > 0) {
            for (const address of evmContractAddresses) {
                this.tokenDetectionQueue.addJob<TelegramTokenDetectionJobData>({
                    type: JobType.PROCESS_TELEGRAM_TOKEN_DETECTION,
                    data: {
                        tokenAddress: address,
                        messageData
                    }
                });
            }
        }

        // if (solanaContractAddresses.length > 0) {
        //     for (const address of solanaContractAddresses) {
        //         this.tokenDetectionQueue.addJob<TelegramTokenDetectionJobData>({
        //             type: JobType.PROCESS_TELEGRAM_TOKEN_DETECTION,
        //             data: {
        //                 tokenAdress: address,
        //                 messageData
        //             }
        //         });
        //     }
        // }
    }
}
