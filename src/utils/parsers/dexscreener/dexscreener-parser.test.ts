import { DexscreenerParser } from './dexscreener-parser';
import { ChainsMap } from '../../../shared/chains';

describe('DexscreenerParser', () => {
    describe('parsePairUrl', () => {
        it('should parse valid EVM pair URL (BSC) and convert to internal chain ID', () => {
            const url = 'https://dexscreener.com/bsc/0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a';
            const result = DexscreenerParser.parsePairUrl(url);
            
            expect(result).toEqual({
                pairAddress: '0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a',
                chainId: ChainsMap.bsc,
            });
        });

        it('should parse valid Solana pair URL and convert to internal chain ID', () => {
            const url = 'https://dexscreener.com/solana/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
            const result = DexscreenerParser.parsePairUrl(url);
            
            expect(result).toEqual({
                pairAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
                chainId: ChainsMap.solana,
            });
        });

        it('should parse Ethereum pair URL', () => {
            const url = 'https://dexscreener.com/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
            const result = DexscreenerParser.parsePairUrl(url);
            
            expect(result).toEqual({
                pairAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                chainId: ChainsMap.ethereum,
            });
        });

        it('should return null for invalid URL format', () => {
            expect(DexscreenerParser.parsePairUrl('https://example.com/pair/0x123')).toBeNull();
            expect(DexscreenerParser.parsePairUrl('http://dexscreener.com/bsc/0x123')).toBeNull();
        });

        it('should return null for malformed dexscreener URL missing components', () => {
            expect(DexscreenerParser.parsePairUrl('https://dexscreener.com/0x123')).toBeNull();
            expect(DexscreenerParser.parsePairUrl('https://dexscreener.com/bsc/')).toBeNull();
            expect(DexscreenerParser.parsePairUrl('')).toBeNull();
        });

        it('should parse URL with extra path segments or query parameters', () => {
            const urlWithPath = 'https://dexscreener.com/bsc/0x123/extra';
            expect(DexscreenerParser.parsePairUrl(urlWithPath)).toEqual({
                pairAddress: '0x123',
                chainId: ChainsMap.bsc,
            });

            const urlWithQuery = 'https://dexscreener.com/bsc/0x456?param=value';
            expect(DexscreenerParser.parsePairUrl(urlWithQuery)).toEqual({
                pairAddress: '0x456',
                chainId: ChainsMap.bsc,
            });
        });

        it('should return undefined chainId for unsupported chain identifiers like tron', () => {
            const url = 'https://dexscreener.com/tron/tcplpakaib4gl6ajdfne3egdxjuaimt7ux';
            const result = DexscreenerParser.parsePairUrl(url);
            
            expect(result).toEqual({
                pairAddress: 'tcplpakaib4gl6ajdfne3egdxjuaimt7ux',
                chainId: undefined,
            });
        });

        it('should preserve mixed case pair addresses', () => {
            const url = 'https://dexscreener.com/ethereum/0xA0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
            const result = DexscreenerParser.parsePairUrl(url);
            
            expect(result).toEqual({
                pairAddress: '0xA0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                chainId: ChainsMap.ethereum,
            });
        });
    });
});
