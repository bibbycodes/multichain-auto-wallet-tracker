import { GeckoTerminalMapper } from '../gecko-terminal-mapper';
import { Pool, GeckoTerminalTokenDetails } from 'python-proxy-scraper-client';

// Import real fixtures
import tokenDetailsFixture from '../../../../../../tests/fixtures/gecko-terminal/tokenDetails-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import tokenPoolsFixture from '../../../../../../tests/fixtures/gecko-terminal/tokenPools-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

describe('GeckoTerminalMapper', () => {
    const realTokenDetails = tokenDetailsFixture as unknown as GeckoTerminalTokenDetails;
    const realTokenPools = tokenPoolsFixture as unknown as Pool[];

    describe('extractPrice', () => {
        it('should extract price from real token details', () => {
            const price = GeckoTerminalMapper.extractPrice(realTokenDetails);
            expect(price).toBe(0.000006559165138);
        });
    });

    describe('extractMarketCap', () => {
        it('should extract market cap from real token details', () => {
            const marketCap = GeckoTerminalMapper.extractMarketCap(realTokenDetails);
            expect(marketCap).toBeNull(); // This token has null market cap in the fixture
        });
    });

    describe('extractLiquidity', () => {
        it('should extract liquidity from real token details', () => {
            const liquidity = GeckoTerminalMapper.extractLiquidity(realTokenDetails);
            expect(liquidity).toBe(5247.33211054772432250458544596);
        });
    });

    describe('extractSupply', () => {
        it('should extract supply from real token details', () => {
            const supply = GeckoTerminalMapper.extractSupply(realTokenDetails);
            expect(supply).toBe(1000000000000000000000000000.0);
        });
    });

    describe('extractDecimals', () => {
        it('should extract decimals from real token details', () => {
            const decimals = GeckoTerminalMapper.extractDecimals(realTokenDetails);
            expect(decimals).toBe(18);
        });
    });

    describe('extractName', () => {
        it('should extract name from real token details', () => {
            const name = GeckoTerminalMapper.extractName(realTokenDetails);
            expect(name).toBe('Russell rug Survivor');
        });
    });

    describe('extractSymbol', () => {
        it('should extract symbol from real token details', () => {
            const symbol = GeckoTerminalMapper.extractSymbol(realTokenDetails);
            expect(symbol).toBe('RUGSURVIVE');
        });
    });

    describe('extractPairAddress', () => {
        it('should return null when no pools provided', () => {
            const result = GeckoTerminalMapper.extractPairAddress([]);
            expect(result).toBeNull();
        });

        it('should return the pool id when only one pool provided', () => {
            const singlePool = [realTokenPools[0]];
            const result = GeckoTerminalMapper.extractPairAddress(singlePool);
            expect(result).toBe('bsc_0xe8852d270294cc9a84fe73d5a434ae85a1c34444');
        });

        it('should return the pool with highest 24h volume when multiple pools provided', () => {
            // Create multiple pools with different volumes
            const poolsWithDifferentVolumes: Pool[] = [
                {
                    ...realTokenPools[0],
                    id: 'pool-1',
                    attributes: {
                        ...realTokenPools[0].attributes,
                        volume_usd: { m5: '100', h1: '500', h6: '800', h24: '1000' }
                    }
                },
                {
                    ...realTokenPools[0],
                    id: 'pool-2',
                    attributes: {
                        ...realTokenPools[0].attributes,
                        volume_usd: { m5: '200', h1: '1000', h6: '2000', h24: '5000' }
                    }
                },
                {
                    ...realTokenPools[0],
                    id: 'pool-3',
                    attributes: {
                        ...realTokenPools[0].attributes,
                        volume_usd: { m5: '150', h1: '750', h6: '1500', h24: '2500' }
                    }
                }
            ];

            const result = GeckoTerminalMapper.extractPairAddress(poolsWithDifferentVolumes);
            expect(result).toBe('pool-2'); // Should return pool-2 as it has the highest volume (5000)
        });

        it('should handle pools with invalid and zero volumes', () => {
            const poolsWithMixedData: Pool[] = [
                {
                    ...realTokenPools[0],
                    id: 'pool-1',
                    attributes: {
                        ...realTokenPools[0].attributes,
                        volume_usd: { m5: 'invalid', h1: 'invalid', h6: 'invalid', h24: 'invalid' }
                    }
                },
                {
                    ...realTokenPools[0],
                    id: 'pool-2',
                    attributes: {
                        ...realTokenPools[0].attributes,
                        volume_usd: { m5: '0', h1: '0', h6: '0', h24: '0' }
                    }
                },
                {
                    ...realTokenPools[0],
                    id: 'pool-3',
                    attributes: {
                        ...realTokenPools[0].attributes,
                        volume_usd: { m5: '100', h1: '500', h6: '1000', h24: '2000' }
                    }
                }
            ];

            const result = GeckoTerminalMapper.extractPairAddress(poolsWithMixedData);
            expect(result).toBe('pool-3');
        });
    });
});
