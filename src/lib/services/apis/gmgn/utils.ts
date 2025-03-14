import { ChainId } from "../../../../shared/chains";

export function chainIdToChain(chainId: ChainId): string {
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