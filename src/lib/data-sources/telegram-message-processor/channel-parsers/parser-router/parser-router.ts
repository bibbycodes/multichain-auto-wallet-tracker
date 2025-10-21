import { Api } from "telegram";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { TelegramChannelParser } from "../base-telegram-message-parser/base-telegram-message-parser";
import { OnChainAlphaTrenchParser } from "../on-chain-alpha-trench/on-chain-alpha-trench-parser";
import { KolScopeParser } from "../kol-scope/kol-scope-parser";
import { BullishBscCallsParser } from "../bullish-calls-parser/bullish-calls-bsc-parser";
import { FourMemeParser } from "../four-meme-parser/four-meme-parser";

export class TelegramParserRouter {
    private static parsers: Map<string, TelegramChannelParser> = new Map([
        ['2097131181', new OnChainAlphaTrenchParser()],
        ['2397610468', new KolScopeParser()],
        ['2421215845', new BullishBscCallsParser()],
        ['2649439684', new FourMemeParser()],
    ]);

    static parseMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        const channelId = this.extractChannelId(message);
        if (!channelId) {
            return null;
        }

        const parser = this.parsers.get(channelId);
        if (!parser) {
            return null;
        }

        return parser.parseMessage(message);
    }

    static addParser(channelId: string, parser: TelegramChannelParser): void {
        this.parsers.set(channelId, parser);
    }

    static removeParser(channelId: string): boolean {
        return this.parsers.delete(channelId);
    }

    static getParser(channelId: string): TelegramChannelParser | undefined {
        return this.parsers.get(channelId);
    }

    static getAllParsers(): Map<string, TelegramChannelParser> {
        return new Map(this.parsers);
    }

    static getSupportedChannelIds(): string[] {
        return Array.from(this.parsers.keys());
    }

    private static extractChannelId(message: Api.Message): string | null {
        const peerId = message?.peerId;
        if (!peerId || peerId.className !== 'PeerChannel') {
            return null;
        }
        return peerId.channelId.toString();
    }
}
