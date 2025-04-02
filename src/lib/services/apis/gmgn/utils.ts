import { TrackedWalletType } from "@prisma/client";
import { ChainId, ChainsMap } from "../../../../shared/chains";

export function chainIdToGmGnChain(chainId: ChainId): string {
    switch (chainId) {
        case 'solana': return 'sol';
        case '1': return 'eth';
        case '42161': return 'arb';
        case '43114': return 'avax';
        case '56': return 'bsc';
        case '10': return 'opt';
        case '137': return 'polygon';
        case '8453': return 'base';
        case '324': return 'zksync';
        default: throw new Error(`Unsupported chainId: ${chainId}`);
    }
}

export function gmGnChainToChainId(chain: string): ChainId {
    switch (chain) {
        case 'sol': return ChainsMap.solana;
        case 'eth': return ChainsMap.ethereum;
        case 'arb': return ChainsMap.arbitrum;
        case 'avax': return ChainsMap.avalanche;
        case 'bsc': return ChainsMap.bsc;
        case 'opt': return ChainsMap.optimism;
        case 'polygon': return ChainsMap.polygon;
        case 'base': return ChainsMap.base;
        case 'zksync': return ChainsMap.zksync;
        default: throw new Error(`Unsupported chain: ${chain}`);
    }
}

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