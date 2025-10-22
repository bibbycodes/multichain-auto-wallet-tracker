import { AutoTrackerToken } from '../../../src/lib/models/token';
import { AutoTrackerTokenData } from '../../../src/lib/models/token/types';
import { ChainId, ChainsMap } from '../../../src/shared/chains';
import { TokenDataSource } from '@prisma/client';

/**
 * Creates a mock AutoTrackerToken with default values
 * All fields can be overridden via the partial parameter
 */
export function createMockToken(partial: Partial<AutoTrackerTokenData> = {}): AutoTrackerToken {
    const defaultData: AutoTrackerTokenData = {
        address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
        chainId: ChainsMap.bsc,
        name: 'Mock Token',
        symbol: 'MOCK',
        decimals: 18,
        socials: {},
        pairAddress: '0xF0a949d3D93B833C183a27Ee067165B6F2C9625e',
        totalSupply: 1000000000,
        dataSource: TokenDataSource.BIRDEYE,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        ...partial,
    };

    return new AutoTrackerToken(defaultData);
}

/**
 * Creates multiple mock tokens with different addresses
 */
export function createMockTokens(count: number, chainId: ChainId = ChainsMap.bsc): AutoTrackerToken[] {
    return Array.from({ length: count }, (_, i) => 
        createMockToken({
            address: `0x${i.toString().padStart(40, '0')}`,
            chainId,
            symbol: `MOCK${i}`,
            name: `Mock Token ${i}`,
        })
    );
}

