import { TokenDataSource } from '@prisma/client';
import { BirdTokenEyeOverview, BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity, LpHolder } from '../client/types';
import { ChainId, ChainsMap } from '../../../../../shared/chains';
import { BirdeyeMapper } from '../birdeye-mapper';
import { BirdeyeChain } from '../client';

// Import fixtures
import tokenOverviewFixture from '../../../../../../tests/fixtures/birdeye/getTokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import tokenSecurityFixture from '../../../../../../tests/fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

describe('BirdeyeMapper', () => {
    const testTokenAddress = '0xe8852d270294Cc9A84FE73D5a434Ae85a1c34444';
    const testChainId: ChainId = ChainsMap.bsc;
    const testPairAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const tokenOverview = tokenOverviewFixture as unknown as BirdTokenEyeOverview;
    const evmSecurity = tokenSecurityFixture.data as unknown as BirdeyeEvmTokenSecurity;

    describe('extractPrice', () => {
        it('should extract price from token overview', () => {
            const price = BirdeyeMapper.extractPrice(tokenOverview);
            expect(price).toBe(0.0000066279564202772125);
        });
    });

    describe('extractMarketCap', () => {
        it('should extract market cap with mc as first priority', () => {
            const customOverview = {
                ...tokenOverview,
                mc: 5000,
                marketCap: 6000,
                fdv: 7000
            } as BirdTokenEyeOverview;

            const marketCap = BirdeyeMapper.extractMarketCap(customOverview);
            expect(marketCap).toBe(5000);
        });

        it('should fallback to marketCap when mc is not available', () => {
            const customOverview = {
                ...tokenOverview,
                marketCap: 6627.956420277213,
                fdv: 7000
            } as BirdTokenEyeOverview;
            delete (customOverview as any).mc;

            const marketCap = BirdeyeMapper.extractMarketCap(customOverview);
            expect(marketCap).toBe(6627.956420277213);
        });

        it('should fallback to fdv when mc and marketCap are not available', () => {
            const customOverview = {
                ...tokenOverview,
                fdv: 6627.956420277213
            } as BirdTokenEyeOverview;
            delete (customOverview as any).mc;
            delete (customOverview as any).marketCap;

            const marketCap = BirdeyeMapper.extractMarketCap(customOverview);
            expect(marketCap).toBe(6627.956420277213);
        });
    });

    describe('extractLiquidity', () => {
        it('should extract liquidity from token overview', () => {
            const liquidity = BirdeyeMapper.extractLiquidity(tokenOverview);
            expect(liquidity).toBe(3.3775539286146843e-11);
        });
    });

    describe('extractSupply', () => {
        it('should extract supply with first priority', () => {
            const customOverview = {
                ...tokenOverview,
                supply: 1000000000,
                circulatingSupply: 900000000,
                totalSuply: 800000000
            } as BirdTokenEyeOverview;

            const supply = BirdeyeMapper.extractSupply(customOverview);
            expect(supply).toBe(1000000000);
        });

        it('should fallback to circulatingSupply when supply is not available', () => {
            const customOverview = {
                ...tokenOverview,
                circulatingSupply: 1000000000,
                totalSuply: 800000000
            } as BirdTokenEyeOverview;
            delete (customOverview as any).supply;

            const supply = BirdeyeMapper.extractSupply(customOverview);
            expect(supply).toBe(1000000000);
        });

        it('should fallback to totalSuply when supply and circulatingSupply are not available', () => {
            const customOverview = {
                ...tokenOverview,
                totalSuply: 1000000000
            } as BirdTokenEyeOverview;
            delete (customOverview as any).supply;
            delete (customOverview as any).circulatingSupply;

            const supply = BirdeyeMapper.extractSupply(customOverview);
            expect(supply).toBe(1000000000);
        });
    });

    describe('extractTotalSupply', () => {
        it('should extract total supply with same fallback logic as extractSupply', () => {
            const supply = BirdeyeMapper.extractTotalSupply(tokenOverview);
            expect(supply).toBe(1000000000);
        });
    });

    describe('extractDecimals', () => {
        it('should extract decimals from token overview', () => {
            const decimals = BirdeyeMapper.extractDecimals(tokenOverview);
            expect(decimals).toBe(18);
        });
    });

    describe('extractName', () => {
        it('should extract token name', () => {
            const name = BirdeyeMapper.extractName(tokenOverview);
            expect(name).toBe('Russell rug Survivor');
        });
    });

    describe('extractSymbol', () => {
        it('should extract token symbol', () => {
            const symbol = BirdeyeMapper.extractSymbol(tokenOverview);
            expect(symbol).toBe('RUGSURVIVE');
        });
    });

    describe('extractLogoUrl', () => {
        it('should extract logo URL', () => {
            const logoUrl = BirdeyeMapper.extractLogoUrl(tokenOverview);
            expect(logoUrl).toBeNull();
        });

        it('should extract logo URL when present', () => {
            const customOverview = {
                ...tokenOverview,
                logoURI: 'https://example.com/logo.png'
            } as BirdTokenEyeOverview;

            const logoUrl = BirdeyeMapper.extractLogoUrl(customOverview);
            expect(logoUrl).toBe('https://example.com/logo.png');
        });
    });

    describe('extractDescription', () => {
        it('should return undefined when extensions is null', () => {
            const description = BirdeyeMapper.extractDescription(tokenOverview);
            expect(description).toBeUndefined();
        });

        it('should extract description when present in extensions', () => {
            const customOverview = {
                ...tokenOverview,
                extensions: {
                    description: 'Test token description',
                    website: 'https://example.com',
                    twitter: 'https://twitter.com/test',
                    telegram: 'https://t.me/test',
                    discord: 'https://discord.gg/test'
                }
            } as BirdTokenEyeOverview;

            const description = BirdeyeMapper.extractDescription(customOverview);
            expect(description).toBe('Test token description');
        });
    });

    describe('extractSocials', () => {
        it('should return empty socials when extensions is null', () => {
            const socials = BirdeyeMapper.extractSocials(tokenOverview);

            expect(socials).toEqual({
                twitter: undefined,
                telegram: undefined,
                discord: undefined,
                website: undefined,
            });
        });

        it('should extract all social media links when present', () => {
            const customOverview = {
                ...tokenOverview,
                extensions: {
                    twitter: 'https://twitter.com/test',
                    telegram: 'https://t.me/test',
                    discord: 'https://discord.gg/test',
                    website: 'https://example.com',
                }
            } as BirdTokenEyeOverview;

            const socials = BirdeyeMapper.extractSocials(customOverview);

            expect(socials).toEqual({
                twitter: 'https://twitter.com/test',
                telegram: 'https://t.me/test',
                discord: 'https://discord.gg/test',
                website: 'https://example.com',
            });
        });

        it('should handle empty string social values', () => {
            const customOverview = {
                ...tokenOverview,
                extensions: {
                    twitter: '',
                    telegram: '',
                    discord: '',
                    website: '',
                }
            } as BirdTokenEyeOverview;

            const socials = BirdeyeMapper.extractSocials(customOverview);

            expect(socials).toEqual({
                twitter: undefined,
                telegram: undefined,
                discord: undefined,
                website: undefined,
            });
        });
    });

    describe('extractCreatedBy', () => {
        it('should extract creator address from EVM security', () => {
            const createdBy = BirdeyeMapper.extractCreatedBy(evmSecurity);
            expect(createdBy).toBe('0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa');
        });

        it('should return undefined when creator address is not present', () => {
            const customSecurity = {
                ...evmSecurity,
            } as BirdeyeEvmTokenSecurity;
            delete (customSecurity as any).creatorAddress;

            const createdBy = BirdeyeMapper.extractCreatedBy(customSecurity);
            expect(createdBy).toBeUndefined();
        });
    });

    describe('chainIdToChain', () => {
        it('should convert BSC chain ID to birdeye chain', () => {
            const chain = BirdeyeMapper.chainIdToChain(ChainsMap.bsc);
            expect(chain).toBe('bsc');
        });

        it('should convert Solana chain ID to birdeye chain', () => {
            const chain = BirdeyeMapper.chainIdToChain(ChainsMap.solana);
            expect(chain).toBe('solana');
        });

        it('should convert Ethereum chain ID to birdeye chain', () => {
            const chain = BirdeyeMapper.chainIdToChain(ChainsMap.ethereum);
            expect(chain).toBe('ethereum');
        });

        it('should throw error for unsupported chain ID', () => {
            expect(() => {
                BirdeyeMapper.chainIdToChain('999' as ChainId);
            }).toThrow('Unsupported chain ID: 999');
        });
    });

    describe('chainToChainId', () => {
        it('should convert birdeye chain to BSC chain ID', () => {
            const chainId = BirdeyeMapper.chainToChainId('bsc' as BirdeyeChain);
            expect(chainId).toBe(ChainsMap.bsc);
        });

        it('should convert birdeye chain to Solana chain ID', () => {
            const chainId = BirdeyeMapper.chainToChainId('solana' as BirdeyeChain);
            expect(chainId).toBe(ChainsMap.solana);
        });

        it('should convert birdeye chain to Ethereum chain ID', () => {
            const chainId = BirdeyeMapper.chainToChainId('ethereum' as BirdeyeChain);
            expect(chainId).toBe(ChainsMap.ethereum);
        });
    });

    describe('getSupportedChains', () => {
        it('should return an array of supported chain IDs', () => {
            const chains = BirdeyeMapper.getSupportedChains();

            expect(Array.isArray(chains)).toBe(true);
            expect(chains.length).toBeGreaterThan(0);
            // Only check for chains that are actually supported internally
            expect(chains).toContain(ChainsMap.bsc);
        });
    });

    describe('mapTokenOverviewToTokenDataWithMarketCap', () => {
        it('should map token overview and security to TokenDataWithMarketCap', () => {
            const result = BirdeyeMapper.mapTokenOverviewToTokenDataWithMarketCap(
                testTokenAddress,
                testChainId,
                tokenOverview,
                evmSecurity,
                testPairAddress
            );

            expect(result).toMatchObject({
                address: testTokenAddress,
                chainId: testChainId,
                name: 'Russell rug Survivor',
                symbol: 'RUGSURVIVE',
                decimals: 18,
                totalSupply: 1000000000,
                pairAddress: testPairAddress,
                createdBy: '0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa',
                dataSource: TokenDataSource.BIRDEYE,
                price: 0.0000066279564202772125,
                liquidity: 3.3775539286146843e-11,
                marketCap: 6627.956420277213,
            });
        });
    });

    describe('mapTokenMetadataToTokenData', () => {
        it('should map token overview and security to AutoTrackerTokenData', () => {
            const result = BirdeyeMapper.mapTokenMetadataToTokenData(
                testTokenAddress,
                testChainId,
                tokenOverview,
                evmSecurity,
                testPairAddress
            );

            expect(result).toMatchObject({
                address: testTokenAddress,
                chainId: testChainId,
                name: 'Russell rug Survivor',
                symbol: 'RUGSURVIVE',
                decimals: 18,
                totalSupply: 1000000000,
                pairAddress: testPairAddress,
                createdBy: '0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa',
                dataSource: TokenDataSource.BIRDEYE,
            });
        });
    });

    describe('mapBirdeyeTokenToAutoTrackerToken', () => {
        it('should map token overview and security to AutoTrackerToken', () => {
            const result = BirdeyeMapper.mapBirdeyeTokenToAutoTrackerToken(
                tokenOverview,
                evmSecurity,
                testPairAddress,
                testChainId
            );

            expect(result).toMatchObject({
                address: testTokenAddress,
                chainId: testChainId,
                name: 'Russell rug Survivor',
                symbol: 'RUGSURVIVE',
                decimals: 18,
                totalSupply: 1000000000,
                pairAddress: testPairAddress,
                createdBy: '0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa',
                dataSource: TokenDataSource.BIRDEYE,
            });
        });
    });

    describe('extractTokenSecurityFromEvm', () => {
        it('should extract token security from EVM security data', () => {
            const security = BirdeyeMapper.extractTokenSecurityFromEvm(evmSecurity);

            expect(security).toEqual({
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: true, // ownerAddress is 0x0000... (zero address = renounced)
                buyTax: 0,
                sellTax: 0,
                isBlacklist: false,
            });
        });

        it('should correctly determine LP burned status when locked ratio > 0.9', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '100',
                    percent: '0.95',
                    NFT_list: null,
                    is_locked: 1,
                },
            ];

            const securityWithBurnedLp = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(securityWithBurnedLp);
            expect(security.isLpTokenBurned).toBe(true);
        });

        it('should correctly determine LP not burned when locked ratio <= 0.9', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '100',
                    percent: '0.5',
                    NFT_list: null,
                    is_locked: 1,
                },
            ];

            const securityWithPartialLock = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(securityWithPartialLock);
            expect(security.isLpTokenBurned).toBe(false);
        });

        it('should detect renounced when owner address is null', () => {
            const renouncedSecurity = {
                ...evmSecurity,
                ownerAddress: null as any,
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(renouncedSecurity);
            expect(security.isRenounced).toBe(true);
        });

        it('should detect renounced when owner address is zero address', () => {
            const renouncedSecurity = {
                ...evmSecurity,
                ownerAddress: '0x0000000000000000000000000000000000000000',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(renouncedSecurity);
            expect(security.isRenounced).toBe(true);
        });

        it('should not detect renounced when owner address is a real address', () => {
            const notRenouncedSecurity = {
                ...evmSecurity,
                ownerAddress: '0x1234567890123456789012345678901234567890',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(notRenouncedSecurity);
            expect(security.isRenounced).toBe(false);
        });

        it('should detect honeypot from isHoneypot flag', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                isHoneypot: '1',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(honeypotSecurity);
            expect(security.isHoneypot).toBe(true);
        });

        it('should detect honeypot from cannotSellAll flag', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                cannotSellAll: '1',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(honeypotSecurity);
            expect(security.isHoneypot).toBe(true);
        });

        it('should detect honeypot from honeypotWithSameCreator flag', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                honeypotWithSameCreator: '1',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(honeypotSecurity);
            expect(security.isHoneypot).toBe(true);
        });

        it('should handle mintable tokens', () => {
            const mintableSecurity = {
                ...evmSecurity,
                isMintable: '1',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(mintableSecurity);
            expect(security.isMintable).toBe(true);
        });

        it('should handle pausable and freezable tokens', () => {
            const pausableSecurity = {
                ...evmSecurity,
                transferPausable: '1',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(pausableSecurity);
            expect(security.isPausable).toBe(true);
            expect(security.isFreezable).toBe(true);
        });

        it('should parse tax values correctly', () => {
            const taxSecurity = {
                ...evmSecurity,
                buyTax: '5',
                sellTax: '10',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(taxSecurity);
            expect(security.buyTax).toBe(5);
            expect(security.sellTax).toBe(10);
        });

        it('should detect blacklist status when isBlacklisted is "1"', () => {
            const blacklistSecurity = {
                ...evmSecurity,
                isBlacklisted: '1',
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(blacklistSecurity);
            expect(security.isBlacklist).toBe(true);
        });

        it('should detect blacklist status when isBlacklisted is true', () => {
            const blacklistSecurity = {
                ...evmSecurity,
                isBlacklisted: true as any,
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(blacklistSecurity);
            expect(security.isBlacklist).toBe(true);
        });

        it('should handle multiple locked LP holders', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '50',
                    percent: '0.5',
                    NFT_list: null,
                    is_locked: 1,
                },
                {
                    address: '0x1111111111111111111111111111111111111111',
                    tag: 'lock',
                    value: null,
                    is_contract: 1,
                    balance: '45',
                    percent: '0.45',
                    NFT_list: null,
                    is_locked: 1,
                },
            ];

            const securityWithMultipleLocks = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(securityWithMultipleLocks);
            // 0.5 + 0.45 = 0.95 > 0.9
            expect(security.isLpTokenBurned).toBe(true);
        });

        it('should only count locked LP holders for LP burn calculation', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '50',
                    percent: '0.5',
                    NFT_list: null,
                    is_locked: 1, // Locked
                },
                {
                    address: '0x1111111111111111111111111111111111111111',
                    tag: 'holder',
                    value: null,
                    is_contract: 0,
                    balance: '50',
                    percent: '0.5',
                    NFT_list: null,
                    is_locked: 0, // Not locked
                },
            ];

            const securityWithMixedLocks = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromEvm(securityWithMixedLocks);
            // Only 0.5 from locked holder, which is <= 0.9
            expect(security.isLpTokenBurned).toBe(false);
        });
    });

    describe('isHoneypot', () => {
        it('should return true when isHoneypot is "1"', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                isHoneypot: '1',
                cannotSellAll: '0',
                honeypotWithSameCreator: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isHoneypot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return true when cannotSellAll is "1"', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                isHoneypot: '0',
                cannotSellAll: '1',
                honeypotWithSameCreator: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isHoneypot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return true when honeypotWithSameCreator is "1"', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                isHoneypot: '0',
                cannotSellAll: '0',
                honeypotWithSameCreator: '1'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isHoneypot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return true when multiple indicators are true', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                isHoneypot: '1',
                cannotSellAll: '1',
                honeypotWithSameCreator: '1'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isHoneypot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return false when all indicators are false', () => {
            const notHoneypotSecurity = {
                ...evmSecurity,
                isHoneypot: '0',
                cannotSellAll: '0',
                honeypotWithSameCreator: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isHoneypot(notHoneypotSecurity);
            expect(result).toBe(false);
        });
    });

    describe('isMintable', () => {
        it('should return true when isMintable is "1"', () => {
            const mintableSecurity = {
                ...evmSecurity,
                isMintable: '1'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isMintable(mintableSecurity);
            expect(result).toBe(true);
        });

        it('should return false when isMintable is "0"', () => {
            const notMintableSecurity = {
                ...evmSecurity,
                isMintable: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isMintable(notMintableSecurity);
            expect(result).toBe(false);
        });
    });

    describe('isLpBurned', () => {
        it('should return true when locked ratio > 0.9', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '100',
                    percent: '0.95',
                    NFT_list: null,
                    is_locked: 1,
                },
            ];

            const burnedSecurity = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isLpBurned(burnedSecurity);
            expect(result).toBe(true);
        });

        it('should return false when locked ratio <= 0.9', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '100',
                    percent: '0.5',
                    NFT_list: null,
                    is_locked: 1,
                },
            ];

            const notBurnedSecurity = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isLpBurned(notBurnedSecurity);
            expect(result).toBe(false);
        });

        it('should handle empty lpHolders array', () => {
            const emptySecurity = {
                ...evmSecurity,
                lpHolders: [],
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isLpBurned(emptySecurity);
            expect(result).toBe(false);
        });

        it('should handle undefined lpHolders', () => {
            const undefinedSecurity = {
                ...evmSecurity,
                lpHolders: undefined as any,
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isLpBurned(undefinedSecurity);
            expect(result).toBe(false);
        });

        it('should handle multiple locked holders', () => {
            const lpHolders: LpHolder[] = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    tag: 'burn',
                    value: null,
                    is_contract: 1,
                    balance: '50',
                    percent: '0.5',
                    NFT_list: null,
                    is_locked: 1,
                },
                {
                    address: '0x1111111111111111111111111111111111111111',
                    tag: 'lock',
                    value: null,
                    is_contract: 1,
                    balance: '45',
                    percent: '0.45',
                    NFT_list: null,
                    is_locked: 1,
                },
            ];

            const multipleLockedSecurity = {
                ...evmSecurity,
                lpHolders,
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isLpBurned(multipleLockedSecurity);
            expect(result).toBe(true); // 0.5 + 0.45 = 0.95 > 0.9
        });
    });

    describe('isPausable', () => {
        it('should return true when transferPausable is "1"', () => {
            const pausableSecurity = {
                ...evmSecurity,
                transferPausable: '1'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isPausable(pausableSecurity);
            expect(result).toBe(true);
        });

        it('should return false when transferPausable is "0"', () => {
            const notPausableSecurity = {
                ...evmSecurity,
                transferPausable: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isPausable(notPausableSecurity);
            expect(result).toBe(false);
        });
    });

    describe('isFreezable', () => {
        it('should return true when transferPausable is "1"', () => {
            const freezableSecurity = {
                ...evmSecurity,
                transferPausable: '1'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isFreezable(freezableSecurity);
            expect(result).toBe(true);
        });

        it('should return false when transferPausable is "0"', () => {
            const notFreezableSecurity = {
                ...evmSecurity,
                transferPausable: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isFreezable(notFreezableSecurity);
            expect(result).toBe(false);
        });
    });

    describe('isRenounced', () => {
        it('should return true when ownerAddress is null', () => {
            const renouncedSecurity = {
                ...evmSecurity,
                ownerAddress: null as any,
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isRenounced(renouncedSecurity);
            expect(result).toBe(true);
        });

        it('should return true when ownerAddress is zero address', () => {
            const renouncedSecurity = {
                ...evmSecurity,
                ownerAddress: '0x0000000000000000000000000000000000000000',
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isRenounced(renouncedSecurity);
            expect(result).toBe(true);
        });

        it('should return false when ownerAddress is a real address', () => {
            const notRenouncedSecurity = {
                ...evmSecurity,
                ownerAddress: '0x1234567890123456789012345678901234567890',
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isRenounced(notRenouncedSecurity);
            expect(result).toBe(false);
        });
    });

    describe('extractBuyTax', () => {
        it('should extract and parse buy tax correctly', () => {
            const taxSecurity = {
                ...evmSecurity,
                buyTax: '5.5'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.extractBuyTax(taxSecurity);
            expect(result).toBe(5.5);
        });

        it('should handle zero tax', () => {
            const zeroTaxSecurity = {
                ...evmSecurity,
                buyTax: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.extractBuyTax(zeroTaxSecurity);
            expect(result).toBe(0);
        });

        it('should handle integer tax values', () => {
            const intTaxSecurity = {
                ...evmSecurity,
                buyTax: '10'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.extractBuyTax(intTaxSecurity);
            expect(result).toBe(10);
        });
    });

    describe('extractSellTax', () => {
        it('should extract and parse sell tax correctly', () => {
            const taxSecurity = {
                ...evmSecurity,
                sellTax: '7.8'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.extractSellTax(taxSecurity);
            expect(result).toBe(7.8);
        });

        it('should handle zero tax', () => {
            const zeroTaxSecurity = {
                ...evmSecurity,
                sellTax: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.extractSellTax(zeroTaxSecurity);
            expect(result).toBe(0);
        });

        it('should handle integer tax values', () => {
            const intTaxSecurity = {
                ...evmSecurity,
                sellTax: '15'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.extractSellTax(intTaxSecurity);
            expect(result).toBe(15);
        });
    });

    describe('isBlacklisted', () => {
        it('should return true when isBlacklisted is "1"', () => {
            const blacklistSecurity = {
                ...evmSecurity,
                isBlacklisted: '1'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isBlacklisted(blacklistSecurity);
            expect(result).toBe(true);
        });

        it('should return true when isBlacklisted is true', () => {
            const blacklistSecurity = {
                ...evmSecurity,
                isBlacklisted: true as any
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isBlacklisted(blacklistSecurity);
            expect(result).toBe(true);
        });

        it('should return false when isBlacklisted is "0"', () => {
            const notBlacklistSecurity = {
                ...evmSecurity,
                isBlacklisted: '0'
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isBlacklisted(notBlacklistSecurity);
            expect(result).toBe(false);
        });

        it('should return false when isBlacklisted is false', () => {
            const notBlacklistSecurity = {
                ...evmSecurity,
                isBlacklisted: false as any
            } as BirdeyeEvmTokenSecurity;

            const result = BirdeyeMapper.isBlacklisted(notBlacklistSecurity);
            expect(result).toBe(false);
        });
    });

    describe('extractTokenSecurityFromSolana', () => {
        const mockSolanaSecurity: BirdeyeSolanaTokenSecurity = {
            creatorAddress: 'So11111111111111111111111111111111111111112',
            creatorOwnerAddress: null,
            ownerAddress: null,
            ownerOfOwnerAddress: null,
            creationTx: 'txhash123',
            creationTime: 1234567890,
            creationSlot: 123456,
            mintTx: 'txhash456',
            mintTime: 1234567890,
            mintSlot: 123456,
            creatorBalance: 0,
            ownerBalance: null,
            ownerPercentage: null,
            creatorPercentage: 0,
            metaplexUpdateAuthority: 'So11111111111111111111111111111111111111112',
            metaplexOwnerUpdateAuthority: null,
            metaplexUpdateAuthorityBalance: 0,
            metaplexUpdateAuthorityPercent: 0,
            mutableMetadata: false,
            top10HolderBalance: 1000,
            top10HolderPercent: 0.1,
            top10UserBalance: 900,
            top10UserPercent: 0.09,
            isTrueToken: true,
            fakeToken: null,
            totalSupply: 1000000000,
            preMarketHolder: [],
            lockInfo: null,
            freezeable: false,
            freezeAuthority: null,
            transferFeeEnable: false,
            transferFeeData: null,
            isToken2022: false,
            nonTransferable: false,
            jupStrictList: true,
        };

        it('should extract token security from Solana security data', () => {
            const security = BirdeyeMapper.extractTokenSecurityFromSolana(mockSolanaSecurity);

            expect(security).toEqual({
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: true, // ownerAddress is null
                buyTax: undefined,
                sellTax: undefined,
                transferFee: undefined,
                transferFeeUpgradeable: false,
                isBlacklist: false,
            });
        });

        it('should detect fake token as honeypot', () => {
            const fakeTokenSecurity = {
                ...mockSolanaSecurity,
                fakeToken: { reason: 'fake' },
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(fakeTokenSecurity);
            expect(security.isHoneypot).toBe(true);
        });

        it('should detect non-true token as honeypot', () => {
            const notTrueTokenSecurity = {
                ...mockSolanaSecurity,
                isTrueToken: false,
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(notTrueTokenSecurity);
            expect(security.isHoneypot).toBe(true);
        });

        it('should detect freezable when freeze authority exists', () => {
            const freezableSecurity = {
                ...mockSolanaSecurity,
                freezeAuthority: 'FreezeAuth1111111111111111111111111111111',
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(freezableSecurity);
            expect(security.isFreezable).toBe(true);
        });

        it('should detect freezable from freezeable flag', () => {
            const freezableSecurity = {
                ...mockSolanaSecurity,
                freezeable: true,
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(freezableSecurity);
            expect(security.isFreezable).toBe(true);
        });

        it('should handle owner not renounced', () => {
            const notRenouncedSecurity = {
                ...mockSolanaSecurity,
                ownerAddress: 'Owner11111111111111111111111111111111111',
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(notRenouncedSecurity);
            expect(security.isRenounced).toBe(false);
        });

        it('should detect Token2022 with transfer fee as upgradeable', () => {
            const token2022Security = {
                ...mockSolanaSecurity,
                isToken2022: true,
                transferFeeEnable: true,
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(token2022Security);
            expect(security.transferFeeUpgradeable).toBe(true);
        });

        it('should not mark as upgradeable if not Token2022', () => {
            const nonToken2022Security = {
                ...mockSolanaSecurity,
                isToken2022: false,
                transferFeeEnable: true,
            } as BirdeyeSolanaTokenSecurity;

            const security = BirdeyeMapper.extractTokenSecurityFromSolana(nonToken2022Security);
            expect(security.transferFeeUpgradeable).toBe(false);
        });
    });

    describe('extractTokenSecurity', () => {
        it('should route to EVM extractor for EVM security data', () => {
            const evmSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurityFromEvm');
            const solanaSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurityFromSolana');

            const security = BirdeyeMapper.extractTokenSecurity(evmSecurity);

            expect(security.isRenounced).toBe(true); // ownerAddress is 0x0000... (zero address = renounced)
            expect(evmSpy).toHaveBeenCalledWith(evmSecurity);
            expect(solanaSpy).not.toHaveBeenCalled();

            evmSpy.mockRestore();
            solanaSpy.mockRestore();
        });

        it('should route to Solana extractor for Solana security data', () => {
            const evmSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurityFromEvm');
            const solanaSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurityFromSolana');

            // Create Solana security without the isHoneypot field (EVM specific)
            const solanaSecurity: BirdeyeSolanaTokenSecurity = {
                creatorAddress: 'So11111111111111111111111111111111111111112',
                creatorOwnerAddress: null,
                ownerAddress: null,
                ownerOfOwnerAddress: null,
                creationTx: 'txhash',
                creationTime: 123,
                creationSlot: 123,
                mintTx: 'txhash',
                mintTime: 123,
                mintSlot: 123,
                creatorBalance: 0,
                ownerBalance: null,
                ownerPercentage: null,
                creatorPercentage: 0,
                metaplexUpdateAuthority: 'auth',
                metaplexOwnerUpdateAuthority: null,
                metaplexUpdateAuthorityBalance: 0,
                metaplexUpdateAuthorityPercent: 0,
                mutableMetadata: false,
                top10HolderBalance: 0,
                top10HolderPercent: 0,
                top10UserBalance: 0,
                top10UserPercent: 0,
                isTrueToken: true,
                fakeToken: null,
                totalSupply: 1000000,
                preMarketHolder: [],
                lockInfo: null,
                freezeable: false,
                freezeAuthority: null,
                transferFeeEnable: false,
                transferFeeData: null,
                isToken2022: false,
                nonTransferable: false,
                jupStrictList: false,
            };

            const security = BirdeyeMapper.extractTokenSecurity(solanaSecurity);

            expect(security.isRenounced).toBe(true);
            expect(solanaSpy).toHaveBeenCalledWith(solanaSecurity);
            expect(evmSpy).not.toHaveBeenCalled();

            evmSpy.mockRestore();
            solanaSpy.mockRestore();
        });

        it('should correctly detect security type by presence of isHoneypot field', () => {
            const evmSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurityFromEvm');
            const solanaSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurityFromSolana');

            // EVM has isHoneypot field
            BirdeyeMapper.extractTokenSecurity(evmSecurity);
            expect(evmSpy).toHaveBeenCalled();

            evmSpy.mockClear();
            solanaSpy.mockClear();

            // Solana doesn't have isHoneypot field
            const solanaSecurity = {
                creatorAddress: 'test',
                isTrueToken: true,
            } as BirdeyeSolanaTokenSecurity;

            BirdeyeMapper.extractTokenSecurity(solanaSecurity);
            expect(solanaSpy).toHaveBeenCalled();

            evmSpy.mockRestore();
            solanaSpy.mockRestore();
        });
    });
});
