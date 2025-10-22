import { ChainId, ChainsMap } from '../../../src/shared/chains';
import { EvmChain } from '../../../src/lib/chains/evm';
import { ChainConfig } from '../../../src/lib/chains/types';

/**
 * Creates a mock EvmChain with default BSC configuration
 * All fields can be overridden via the partial parameter
 */
export function createMockChain(partial: Partial<ChainConfig> = {}): EvmChain {
    const defaultConfig: ChainConfig = {
        chainId: ChainsMap.bsc,
        chainName: 'Binance Smart Chain',
        nativeToken: 'BNB',
        wrappedNativeTokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        usdcAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        usdtAddress: '0x55d398326f99059ff775485246999027b3197955',
        burnAddresses: ['0x000000000000000000000000000000000000dead'],
        nullAddresses: ['0x0000000000000000000000000000000000000000'],
        knownAddresses: new Map([
            ['PANCAKESWAP_V2_ROUTER', '0x10ed43c718714eb63d5aa57b78b54704e256024e'],
            ['ONE_INCH_ROUTER', '0x1111111254fb6c44bac0bed2854e76f90643097d'],
        ]),
        knownLiquidityAddresses: new Map([
            ['POOL_1', '0x5c952063c7fc8610ffdb798152d69f0b9550762b'],
        ]),
        ...partial,
    };

    return new EvmChain(defaultConfig);
}

/**
 * Creates a mock for ChainFactory.getChain that returns a mock chain
 * Can be used with jest.mock()
 */
export function mockChainFactory(chain?: EvmChain) {
    const mockChain = chain || createMockChain();
    
    // Return the mock implementation
    return {
        getChain: jest.fn().mockReturnValue(mockChain),
    };
}

/**
 * Creates a mock ChainFactory that returns different chains based on chainId
 */
export function mockChainFactoryWithMultipleChains(chains: Map<ChainId, EvmChain>) {
    return {
        getChain: jest.fn((chainId: ChainId) => {
            const chain = chains.get(chainId);
            if (!chain) {
                throw new Error(`Unsupported chain ID: ${chainId}`);
            }
            return chain;
        }),
    };
}

