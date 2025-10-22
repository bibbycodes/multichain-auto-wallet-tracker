import { ChainsMap } from '../../../shared/chains';
import { EvmChain } from '../evm';
import { ChainConfig } from '../types';

describe('EvmChain', () => {
    const mockConfig: ChainConfig = {
        chainId: ChainsMap.bsc,
        chainName: 'Test Chain',
        nativeToken: 'TEST',
        wrappedNativeTokenAddress: '0xwrapped',
        usdcAddress: '0xusdc',
        usdtAddress: '0xusdt',
        burnAddresses: ['0x000000000000000000000000000000000000dead'],
        nullAddresses: ['0x0000000000000000000000000000000000000000'],
        knownAddresses: new Map([
            ['PANCAKESWAP_ROUTER', '0x10ed43c718714eb63d5aa57b78b54704e256024e'],
            ['UNISWAP_ROUTER', '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'],
        ]),
        knownLiquidityAddresses: new Map([
            ['POOL_1', '0x5c952063c7fc8610ffdb798152d69f0b9550762b'],
            ['POOL_2', '0x5cbddc44F31067dF328aA7a8Da03aCa6F2EdD2aD'],
        ]),
    };

    let chain: EvmChain;

    beforeEach(() => {
        chain = new EvmChain(mockConfig);
    });

    describe('isPoolOrLiquidityAddress', () => {
        it('should recognize addresses from knownLiquidityAddresses', () => {
            expect(chain.isPoolOrLiquidityAddress('0x5c952063c7fc8610ffdb798152d69f0b9550762b')).toBe(true);
        });

        it('should recognize addresses from knownAddresses', () => {
            expect(chain.isPoolOrLiquidityAddress('0x10ed43c718714eb63d5aa57b78b54704e256024e')).toBe(true);
        });

        it('should be case insensitive', () => {
            expect(chain.isPoolOrLiquidityAddress('0x10ED43C718714EB63D5AA57B78B54704E256024E')).toBe(true);
            expect(chain.isPoolOrLiquidityAddress('0x5C952063C7FC8610FFDB798152D69F0B9550762B')).toBe(true);
        });

        it('should return false for unknown addresses', () => {
            expect(chain.isPoolOrLiquidityAddress('0xe8852d270294cc9a84fe73d5a434ae85a1c34444')).toBe(false);
        });

        it('should handle mixed case addresses correctly', () => {
            expect(chain.isPoolOrLiquidityAddress('0x5CbDdc44F31067dF328aA7a8Da03aCa6F2EdD2aD')).toBe(true);
        });
    });

    describe('isBurnAddress', () => {
        it('should recognize dead address', () => {
            expect(chain.isBurnAddress('0x000000000000000000000000000000000000dead')).toBe(true);
        });

        it('should recognize null address', () => {
            expect(chain.isBurnAddress('0x0000000000000000000000000000000000000000')).toBe(true);
        });

        it('should be case insensitive', () => {
            expect(chain.isBurnAddress('0x000000000000000000000000000000000000DEAD')).toBe(true);
            expect(chain.isBurnAddress('0X0000000000000000000000000000000000000000')).toBe(true);
        });

        it('should return false for regular addresses', () => {
            expect(chain.isBurnAddress('0xe8852d270294cc9a84fe73d5a434ae85a1c34444')).toBe(false);
        });

        it('should return false for pool addresses', () => {
            expect(chain.isBurnAddress('0x10ed43c718714eb63d5aa57b78b54704e256024e')).toBe(false);
        });
    });

    describe('constructor defaults', () => {
        it('should use default burn addresses when not provided', () => {
            const minimalConfig: ChainConfig = {
                chainId: ChainsMap.bsc,
                chainName: 'Minimal Chain',
                nativeToken: 'MIN',
                wrappedNativeTokenAddress: '0xwrapped',
                usdcAddress: '0xusdc',
                usdtAddress: '0xusdt',
            };

            const minimalChain = new EvmChain(minimalConfig);
            expect(minimalChain.isBurnAddress('0x000000000000000000000000000000000000dead')).toBe(true);
        });

        it('should use default null addresses when not provided', () => {
            const minimalConfig: ChainConfig = {
                chainId: ChainsMap.bsc,
                chainName: 'Minimal Chain',
                nativeToken: 'MIN',
                wrappedNativeTokenAddress: '0xwrapped',
                usdcAddress: '0xusdc',
                usdtAddress: '0xusdt',
            };

            const minimalChain = new EvmChain(minimalConfig);
            expect(minimalChain.isBurnAddress('0x0000000000000000000000000000000000000000')).toBe(true);
        });

        it('should use empty maps when known addresses not provided', () => {
            const minimalConfig: ChainConfig = {
                chainId: ChainsMap.bsc,
                chainName: 'Minimal Chain',
                nativeToken: 'MIN',
                wrappedNativeTokenAddress: '0xwrapped',
                usdcAddress: '0xusdc',
                usdtAddress: '0xusdt',
            };

            const minimalChain = new EvmChain(minimalConfig);
            expect(minimalChain.isPoolOrLiquidityAddress('0x10ed43c718714eb63d5aa57b78b54704e256024e')).toBe(false);
        });
    });

    describe('existing methods', () => {
        it('isNativeToken should work correctly', () => {
            expect(chain.isNativeToken('0xwrapped')).toBe(true);
            expect(chain.isNativeToken('0xother')).toBe(false);
        });

        it('isQuoteToken should work correctly', () => {
            expect(chain.isQuoteToken('0xusdc')).toBe(true);
            expect(chain.isQuoteToken('0xusdt')).toBe(true);
            expect(chain.isQuoteToken('0xwrapped')).toBe(true);
            expect(chain.isQuoteToken('0xother')).toBe(false);
        });
    });
});

