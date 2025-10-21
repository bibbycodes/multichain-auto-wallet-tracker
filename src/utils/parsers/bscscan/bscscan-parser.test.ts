import { BscscanParser } from './bscscan-parser';
import { ChainsMap } from '../../../shared/chains';

describe('BscscanParser', () => {
    describe('parseAddressUrl', () => {
        it('should parse valid BSC address URL', () => {
            const url = 'https://bscscan.com/address/0x36a2f74b4ecc8d0a832c18cfcfffe01904d70095';
            const result = BscscanParser.parseAddressUrl(url);
            
            expect(result).toEqual({
                address: '0x36a2f74b4ecc8d0a832c18cfcfffe01904d70095',
                chainId: ChainsMap.bsc,
            });
        });

        it('should preserve mixed case addresses (checksummed)', () => {
            const url = 'https://bscscan.com/address/0xA0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
            const result = BscscanParser.parseAddressUrl(url);
            
            expect(result).toEqual({
                address: '0xA0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                chainId: ChainsMap.bsc,
            });
        });

        it('should return null for invalid URL formats', () => {
            expect(BscscanParser.parseAddressUrl('https://example.com/address/0x123')).toBeNull();
            expect(BscscanParser.parseAddressUrl('http://bscscan.com/address/0x123')).toBeNull();
        });

        it('should return null for malformed bscscan URLs', () => {
            expect(BscscanParser.parseAddressUrl('https://bscscan.com/0x123')).toBeNull();
            expect(BscscanParser.parseAddressUrl('https://bscscan.com/address/')).toBeNull();
            expect(BscscanParser.parseAddressUrl('')).toBeNull();
        });

        it('should parse URL with extra path segments or query parameters', () => {
            const urlWithPath = 'https://bscscan.com/address/0x123/transactions';
            expect(BscscanParser.parseAddressUrl(urlWithPath)).toEqual({
                address: '0x123',
                chainId: ChainsMap.bsc,
            });

            const urlWithQuery = 'https://bscscan.com/address/0x456?tab=transactions';
            expect(BscscanParser.parseAddressUrl(urlWithQuery)).toEqual({
                address: '0x456',
                chainId: ChainsMap.bsc,
            });
        });
    });

    describe('parseTokenUrl', () => {
        it('should parse valid BSC token URL', () => {
            const url = 'https://bscscan.com/token/0x2170ed0880ac9a755fd29b2688956bd959f933f8';
            const result = BscscanParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
                chainId: ChainsMap.bsc,
            });
        });

        it('should preserve mixed case token addresses', () => {
            const url = 'https://bscscan.com/token/0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
            const result = BscscanParser.parseTokenUrl(url);
            
            expect(result).toEqual({
                tokenAddress: '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
                chainId: ChainsMap.bsc,
            });
        });

        it('should return null for invalid URL formats', () => {
            expect(BscscanParser.parseTokenUrl('https://example.com/token/0x123')).toBeNull();
            expect(BscscanParser.parseTokenUrl('http://bscscan.com/token/0x123')).toBeNull();
        });

        it('should return null for malformed token URLs', () => {
            expect(BscscanParser.parseTokenUrl('https://bscscan.com/token/')).toBeNull();
            expect(BscscanParser.parseTokenUrl('')).toBeNull();
        });

        it('should parse URL with query parameters', () => {
            const urlWithQuery = 'https://bscscan.com/token/0x789?tab=holders';
            expect(BscscanParser.parseTokenUrl(urlWithQuery)).toEqual({
                tokenAddress: '0x789',
                chainId: ChainsMap.bsc,
            });
        });
    });
});

