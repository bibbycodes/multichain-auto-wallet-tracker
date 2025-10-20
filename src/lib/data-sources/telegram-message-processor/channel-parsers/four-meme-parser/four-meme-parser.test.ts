import { FourMemeParser } from './four-meme-parser';
import { Api } from 'telegram';
import { ChainsMap } from '../../../../../shared/chains';

describe('FourMemeParser', () => {
    let parser: FourMemeParser;

    beforeEach(() => {
        parser = new FourMemeParser();
    });

    describe('isNewCallMessage', () => {
        it('should identify new call messages with correct format', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
Search on 𝕏
Created: 11s ago | Dex Paid: ❌
MarketCap: $46,672 
Holders: 18 | TOP 10: 56.9%
  └12.8%| 9.3%| 8.1%| 6.1%| 4.1%| 3.7%| 3.5%| 👨‍💻3.3%| 3.2%| 2.8%

Creator: 0x699EFd2d1B482c1eBCB2C5D44ceDb2857C610a4B
 ├BNB: 0.15 BNB
 └Token: 3.34%
Socials: Website

MevX | Dexscreener | Four.Meme`;
            
            const mockMessage = {
                message: messageText,
                id: 1,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(true);
        });

        it('should not identify messages without Pair:', () => {
            const messageText = `CiciBytedanceComp (Cici)

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
MarketCap: $46,672`;
            
            const mockMessage = {
                message: messageText,
                id: 2,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });

        it('should not identify messages without CA:', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

Volume: $0
MarketCap: $46,672`;
            
            const mockMessage = {
                message: messageText,
                id: 3,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });

        it('should not identify messages without MarketCap:', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0`;
            
            const mockMessage = {
                message: messageText,
                id: 4,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseNewCallMessage', () => {
        it('should parse complete message correctly', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
Search on 𝕏
Created: 11s ago | Dex Paid: ❌
MarketCap: $46,672 
Holders: 18 | TOP 10: 56.9%
  └12.8%| 9.3%| 8.1%| 6.1%| 4.1%| 3.7%| 3.5%| 👨‍💻3.3%| 3.2%| 2.8%

Creator: 0x699EFd2d1B482c1eBCB2C5D44ceDb2857C610a4B
 ├BNB: 0.15 BNB
 └Token: 3.34%
Socials: Website

MevX | Dexscreener | Four.Meme`;
            
            const mockMessage = {
                message: messageText,
                entities: [
                    {
                        offset: 0,
                        length: 2,
                        className: 'MessageEntityCustomEmoji'
                    },
                    {
                        offset: 41,
                        length: 2,
                        url: 'https://dexscreener.com/bsc/0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                        className: 'MessageEntityTextUrl'
                    }
                ],
                id: 5,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'CiciBytedanceComp',
                symbol: 'Cici',
                address: '0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                chainId: ChainsMap.bsc,
                pairAddress: '0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                createdBy: '0x699EFd2d1B482c1eBCB2C5D44ceDb2857C610a4B'
            });
        });

        it('should parse message with different name and symbol format', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

CA: 0x1234567890abcdef1234567890abcdef12345678
Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 6,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'TestToken',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: ChainsMap.bsc,
                pairAddress: '0x1234567890abcdef1234567890abcdef12345678',
                createdBy: undefined
            });
        });

        it('should parse message with Chinese characters and creator address', () => {
            const messageText = `米娅 (米娅)
Pair: 米娅/BNB_MPC

CA: 0x44445CC7f585eFcD6FFfe1Ec54586c64A9a02Ea6
Volume: $0
Search on 𝕏
Created: 17s ago | Dex Paid: ❌
MarketCap: $46,626 
Holders: 7 | TOP 10: 40.4%
  └20.1%| 12.6%| 3.9%| 3.8%| 0%

Creator: 0xe4e2021A48f0aA3287BddfC7a68EB19e566595bA
 ├BNB: 1.22 BNB
 └Token: 0.00%
Socials: Twitter | Website

MevX | Dexscreener | Four.Meme`;
            
            const mockMessage = {
                message: messageText,
                id: 21,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: '米娅',
                symbol: '米娅',
                address: '0x44445CC7f585eFcD6FFfe1Ec54586c64A9a02Ea6',
                chainId: ChainsMap.bsc,
                pairAddress: '0x44445CC7f585eFcD6FFfe1Ec54586c64A9a02Ea6',
                createdBy: '0xe4e2021A48f0aA3287BddfC7a68EB19e566595bA'
            });
        });

        it('should parse message with special characters in name and symbol', () => {
            const messageText = `Test@Token#123 (TEST$SYM)
Pair: TEST$SYM/BNB

CA: 0xabcdef1234567890abcdef1234567890abcdef12
Volume: $500
MarketCap: $25,000`;
            
            const mockMessage = {
                message: messageText,
                id: 7,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'Test@Token#123',
                symbol: 'TEST$SYM',
                address: '0xabcdef1234567890abcdef1234567890abcdef12',
                chainId: ChainsMap.bsc,
                pairAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                createdBy: undefined
            });
        });

        it('should return null for message without name and symbol pattern', () => {
            const messageText = `Invalid format
Pair: TEST/BNB

CA: 0x1234567890abcdef1234567890abcdef12345678
Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 8,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should return null for message without CA address', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 9,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should return null for message with invalid address format', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

CA: 0xINVALID
Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 10,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should return null for empty message', () => {
            const mockMessage = {
                message: '',
                id: 11,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });
    });

    describe('isTokenUpdateMessage', () => {
        it('should always return false for FourMeme parser', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
MarketCap: $46,672`;
            
            const mockMessage = {
                message: messageText,
                id: 12,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
        });
    });

    describe('parseTokenUpdateMessage', () => {
        it('should always return null for FourMeme parser', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
MarketCap: $46,672`;
            
            const mockMessage = {
                message: messageText,
                id: 13,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
        });
    });

    describe('parseMessage', () => {
        it('should parse new call message through main parseMessage method', () => {
            const messageText = `CiciBytedanceComp (Cici)
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
MarketCap: $46,672`;
            
            const mockMessage = {
                message: messageText,
                id: 14,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseMessage(mockMessage);

            expect(result).toEqual({
                name: 'CiciBytedanceComp',
                symbol: 'Cici',
                address: '0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                chainId: ChainsMap.bsc,
                pairAddress: '0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                createdBy: undefined
            });
        });

        it('should return null for non-new call message', () => {
            const messageText = `Regular message without required fields`;
            
            const mockMessage = {
                message: messageText,
                id: 15,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseMessage(mockMessage)).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle message with whitespace around name and symbol', () => {
            const messageText = `  CiciBytedanceComp  (  Cici  )
Pair: Cici/BNB

CA: 0x8d54660A2bFc103dCAA32796696C2Be5e0364444
Volume: $0
MarketCap: $46,672`;
            
            const mockMessage = {
                message: messageText,
                id: 16,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'CiciBytedanceComp',
                symbol: 'Cici',
                address: '0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                chainId: ChainsMap.bsc,
                pairAddress: '0x8d54660A2bFc103dCAA32796696C2Be5e0364444',
                createdBy: undefined
            });
        });

        it('should handle message with multiple addresses and extract first valid one', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

CA: 0x1234567890abcdef1234567890abcdef12345678
Another address: 0xabcdef1234567890abcdef1234567890abcdef12
Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 17,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result?.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
        });

        it('should handle undefined message property', () => {
            const mockMessage = {
                id: 18,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.isTokenUpdateMessage(mockMessage)).toBe(false);
            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
            expect(parser.parseTokenUpdateMessage(mockMessage)).toBeNull();
            expect(parser.parseMessage(mockMessage)).toBeNull();
        });

        it('should handle message with only partial required fields', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 19,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.isNewCallMessage(mockMessage)).toBe(false);
            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle message with CA: but no valid address', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

CA: 
Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 20,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            expect(parser.parseNewCallMessage(mockMessage)).toBeNull();
        });

        it('should handle message with creator address but invalid format', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

CA: 0x1234567890abcdef1234567890abcdef12345678
Volume: $1000
MarketCap: $50,000

Creator: 0xINVALID`;
            
            const mockMessage = {
                message: messageText,
                id: 22,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'TestToken',
                symbol: 'TEST',
                address: '0x1234567890abcdef1234567890abcdef12345678',
                chainId: ChainsMap.bsc,
                pairAddress: '0x1234567890abcdef1234567890abcdef12345678',
                createdBy: undefined
            });
        });

        it('should handle message with creator address in different position', () => {
            const messageText = `TestToken (TEST)
Pair: TEST/BNB

Creator: 0x1234567890abcdef1234567890abcdef12345678
CA: 0xabcdef1234567890abcdef1234567890abcdef12
Volume: $1000
MarketCap: $50,000`;
            
            const mockMessage = {
                message: messageText,
                id: 23,
                date: 1738429976,
                peerId: { channelId: '2649439684', className: 'PeerChannel' },
                className: 'Message'
            } as unknown as Api.Message;

            const result = parser.parseNewCallMessage(mockMessage);

            expect(result).toEqual({
                name: 'TestToken',
                symbol: 'TEST',
                address: '0xabcdef1234567890abcdef1234567890abcdef12',
                chainId: ChainsMap.bsc,
                pairAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                createdBy: '0x1234567890abcdef1234567890abcdef12345678'
            });
        });
    });

    describe('channelId', () => {
        it('should have correct channel ID', () => {
            expect(parser.channelId).toBe('2649439684');
        });
    });
});
