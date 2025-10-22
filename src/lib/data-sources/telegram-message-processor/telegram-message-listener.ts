import { TelegramClient as GramJsClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { TotalList } from "telegram/Helpers";
import { Dialog } from "telegram/tl/custom/dialog";
import { Api } from "telegram/tl";
import { TelegramMessageParser } from "./telegram-message-parser";
import { TelegramChannel, ProcessedMessageResult, TelegramMessageData, TelegramUpdate } from "./types";
import { env } from "../../services/util/env/env";

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
        const result = this.processAndSaveMessage(update);
        if (result && this.messageHandler) {
            this.messageHandler(result);
        }
    }

    public processAndSaveMessage(update: TelegramUpdate, saveToFixture: boolean = false): ProcessedMessageResult | null {
        if (saveToFixture) {
            // Save raw update to file for testing fixtures - DISABLED
            this.parser.saveUpdateToFile(update, this.channelMap);
        }
        
        const result = this.parser.processMessage(update);
        if (!result) return null;

        // Enhance with channel information if available
        if (result.messageData.channelId) {
            const channelId = result.messageData.channelId.toString();
            const channel = this.channelMap.get(channelId);
            if (channel) {
                result.messageData.chatTitle = channel.title;
            }
        }

        console.log('Processing message from:', result.messageData.chatTitle);
        console.log("Message Text:", result.messageData.text);

        return result;
    }

    public parseMessage(update: TelegramUpdate): TelegramMessageData | null {
        return this.parser.parseMessage(update);
    }

    public processMessage(update: TelegramUpdate): ProcessedMessageResult | null {
        return this.parser.processMessage(update);
    }

    public getChannelInfo(channelId: string): TelegramChannel | undefined {
        return this.channelMap.get(channelId);
    }

    public getAllChannels(): TelegramChannel[] {
        return Array.from(this.channelMap.values());
    }

    public getChannelMap(): Map<string, TelegramChannel> {
        return this.channelMap;
    }

    public async getMessages(channelId: string, limit: number): Promise<any[]> {
        await this.connect();
        await this.loadChannels();

        const entity = await this.gramJsClient.getEntity(parseInt(channelId));
        return await this.gramJsClient.getMessages(entity, { limit });
    }

    public async getMessage(channelId: string, messageId: number): Promise<any | null> {
        await this.connect();
        await this.loadChannels();

        const entity = await this.gramJsClient.getEntity(parseInt(channelId));
        const messages = await this.gramJsClient.getMessages(entity, { ids: [messageId] });
        return messages.length > 0 ? messages[0] : null;
    }

    /**
     * Join a channel or group
     * @param channelIdentifier - Channel username (e.g., '@channel'), invite link, or channel ID
     * @returns The channel info if successful
     */
    public async joinChannel(channelIdentifier: string): Promise<any> {
        await this.connect();

        // Get the channel entity
        const channel = await this.gramJsClient.getEntity(channelIdentifier);

        // Join the channel
        const result = await this.gramJsClient.invoke(
            new Api.channels.JoinChannel({
                channel: channel,
            })
        );

        // Reload channels to update our map
        await this.loadChannels();

        console.log(`Successfully joined channel: ${channelIdentifier}`);
        return result;
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.gramJsClient.disconnect();
            this.isConnected = false;
        }
    }
}
