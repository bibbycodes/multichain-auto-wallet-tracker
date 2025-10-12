import { TrackedWalletType } from "@prisma/client";

export function gmgnWalletTagToWalletType(tag: string): TrackedWalletType {
    switch (tag) {
        case 'smart_degen': return TrackedWalletType.SMART_MONEY;
        case 'whale': return TrackedWalletType.WHALE;
        case 'scammer': return TrackedWalletType.SCAMMER;
        case 'sandwich_bot': return TrackedWalletType.BOT;
        case 'bot': return TrackedWalletType.BOT;
        case 'kol': return TrackedWalletType.KOL;
        case 'institutional': return TrackedWalletType.INSTITUTIONAL;
        case 'rat_trader': return TrackedWalletType.INSIDER;
        case 'creator': return TrackedWalletType.DEV;
        case 'insider': return TrackedWalletType.INSIDER;
        case 'sniper': return TrackedWalletType.SNIPER;
        case 'fresh_wallet': return TrackedWalletType.INSIDER;
        default: return TrackedWalletType.UNKNOWN;
    }
}