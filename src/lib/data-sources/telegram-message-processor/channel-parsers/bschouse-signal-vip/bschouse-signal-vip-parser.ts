import { Api } from "telegram";
import { AutoTrackerTokenData } from "../../../../models/token/types";
import { ChainId, ChainsMap } from "../../../../../shared/chains";
import { BaseTelegramChannelParser } from "../base-telegram-message-parser/base-telegram-message-parser";
import { ContractAddressExtractor } from "../../../../services/contract-address-extractor";
import { SocialMedia } from "../../../../models/socials/types";

export class BscHouseSignalVipParser extends BaseTelegramChannelParser {
    readonly channelId: string = '2312141364'

    // "message": "⚡️ NEW CALL ⚡️\n\n➡️ TOKEN: openai mascot\n➡️ TICKER: Froge\n➡️ CHAIN: bsc\n➡️ MC: 49.55K\n\n➡️ CA:\n0x444401802C4eD91211b2ffdceb58C1F934f56783\n\n🌐 Website\n\n📈 Chart | Mevx Chart",
    isNewCallMessage(message: Api.Message): boolean {
        return message.message?.includes('⚡️ NEW CALL ⚡️') || false;
    }

    getChainId(message: Api.Message): ChainId | undefined {
        const chainMatch = message.message?.match(/➡️ CHAIN:\s*(.+)/);
        const chainText = chainMatch ? chainMatch[1].trim().toLowerCase() : null;

        if (chainText === 'bsc') {
            return ChainsMap.bsc;
        } else if (chainText === 'eth' || chainText === 'ethereum') {
            return ChainsMap.ethereum;
        } else if (chainText === 'base') {
            return ChainsMap.base;
        }

        return undefined;
    }

    extractSocialLinks(message: Api.Message): Partial<SocialMedia> {
        const socials: Partial<SocialMedia> = {};

        if (!message.message || !message.entities) {
            return socials;
        }

        const text = message.message;
        const entities = message.entities;

        for (const entity of entities) {
            // Only process MessageEntityTextUrl entities
            if (entity.className !== 'MessageEntityTextUrl') {
                continue;
            }

            // Type guard to ensure entity has url property
            if (!('url' in entity) || !entity.url) {
                continue;
            }

            // Extract the text that the URL is linked to using offset and length
            const linkText = text.substring(entity.offset, entity.offset + entity.length).toLowerCase();
            const url = entity.url;

            // Check if this is a website link (linked to "Website" text)
            if (linkText === 'website') {
                socials.website = url;
            }
            // Check if this is an X/Twitter link (linked to "X" text)
            else if (linkText === 'x') {
                socials.twitter = url;
            }
            // Check if this is a Telegram link (linked to "TG" text)
            else if (linkText === 'tg') {
                socials.telegram = url;
            }
        }

        return socials;
    }

    parseNewCallMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        if (!message.message) return null;

        const text = message.message;

        // Extract token name
        const tokenMatch = text.match(/➡️ TOKEN:\s*(.+)/);
        const tokenName = tokenMatch ? tokenMatch[1].trim() : undefined;

        // Extract symbol/ticker
        const tickerMatch = text.match(/➡️ TICKER:\s*(.+)/);
        if (!tickerMatch) return null;

        const symbol = tickerMatch[1].trim();
        const chainId = this.getChainId(message);

        // Extract contract address (EVM only)
        const addresses = ContractAddressExtractor.extractAllContractAddresses(text);

        const { evm } = addresses;

        if (evm.length === 0) {
            return null;
        }

        const address = evm[0];

        // Extract social links from entities
        const socials = this.extractSocialLinks(message);

        const result: Partial<AutoTrackerTokenData> = {
            symbol,
            address,
            chainId,
            socials,
        };

        if (tokenName) {
            result.name = tokenName;
        }

        return result;
    }

    isTokenUpdateMessage(message: Api.Message): boolean {
        return false
    }

    parseTokenUpdateMessage(message: Api.Message): Partial<AutoTrackerTokenData> | null {
        return null;
    }
}
