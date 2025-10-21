import * as fs from "fs";
import * as path from "path";
import { ProcessedMessageResult, TelegramChannel, TelegramMessageData, TelegramUpdate } from "./types";
import { TelegramParserRouter } from "./channel-parsers/parser-router/parser-router";

export class TelegramMessageParser {

    constructor() {}

    public parseMessage(update: TelegramUpdate): TelegramMessageData | null {
        const message = update?.message;
        if (!message?.message) return null;

        const text = message.message;
        const peerInfo = this.extractPeerInfo(message.peerId);

        return {
            text,
            channelId: peerInfo.isChannel ? peerInfo.chatId : undefined,
            chatId: peerInfo.chatId,
            isChannel: peerInfo.isChannel,
            isGroup: peerInfo.isGroup,
            isPrivate: peerInfo.isPrivate,
            messageId: message.id,
            timestamp: message.date,
        };
    }

    public processMessage(update: TelegramUpdate): ProcessedMessageResult | null {
        const messageData = this.parseMessage(update);
        if (!messageData) return null;

        const tokenData = TelegramParserRouter.parseMessage(update.message);
        if (!tokenData) return null;
        if (!tokenData.address) return null;

        return {
            messageData,
            tokenData,
            hasTokenData: !!tokenData,
        };
    }

    /**
     * Saves a telegram update to file for testing fixtures.
     * Organizes by channel: telegram-updates/<channel_name || username || channelId>/<messageId>.json
     * @param update - The telegram update object
     * @param channelMap - Map of channel IDs to channel info
     * @param outputDir - Optional output directory (defaults to telegram-updates/)
     */
    public saveUpdateToFile(
        update: TelegramUpdate, 
        channelMap: Map<string, TelegramChannel>,
        outputDir?: string
    ): string | null {
        const message = update?.message;
        const peerId = message?.peerId;
        
        // Only save channel messages
        if (!peerId || peerId.className !== 'PeerChannel') {
            return null;
        }

        const channelId = peerId.channelId.toString();
        const messageId = message?.id;
        
        if (!channelId || !messageId) {
            return null;
        }

        // Look up channel info from channelMap
        const channel = channelMap.get(channelId);
        const identifier = channel?.title || channel?.username || channelId;
        const sanitizedIdentifier = identifier 
            ? identifier.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            : channelId;

        const baseDir = outputDir || path.join(process.cwd(), "telegram-updates");
        const channelDir = path.join(baseDir, sanitizedIdentifier);
        
        // Create channel directory if it doesn't exist
        if (!fs.existsSync(channelDir)) {
            fs.mkdirSync(channelDir, { recursive: true });
        }

        const filename = `${messageId}.json`;
        const filepath = path.join(channelDir, filename);

        // Save the raw update data
        fs.writeFileSync(filepath, JSON.stringify(update, null, 2));

        return filepath;
    }

    private extractPeerInfo(peerId: any) {
        const result = {
            chatId: 0,
            isChannel: false,
            isGroup: false,
            isPrivate: false,
        };

        if (!peerId) return result;

        if (peerId.className === 'PeerChannel') {
            result.chatId = parseInt(peerId.channelId.toString());
            result.isChannel = true;
        } else if (peerId.className === 'PeerChat') {
            result.chatId = parseInt(peerId.chatId.toString());
            result.isGroup = true;
        } else if (peerId.className === 'PeerUser') {
            result.chatId = parseInt(peerId.userId.toString());
            result.isPrivate = true;
        }

        return result;
    }
}
