import { TelegramClient as GramJsClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { TotalList } from "telegram/Helpers";
import { Dialog } from "telegram/tl/custom/dialog";
import { TelegramMessageParser } from "./telegram-message-parser";
import { TelegramChannel, ProcessedMessageResult, TelegramMessageData } from "./types";
import { env } from "../util/env/env";

export class TelegramMessageListener {
    private gramJsClient: GramJsClient;
    private parser: TelegramMessageParser;
    private messageHandler?: (result: ProcessedMessageResult) => void;
    private isConnected: boolean = false;
    private channelMap: Map<string, TelegramChannel> = new Map();

    constructor() {
        this.gramJsClient = new GramJsClient(
            new StringSession(env.telegram.sessionString),
            env.telegram.apiId,
            env.telegram.apiHash,
            {
                connectionRetries: 5,
            }
        );
        this.parser = new TelegramMessageParser();
    }

    public async start(): Promise<void> {
        await this.connect();
        await this.loadChannels();
        this.gramJsClient.addEventHandler((update) => {
            this.handleMessage(update);
        });
    }

    public onMessage(handler: (result: ProcessedMessageResult) => void): void {
        this.messageHandler = handler;
    }

    private async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.gramJsClient.connect();
            this.isConnected = true;
        }
    }

    private async loadChannels(): Promise<void> {
        try {
            const dialogs: TotalList<Dialog> = await this.gramJsClient.getDialogs();
            const channels = dialogs.map((dialog: any) => {
                const entity = dialog.entity;
                return {
                    id: entity.id.toString(),
                    title: entity.title,
                    username: entity.username,
                    type: this.determineChannelType(entity),
                    verified: entity.verified,
                    participantsCount: entity.participantsCount,
                } as TelegramChannel;
            });

            channels.forEach(channel => {
                this.channelMap.set(channel.id, channel);
            });

            console.log(`Loaded ${channels.length} channels`);
        } catch (error) {
            console.error('Error loading channels:', error);
            throw error;
        }
    }

    private determineChannelType(entity: any): 'channel' | 'group' | 'supergroup' | 'megagroup' {
        if (entity.broadcast) {
            return 'channel';
        } else if (entity.gigagroup) {
            return 'supergroup';
        } else if (entity.megagroup) {
            return 'megagroup';
        } else {
            return 'group';
        }
    }

    private handleMessage(update: any): void {
        const result = this.parser.processMessage(update);
        if (!result) return;

        // Enhance with channel information if available
        if (result.messageData.channelId) {
            const channelId = result.messageData.channelId.toString();
            const channel = this.channelMap.get(channelId);
            if (channel) {
                result.messageData.chatTitle = channel.title;
            }
        }

        console.log('Processing message from:', result.messageData.chatTitle);

        if (this.messageHandler) {
            this.messageHandler(result);
        }
    }

    public parseMessage(update: any): TelegramMessageData | null {
        return this.parser.parseMessage(update);
    }

    public processMessage(update: any): ProcessedMessageResult | null {
        return this.parser.processMessage(update);
    }

    public getChannelInfo(channelId: string): TelegramChannel | undefined {
        return this.channelMap.get(channelId);
    }

    public getAllChannels(): TelegramChannel[] {
        return Array.from(this.channelMap.values());
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.gramJsClient.disconnect();
            this.isConnected = false;
        }
    }
}
