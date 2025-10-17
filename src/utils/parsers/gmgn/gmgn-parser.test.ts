import { GmGnParser } from './gmgn-parser';
import { ChainsMap } from '../../../shared/chains';

describe('GmGnParser', () => {
    describe('parseTokenUrl', () => {
        it('should parse valid EVM token URL (BSC) and convert to internal chain ID', () => {
            const url = 'https://gmgn.ai/bsc/token/0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a';
            const result = GmGnParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a',
                chainId: ChainsMap.bsc,
            });
        });

        it('should parse valid Solana token URL and convert to internal chain ID', () => {
            const url = 'https://gmgn.ai/sol/token/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
            const result = GmGnParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
                chainId: ChainsMap.solana,
            });
        });

        it('should parse Base token URL', () => {
            const url = 'https://gmgn.ai/base/token/0x1234567890abcdef1234567890abcdef12345678';
            const result = GmGnParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: ChainsMap.base,
            });
        });

        it('should return null for invalid URL format', () => {
            expect(GmGnParser.parseTokenUrl('https://example.com/token/0x123')).toBeNull();
            expect(GmGnParser.parseTokenUrl('http://gmgn.ai/bsc/token/0x123')).toBeNull();
        });

        it('should return null for malformed gmgn URL missing components', () => {
            expect(GmGnParser.parseTokenUrl('https://gmgn.ai/token/0x123')).toBeNull();
            expect(GmGnParser.parseTokenUrl('https://gmgn.ai/bsc/token/')).toBeNull();
            expect(GmGnParser.parseTokenUrl('')).toBeNull();
        });

        it('should parse URL with extra path segments or query parameters', () => {
            const urlWithPath = 'https://gmgn.ai/bsc/token/0x123/extra';
            expect(GmGnParser.parseTokenUrl(urlWithPath)).toEqual({
                tokenAddress: '0x123',
                chainId: ChainsMap.bsc,
            });

            const urlWithQuery = 'https://gmgn.ai/bsc/token/0x456?param=value';
            expect(GmGnParser.parseTokenUrl(urlWithQuery)).toEqual({
                tokenAddress: '0x456',
                chainId: ChainsMap.bsc,
            });
        });

        it('should return undefined chainId for unsupported chain identifiers', () => {
            const url = 'https://gmgn.ai/BSC/token/0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a';
            const result = GmGnParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '0x68418bb3b0cbbf99d971abeff9f66c11eea1e48a',
                chainId: undefined,
            });
        });

        it('should preserve mixed case token addresses', () => {
            const url = 'https://gmgn.ai/eth/token/0xA0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
            const result = GmGnParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '0xA0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                chainId: ChainsMap.ethereum,
            });
        });
    });
});
