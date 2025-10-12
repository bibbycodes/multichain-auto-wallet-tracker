import { ContractAddressExtractor } from "../contract-address-extractor";
import { TelegramMessageData, ProcessedMessageResult } from "./types";

export class TelegramMessageParser {
    private contractAddressExtractor: ContractAddressExtractor;

    constructor() {
        this.contractAddressExtractor = new ContractAddressExtractor();
    }

    public parseMessage(update: any): TelegramMessageData | null {
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

    public processMessage(update: any): ProcessedMessageResult | null {
        const messageData = this.parseMessage(update);
        if (!messageData) return null;

        const evmContractAddresses = this.contractAddressExtractor.extractEvmContractAddress(messageData.text);
        const solanaContractAddresses = this.contractAddressExtractor.extractSolanaContractAddress(messageData.text);

        return {
            messageData,
            evmContractAddresses,
            solanaContractAddresses,
            hasTokens: evmContractAddresses.length > 0 || solanaContractAddresses.length > 0
        };
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
            result.chatId = parseInt(peerId.channelId);
            result.isChannel = true;
        } else if (peerId.className === 'PeerChat') {
            result.chatId = parseInt(peerId.chatId);
            result.isGroup = true;
        } else if (peerId.className === 'PeerUser') {
            result.chatId = parseInt(peerId.userId);
            result.isPrivate = true;
        }

        return result;
    }

    private extractChatTitle(message: any): string | undefined {
        const chat = message._chat || message.chat;
        return chat?.title || chat?.name;
    }
}
