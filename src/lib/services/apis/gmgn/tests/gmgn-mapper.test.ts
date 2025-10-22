import { TokenDataSource } from '@prisma/client';
import { GmGnEvmTokenSecurity, GmGnSolanaTokenSecurity, GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSocials } from 'python-proxy-scraper-client';
import { ChainId, ChainsMap } from '../../../../../shared/chains';
import { GmGnMapper } from '../gmgn-mapper';
import { GmGnChain } from '../gmgn-chain-map';

// Import fixtures
import tokenInfoFixture from '../../../../../../tests/fixtures/gmgn/getMultiWindowTokenInfo-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import socialsFixture from '../../../../../../tests/fixtures/gmgn/socials-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import securityFixture from '../../../../../../tests/fixtures/gmgn/getTokenSecurityAndLaunchpad-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import holdersFixture from '../../../../../../tests/fixtures/gmgn/getHolders-0xe6df05ce8c8301223373cf5b969afcb1498c5528.json';

describe('GmGnMapper', () => {
    const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const testChainId: ChainId = ChainsMap.bsc;
    const tokenInfo = tokenInfoFixture as unknown as GmGnMultiWindowTokenInfo;
    const socials = socialsFixture as unknown as GmGnTokenSocials;
    const evmSecurity = securityFixture.security as unknown as GmGnEvmTokenSecurity;

    describe('extractPrice', () => {
        it('should extract and parse price from token info', () => {
            const price = GmGnMapper.extractPrice(tokenInfo);
            expect(price).toBe(0.0000065628764);
        });
    });

    describe('extractMarketCap', () => {
        it('should calculate market cap correctly', () => {
            const marketCap = GmGnMapper.extractMarketCap(tokenInfo);
            // circulating_supply (1000000000) * price (0.0000065628764)
            expect(marketCap).toBeCloseTo(6562.8764, 4);
        });

        it('should handle string values for calculation', () => {
            const customTokenInfo = {
                ...tokenInfo,
                circulating_supply: '500000000',
                price: { ...tokenInfo.price, price: '0.0000002' }
            } as GmGnMultiWindowTokenInfo;

            const marketCap = GmGnMapper.extractMarketCap(customTokenInfo);
            expect(marketCap).toBeCloseTo(100, 4);
        });
    });

    describe('extractLiquidity', () => {
        it('should extract and parse liquidity', () => {
            const liquidity = GmGnMapper.extractLiquidity(tokenInfo);
            expect(liquidity).toBe(0.00000000003352788064);
        });
    });

    describe('extractSupply', () => {
        it('should extract and parse circulating supply', () => {
            const supply = GmGnMapper.extractSupply(tokenInfo);
            expect(supply).toBe(1000000000);
        });
    });

    describe('extractDecimals', () => {
        it('should extract decimals', () => {
            const decimals = GmGnMapper.extractDecimals(tokenInfo);
            expect(decimals).toBe(18);
        });
    });

    describe('extractName', () => {
        it('should extract token name', () => {
            const name = GmGnMapper.extractName(tokenInfo);
            expect(name).toBe('Russell rug Survivor');
        });
    });

    describe('extractSymbol', () => {
        it('should extract token symbol', () => {
            const symbol = GmGnMapper.extractSymbol(tokenInfo);
            expect(symbol).toBe('RUGSURVIVE');
        });
    });

    describe('extractLogoUrl', () => {
        it('should extract logo URL', () => {
            const logoUrl = GmGnMapper.extractLogoUrl(tokenInfo);
            expect(logoUrl).toBe('https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp');
        });
    });

    describe('extractDescription', () => {
        it('should extract description when present', () => {
            const customSocials = {
                ...socials,
                link: { ...socials.link, description: 'Test description' }
            } as GmGnTokenSocials;

            const description = GmGnMapper.extractDescription(customSocials);
            expect(description).toBe('Test description');
        });

        it('should return undefined when description is empty string', () => {
            const description = GmGnMapper.extractDescription(socials);
            // The fixture has an empty string, which becomes undefined via || operator
            expect(description).toBe('');
        });

        it('should return undefined when description is null', () => {
            const customSocials = {
                ...socials,
                link: { ...socials.link, description: null }
            } as unknown as GmGnTokenSocials;

            const description = GmGnMapper.extractDescription(customSocials);
            expect(description).toBeUndefined();
        });
    });

    describe('extractSocials', () => {
        it('should extract and format social media links', () => {
            const socialMedia = GmGnMapper.extractSocials(socials);

            expect(socialMedia).toEqual({
                twitter: 'https://x.com/RusselSurvivor?t=K8zn3TI7QbPDhysVweHs-A&s=09',
                telegram: 'https://t.me/RUSSELLTHERUGSURVIVOR',
                discord: undefined,
                website: undefined,
                instagram: undefined,
                facebook: undefined,
                youtube: undefined,
                tiktok: undefined,
                linkedin: undefined,
                github: undefined,
                reddit: undefined,
            });
        });

        it('should handle all social media fields present', () => {
            const fullSocials = {
                ...socials,
                link: {
                    ...socials.link,
                    twitter_username: 'testuser',
                    website: 'https://example.com',
                    discord: 'https://discord.gg/test',
                    instagram: 'https://instagram.com/test',
                    facebook: 'https://facebook.com/test',
                    youtube: 'https://youtube.com/test',
                    tiktok: 'https://tiktok.com/@test',
                    linkedin: 'https://linkedin.com/in/test',
                    github: 'https://github.com/test',
                    reddit: 'https://reddit.com/r/test',
                }
            } as GmGnTokenSocials;

            const socialMedia = GmGnMapper.extractSocials(fullSocials);

            expect(socialMedia.twitter).toBe('https://x.com/testuser');
            expect(socialMedia.website).toBe('https://example.com');
            expect(socialMedia.discord).toBe('https://discord.gg/test');
            expect(socialMedia.instagram).toBe('https://instagram.com/test');
            expect(socialMedia.facebook).toBe('https://facebook.com/test');
            expect(socialMedia.youtube).toBe('https://youtube.com/test');
            expect(socialMedia.tiktok).toBe('https://tiktok.com/@test');
            expect(socialMedia.linkedin).toBe('https://linkedin.com/in/test');
            expect(socialMedia.github).toBe('https://github.com/test');
            expect(socialMedia.reddit).toBe('https://reddit.com/r/test');
        });

        it('should handle empty or null social values', () => {
            const emptySocials = {
                ...socials,
                link: {
                    ...socials.link,
                    twitter_username: '',
                    telegram: '',
                    discord: null,
                }
            } as unknown as GmGnTokenSocials;

            const socialMedia = GmGnMapper.extractSocials(emptySocials);

            expect(socialMedia.twitter).toBeUndefined();
            expect(socialMedia.telegram).toBeUndefined();
            expect(socialMedia.discord).toBeUndefined();
        });
    });

    describe('extractCreatedBy', () => {
        it('should extract creator address', () => {
            const createdBy = GmGnMapper.extractCreatedBy(tokenInfo);
            expect(createdBy).toBe('0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa');
        });
    });

    describe('chainIdToChain', () => {
        it('should convert BSC chain ID to gmgn chain', () => {
            const chain = GmGnMapper.chainIdToChain(ChainsMap.bsc);
            expect(chain).toBe('bsc');
        });

        it('should convert Solana chain ID to gmgn chain', () => {
            const chain = GmGnMapper.chainIdToChain(ChainsMap.solana);
            expect(chain).toBe('sol');
        });

        it('should convert Ethereum chain ID to gmgn chain', () => {
            const chain = GmGnMapper.chainIdToChain(ChainsMap.ethereum);
            expect(chain).toBe('eth');
        });

        it('should throw error for unsupported chain ID', () => {
            expect(() => {
                GmGnMapper.chainIdToChain('999' as ChainId);
            }).toThrow('Unsupported chain ID: 999');
        });
    });

    describe('chainToChainId', () => {
        it('should convert gmgn chain to BSC chain ID', () => {
            const chainId = GmGnMapper.chainToChainId('bsc' as GmGnChain);
            expect(chainId).toBe(ChainsMap.bsc);
        });

        it('should convert gmgn chain to Solana chain ID', () => {
            const chainId = GmGnMapper.chainToChainId('sol' as GmGnChain);
            expect(chainId).toBe(ChainsMap.solana);
        });

        it('should convert gmgn chain to Ethereum chain ID', () => {
            const chainId = GmGnMapper.chainToChainId('eth' as GmGnChain);
            expect(chainId).toBe(ChainsMap.ethereum);
        });
    });

    describe('getSupportedChains', () => {
        it('should return an array of supported chain IDs', () => {
            const chains = GmGnMapper.getSupportedChains();

            expect(Array.isArray(chains)).toBe(true);
            expect(chains.length).toBeGreaterThan(0);
            // Only check for chains that are actually supported internally
            // The exact chains depend on getInternallySupportedChainIds()
            expect(chains).toContain(ChainsMap.bsc);
        });
    });

    describe('mapGmGnTokenToTokenDataWithMarketCap', () => {
        it('should map token info and socials to TokenDataWithMarketCap', () => {
            const result = GmGnMapper.mapGmGnTokenToTokenDataWithMarketCap(
                tokenInfo,
                socials,
                testChainId
            );

            expect(result).toMatchObject({
                address: testTokenAddress,
                chainId: testChainId,
                name: 'Russell rug Survivor',
                symbol: 'RUGSURVIVE',
                decimals: 18,
                totalSupply: 1000000000,
                pairAddress: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                logoUrl: 'https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp',
                createdBy: '0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa',
                dataSource: TokenDataSource.GMGN,
                price: 0.0000065628764,
                liquidity: 0.00000000003352788064,
            });

            expect(result.marketCap).toBeCloseTo(6562.8764, 4);
            expect(result.creationTime).toEqual(new Date(1760554240 * 1000));
            expect(result.socials.twitter).toBe('https://x.com/RusselSurvivor?t=K8zn3TI7QbPDhysVweHs-A&s=09');
            expect(result.socials.telegram).toBe('https://t.me/RUSSELLTHERUGSURVIVOR');
        });
    });

    describe('mapGmGnTokenToAutoTrackerToken', () => {
        it('should map token info and socials to AutoTrackerToken', () => {
            const result = GmGnMapper.mapGmGnTokenToAutoTrackerToken(
                tokenInfo,
                socials,
                testChainId
            );

            expect(result).toMatchObject({
                address: testTokenAddress,
                chainId: testChainId,
                name: 'Russell rug Survivor',
                symbol: 'RUGSURVIVE',
                decimals: 18,
                totalSupply: 1000000000,
                pairAddress: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                logoUrl: 'https://gmgn.ai/external-res/1ea7d2f007fc5e896835bce451c9ab16_v2.webp',
                createdBy: '0x7aeac445ff2ea9a9fbaf8bae16f499f1ea42c8aa',
                dataSource: TokenDataSource.GMGN,
            });
        });
    });

    describe('extractHoneypotStatus', () => {
        it('should return true when is_honeypot is true', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: true,
                honeypot: 0,
                can_not_sell: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return true when honeypot flag is 1', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: false,
                honeypot: 1,
                can_not_sell: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return true when can_not_sell is 1', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: false,
                honeypot: 0,
                can_not_sell: 1
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return true when multiple indicators are true', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: true,
                honeypot: 1,
                can_not_sell: 1
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return false when all indicators are false', () => {
            const nonHoneypotSecurity = {
                ...evmSecurity,
                is_honeypot: false,
                honeypot: 0,
                can_not_sell: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(nonHoneypotSecurity);
            expect(result).toBe(false);
        });

        it('should return undefined when all indicators are undefined/null', () => {
            const undefinedSecurity = {
                ...evmSecurity,
                is_honeypot: undefined,
                honeypot: undefined,
                can_not_sell: undefined
            } as unknown as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(undefinedSecurity);
            expect(result).toBeUndefined();
        });

        it('should handle string values for honeypot flag', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: false,
                honeypot: '1' as any,
                can_not_sell: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should handle string values for can_not_sell flag', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: false,
                honeypot: 0,
                can_not_sell: '1' as any
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should prioritize is_honeypot over other flags', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: true,
                honeypot: 0,
                can_not_sell: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });
    });

    describe('isMintable', () => {
        it('should return true when token is not renounced', () => {
            const mintableSecurity = {
                ...evmSecurity,
                is_renounced: false,
                renounced: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isMintable(mintableSecurity);
            expect(result).toBe(true);
        });

        it('should return false when token is renounced and renounced flag is 0', () => {
            const renouncedSecurity = {
                ...evmSecurity,
                is_renounced: true,
                renounced: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isMintable(renouncedSecurity);
            expect(result).toBe(false);
        });
    });

    describe('extractFreezableStatus', () => {
        it('should return true when token is not renounced', () => {
            const freezableSecurity = {
                ...evmSecurity,
                renounced: 0,
                is_renounced: false
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isFreezable(freezableSecurity);
            expect(result).toBe(true);
        });

        it('should return false when token is renounced', () => {
            const renouncedSecurity = {
                ...evmSecurity,
                is_renounced: true
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isFreezable(renouncedSecurity);
            expect(result).toBe(false);
        });
    });

    describe('extractLpBurnedStatus', () => {
        it('should return true when burn_ratio > 0.9', () => {
            const burnedSecurity = {
                ...evmSecurity,
                burn_ratio: '0.95'
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBurned(burnedSecurity);
            expect(result).toBe(true);
        });

        it('should return false when burn_ratio <= 0.9 and no locks', () => {
            const notBurnedSecurity = {
                ...evmSecurity,
                burn_ratio: '0.5',
                lock_summary: {
                    is_locked: false,
                    lock_detail: [],
                    lock_tags: null,
                    lock_percent: '0',
                    left_lock_percent: '0'
                }
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBurned(notBurnedSecurity);
            expect(result).toBe(false);
        });

        it('should handle string values correctly', () => {
            const burnedSecurity = {
                ...evmSecurity,
                burn_ratio: '0.95'
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBurned(burnedSecurity);
            expect(result).toBe(true);
        });

        it('should handle edge case at exactly 0.9 with no locks', () => {
            const edgeCaseSecurity = {
                ...evmSecurity,
                burn_ratio: '0.9',
                lock_summary: {
                    is_locked: false,
                    lock_detail: [],
                    lock_tags: null,
                    lock_percent: '0',
                    left_lock_percent: '0'
                }
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBurned(edgeCaseSecurity);
            expect(result).toBe(false);
        });
    });

    describe('extractBlacklistStatus', () => {
        it('should return true when is_blacklist is true', () => {
            const blacklistedSecurity = {
                ...evmSecurity,
                is_blacklist: true,
                blacklist: 0
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBlackList(blacklistedSecurity);
            expect(result).toBe(true);
        });

        it('should return false when is_blacklist is false', () => {
            const notBlacklistedSecurity = {
                ...evmSecurity,
                is_blacklist: false,
                blacklist: 1
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBlackList(notBlacklistedSecurity);
            expect(result).toBe(false);
        });

        it('should fallback to blacklist flag when is_blacklist is undefined', () => {
            const fallbackSecurity = {
                ...evmSecurity,
                blacklist: 1
            } as GmGnEvmTokenSecurity;
            delete (fallbackSecurity as any).is_blacklist;

            const result = GmGnMapper.isBlackList(fallbackSecurity);
            expect(result).toBe(true);
        });

        it('should handle string values for blacklist flag', () => {
            const stringBlacklistSecurity = {
                ...evmSecurity,
                is_blacklist: undefined,
                blacklist: '1' as any
            } as unknown as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isBlackList(stringBlacklistSecurity);
            expect(result).toBe(true);
        });
    });

    describe('extractBuyTax and extractSellTax', () => {
        it('should extract and parse tax values correctly', () => {
            const taxSecurity = {
                ...evmSecurity,
                buy_tax: '5.5',
                sell_tax: '7.8'
            } as GmGnEvmTokenSecurity;

            expect(GmGnMapper.extractBuyTax(taxSecurity)).toBe(5.5);
            expect(GmGnMapper.extractSellTax(taxSecurity)).toBe(7.8);
        });

        it('should handle zero and integer tax values', () => {
            const mixedTaxSecurity = {
                ...evmSecurity,
                buy_tax: '0',
                sell_tax: '15'
            } as GmGnEvmTokenSecurity;

            expect(GmGnMapper.extractBuyTax(mixedTaxSecurity)).toBe(0);
            expect(GmGnMapper.extractSellTax(mixedTaxSecurity)).toBe(15);
        });
    });

    describe('extractTokenSecurityFromEvm', () => {
        it('should extract token security from EVM security data', () => {
            const security = GmGnMapper.extractTokenSecurityFromEvm(evmSecurity);

            expect(security).toEqual({
                isHoneypot: false,
                isMintable: false, // renounced === 1 makes it non mintable
                isLpTokenBurned: true, // lock_summary has 95% locked
                isPausable: false, // renounced === 1 makes it non pausable
                isFreezable: false, // is_renounced is true
                isRenounced: true,
                buyTax: 0,
                sellTax: 0,
                isBlacklist: false,
            });
        });

        it('should correctly determine LP burned status from burn_ratio > 0.9', () => {
            const highBurnSecurity = {
                ...evmSecurity,
                burn_ratio: '0.95'
            } as GmGnEvmTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromEvm(highBurnSecurity);
            expect(security.isLpTokenBurned).toBe(true);
        });

        it('should correctly determine LP not burned when burn_ratio <= 0.9 and no locks', () => {
            const lowBurnSecurity = {
                ...evmSecurity,
                burn_ratio: '0.5',
                lock_summary: {
                    is_locked: false,
                    lock_detail: [],
                    lock_tags: null,
                    lock_percent: '0',
                    left_lock_percent: '0'
                }
            } as GmGnEvmTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromEvm(lowBurnSecurity);
            expect(security.isLpTokenBurned).toBe(false);
        });

        it('should handle mintable and freezable when not renounced', () => {
            const notRenouncedSecurity = {
                ...evmSecurity,
                is_renounced: false,
                renounced: 0
            } as GmGnEvmTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromEvm(notRenouncedSecurity);
            expect(security.isMintable).toBe(true);
            expect(security.isFreezable).toBe(true);
            expect(security.isRenounced).toBe(false);
        });

        it('should handle honeypot detection', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: true
            } as GmGnEvmTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromEvm(honeypotSecurity);
            expect(security.isHoneypot).toBe(true);
        });

        it('should handle blacklist detection with fallback logic', () => {
            const blacklistSecurityV1 = {
                ...evmSecurity,
                is_blacklist: true,
                blacklist: 0
            } as GmGnEvmTokenSecurity;

            let security = GmGnMapper.extractTokenSecurityFromEvm(blacklistSecurityV1);
            expect(security.isBlacklist).toBe(true);

            // When is_blacklist is false, it should be false (no fallback)
            const blacklistSecurityV2 = {
                ...evmSecurity,
                is_blacklist: false,
                blacklist: 1
            } as GmGnEvmTokenSecurity;

            security = GmGnMapper.extractTokenSecurityFromEvm(blacklistSecurityV2);
            expect(security.isBlacklist).toBe(false);

            // When is_blacklist is undefined, fall back to blacklist === 1
            const blacklistSecurityV3 = {
                ...evmSecurity,
                blacklist: 1
            } as GmGnEvmTokenSecurity;
            delete (blacklistSecurityV3 as any).is_blacklist;

            security = GmGnMapper.extractTokenSecurityFromEvm(blacklistSecurityV3);
            expect(security.isBlacklist).toBe(true);
        });

        it('should parse tax values correctly', () => {
            const taxSecurity = {
                ...evmSecurity,
                buy_tax: '5',
                sell_tax: '10'
            } as GmGnEvmTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromEvm(taxSecurity);
            expect(security.buyTax).toBe(5);
            expect(security.sellTax).toBe(10);
        });
    });

    describe('isHoneyPot', () => {
        const mockSolanaSecurity: GmGnSolanaTokenSecurity = {
            address: testTokenAddress,
            is_honeypot: false,
            renounced_mint: true,
            renounced_freeze_account: true,
            burn_status: 'burned',
            is_renounced: true,
            buy_tax: '0',
            sell_tax: '0',
            is_blacklist: false,
        } as GmGnSolanaTokenSecurity;

        it('should work with EVM security data', () => {
            const honeypotSecurity = {
                ...evmSecurity,
                is_honeypot: true
            } as GmGnEvmTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should work with Solana security data', () => {
            const honeypotSecurity = {
                ...mockSolanaSecurity,
                is_honeypot: true
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isHoneyPot(honeypotSecurity);
            expect(result).toBe(true);
        });

        it('should return false when not honeypot for both EVM and Solana', () => {
            const evmResult = GmGnMapper.isHoneyPot(evmSecurity);
            const solanaResult = GmGnMapper.isHoneyPot(mockSolanaSecurity);
            
            expect(evmResult).toBe(false);
            expect(solanaResult).toBe(false);
        });
    });

    describe('isSolanaFreezable', () => {
        const mockSolanaSecurity: GmGnSolanaTokenSecurity = {
            address: testTokenAddress,
            is_honeypot: false,
            renounced_mint: true,
            renounced_freeze_account: true,
            burn_status: 'burned',
            is_renounced: true,
            buy_tax: '0',
            sell_tax: '0',
            is_blacklist: false,
        } as GmGnSolanaTokenSecurity;

        it('should return true when freeze account is not renounced', () => {
            const freezableSecurity = {
                ...mockSolanaSecurity,
                renounced_freeze_account: false,
                is_renounced: false
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaFreezable(freezableSecurity);
            expect(result).toBe(true);
        });

        it('should return undefined when renounced_freeze_account is null/undefined', () => {
            const freezableSecurity = {
                ...mockSolanaSecurity,
                renounced_freeze_account: undefined as any,
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaFreezable(freezableSecurity);
            expect(result).toBe(true);
        });

        it('should return false when freeze account is renounced and not globally renounced', () => {
            const notFreezableSecurity = {
                ...mockSolanaSecurity,
                renounced_freeze_account: true,
                is_renounced: false
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaFreezable(notFreezableSecurity);
            expect(result).toBe(false);
        });
    });

    describe('isSolanaBurned', () => {
        const mockSolanaSecurity: GmGnSolanaTokenSecurity = {
            address: testTokenAddress,
            is_honeypot: false,
            renounced_mint: true,
            renounced_freeze_account: true,
            burn_status: 'burned',
            is_renounced: true,
            buy_tax: '0',
            sell_tax: '0',
            is_blacklist: false,
        } as GmGnSolanaTokenSecurity;

        it('should return true when burn_ratio > MIN_BURN_RATIO', () => {
            const burnedSecurity = {
                ...mockSolanaSecurity,
                burn_ratio: '0.95',
                burn_status: 'not_burned'
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaBurned(burnedSecurity);
            expect(result).toBe(true);
        });

        it('should return true when burn_status is "burned"', () => {
            const burnedSecurity = {
                ...mockSolanaSecurity,
                burn_ratio: '0.5',
                burn_status: 'burned'
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaBurned(burnedSecurity);
            expect(result).toBe(true);
        });

        it('should return false when burn_ratio <= MIN_BURN_RATIO and burn_status is not "burned"', () => {
            const notBurnedSecurity = {
                ...mockSolanaSecurity,
                burn_ratio: '0.5',
                burn_status: 'not_burned'
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaBurned(notBurnedSecurity);
            expect(result).toBe(false);
        });

        it('should handle string values correctly', () => {
            const burnedSecurity = {
                ...mockSolanaSecurity,
                burn_ratio: '0.95',
                burn_status: 'not_burned'
            } as GmGnSolanaTokenSecurity;

            const result = GmGnMapper.isSolanaBurned(burnedSecurity);
            expect(result).toBe(true);
        });
    });

    describe('extractTokenSecurityFromSolana', () => {
        const mockSolanaSecurity: GmGnSolanaTokenSecurity = {
            address: testTokenAddress,
            is_honeypot: false,
            renounced_mint: true,
            renounced_freeze_account: true,
            burn_status: 'burned',
            is_renounced: true,
            buy_tax: '0',
            sell_tax: '0',
            is_blacklist: false,
        } as GmGnSolanaTokenSecurity;

        it('should extract token security from Solana security data', () => {
            const security = GmGnMapper.extractTokenSecurityFromSolana(mockSolanaSecurity);

            expect(security).toEqual({
                isHoneypot: false,
                isMintable: false, // renounced_mint is true
                isLpTokenBurned: true, // burn_status is "burned"
                isPausable: false,
                isFreezable: false, // renounced_freeze_account is true
                isRenounced: true,
                buyTax: 0,
                sellTax: 0,
                isBlacklist: false,
            });
        });

        it('should handle LP not burned when burn_status is not "burned"', () => {
            const notBurnedSecurity = {
                ...mockSolanaSecurity,
                burn_status: 'not_burned'
            } as GmGnSolanaTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromSolana(notBurnedSecurity);
            expect(security.isLpTokenBurned).toBe(false);
        });

        it('should handle mintable when mint not renounced', () => {
            const mintableSecurity = {
                ...mockSolanaSecurity,
                renounced_mint: false
            } as GmGnSolanaTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromSolana(mintableSecurity);
            expect(security.isMintable).toBe(true);
        });

        it('should handle freezable when freeze account not renounced', () => {
            const freezableSecurity = {
                ...mockSolanaSecurity,
                renounced_freeze_account: false,
                is_renounced: false
            } as GmGnSolanaTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromSolana(freezableSecurity);
            expect(security.isFreezable).toBe(true);
        });

        it('should handle optional fields with defaults', () => {
            const minimalSecurity = {
                address: testTokenAddress,
                renounced_mint: true,
                renounced_freeze_account: true,
                burn_status: 'burned',
                buy_tax: '2',
                sell_tax: '3',
            } as GmGnSolanaTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromSolana(minimalSecurity);
            // isHoneypot should be undefined when no honeypot data is provided
            expect(security.isHoneypot).toBeUndefined();
            // isRenounced should be undefined when is_renounced and renounced fields are missing
            expect(security.isRenounced).toBeUndefined();
            // isBlacklist should be undefined when blacklist data is not provided
            expect(security.isBlacklist).toBeUndefined();
        });

        it('should parse tax values correctly', () => {
            const taxSecurity = {
                ...mockSolanaSecurity,
                buy_tax: '3.5',
                sell_tax: '7.8'
            } as GmGnSolanaTokenSecurity;

            const security = GmGnMapper.extractTokenSecurityFromSolana(taxSecurity);
            expect(security.buyTax).toBe(3.5);
            expect(security.sellTax).toBe(7.8);
        });
    });

    describe('extractTokenSecurity', () => {
        it('should route to EVM extractor for EVM security data', () => {
            const security = GmGnMapper.extractTokenSecurity(evmSecurity);

            expect(security).toEqual({
                isHoneypot: false,
                isMintable: false, // renounced === 1 makes it non mintable
                isLpTokenBurned: true, // lock_summary has 95% locked
                isPausable: false, // renounced === 1 makes it pausable
                isFreezable: false, // is_renounced is true
                isRenounced: true,
                buyTax: 0,
                sellTax: 0,
                isBlacklist: false,
            });
        });

        it('should route to Solana extractor for Solana security data', () => {
            // Use a valid Solana address
            const solanaAddress = 'So11111111111111111111111111111111111111112';
            const solanaSecurity: GmGnSolanaTokenSecurity = {
                address: solanaAddress,
                is_honeypot: false,
                renounced_mint: true,
                renounced_freeze_account: true,
                burn_status: 'burned',
                is_renounced: true,
                buy_tax: '1',
                sell_tax: '2',
                is_blacklist: false,
            } as GmGnSolanaTokenSecurity;

            const security = GmGnMapper.extractTokenSecurity(solanaSecurity);

            expect(security).toEqual({
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
                buyTax: 1,
                sellTax: 2,
                isBlacklist: false,
            });
        });

        it('should correctly detect chain type by address format and call appropriate method', () => {
            const evmSpy = jest.spyOn(GmGnMapper, 'extractTokenSecurityFromEvm');
            const solanaSpy = jest.spyOn(GmGnMapper, 'extractTokenSecurityFromSolana');

            // EVM address (0x prefix)
            const evmAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
            const evmSecurityData = {
                ...evmSecurity,
                address: evmAddress,
            } as GmGnEvmTokenSecurity;

            const evmResult = GmGnMapper.extractTokenSecurity(evmSecurityData);
            expect(evmResult.isRenounced).toBe(true);
            expect(evmSpy).toHaveBeenCalledWith(evmSecurityData);
            expect(solanaSpy).not.toHaveBeenCalled();

            // Reset spies
            evmSpy.mockClear();
            solanaSpy.mockClear();

            // Solana address (base58, no 0x prefix)
            const solanaAddress = 'So11111111111111111111111111111111111111112';
            const solanaSecurityData = {
                address: solanaAddress,
                renounced_mint: false,
                renounced_freeze_account: true,
                burn_status: 'not_burned',
                buy_tax: '0',
                sell_tax: '0',
            } as GmGnSolanaTokenSecurity;

            const solanaResult = GmGnMapper.extractTokenSecurity(solanaSecurityData);
            expect(solanaResult.isMintable).toBe(true);
            expect(solanaSpy).toHaveBeenCalledWith(solanaSecurityData);
            expect(evmSpy).not.toHaveBeenCalled();

            // Restore spies
            evmSpy.mockRestore();
            solanaSpy.mockRestore();
        });
    });

    describe('isPool', () => {
        const chainId = ChainsMap.bsc;
        it('should recognize PancakeSwap V2 Router (BSC)', () => {
            expect(GmGnMapper.isPool({
                address: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
                addr_type: 2,
            } as unknown as GmGnTokenHolder, chainId)).toBe(true);
        });

        it('should return true if address type is 2 as string', () => {
            expect(GmGnMapper.isPool({
                address: '0x1111111254fb6c44bac0bed2854e76f90643097d',
                addr_type: '2',
            } as unknown as GmGnTokenHolder, chainId)).toBe(true);
        });

        it('should recognize known liquidity addresses (BSC)', () => {
            // FOUR_DOT_MEME_PROXY from BSC config
            expect(GmGnMapper.isPool({
                address: '0x5c952063c7fc8610ffdb798152d69f0b9550762b',
                addr_type: '0',
            } as unknown as GmGnTokenHolder, chainId)).toBe(true);
        });

        it('should return false if address is empty', () => {
            expect(GmGnMapper.isPool({
                address: '',
                addr_type: '0',
            } as unknown as GmGnTokenHolder, chainId)).toBe(false);
        });

        it('should should return true if known address case sensitive', () => {
            expect(GmGnMapper.isPool({
                address: '0x5C952063C7fC8610FFDB798152D69F0B9550762b',
                addr_type: '0',
            } as unknown as GmGnTokenHolder, chainId)).toBe(true);
        });

        it('should return address type 0 as not pool', () => {
            expect(GmGnMapper.isPool({
                address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                addr_type: '0',
            } as unknown as GmGnTokenHolder, chainId)).toBe(false);
        });
        
        it('should return false if address type is undefined', () => {
            expect(GmGnMapper.isPool({
                address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                addr_type: undefined,
            } as unknown as GmGnTokenHolder, chainId)).toBe(false);
        });
    });

    describe('shouldExcludeHolder', () => {
        it('should exclude zero address', () => {
            expect(GmGnMapper.shouldExcludeHolder({
                address: '0x0000000000000000000000000000000000000000',
                isPool: false
            })).toBe(true);
        });

        it('should exclude dead address', () => {
            expect(GmGnMapper.shouldExcludeHolder({
                address: '0x000000000000000000000000000000000000dead',
                isPool: false
            })).toBe(true);
        });

        it('should exclude pool addresses', () => {
            expect(GmGnMapper.shouldExcludeHolder({
                address: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
                isPool: true
            })).toBe(true);
        });

        it('should not exclude regular holders', () => {
            expect(GmGnMapper.shouldExcludeHolder({
                address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                isPool: false
            })).toBe(false);
        });

        it('should be case insensitive for burn addresses', () => {
            expect(GmGnMapper.shouldExcludeHolder({
                address: '0x000000000000000000000000000000000000DEAD',
                isPool: false
            })).toBe(true);
        });
    });

    describe('parseTopHolders', () => {
        const holders = holdersFixture as unknown as GmGnTokenHolder[];
        const tokenSupply = 3379952959999.98;
        const tokenCreator = '0x79f8c3260575287c00f13d9e175d999491e72a5f';

        it('should parse holders correctly', () => {
            const result = GmGnMapper.parseTopHolders(holders, tokenSupply, tokenCreator);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('address');
            expect(result[0]).toHaveProperty('amount');
            expect(result[0]).toHaveProperty('percentage');
            expect(result[0]).toHaveProperty('dollarValue');
            expect(result[0]).toHaveProperty('isKOL');
            expect(result[0]).toHaveProperty('isWhale');
            expect(result[0]).toHaveProperty('significantHolderIn');
            expect(result[0]).toHaveProperty('isPool');
            expect(result[0]).toHaveProperty('isCreator');
        });

        it('should calculate percentage correctly', () => {
            const result = GmGnMapper.parseTopHolders(holders, tokenSupply, tokenCreator);
            const firstHolder = result[0];
            
            // percentage should be calculated as (amount / supply) * 100
            const expectedPercentage = Number(((Number(holders[0].amount_cur) / tokenSupply) * 100).toFixed(2));
            expect(firstHolder.percentage).toBe(expectedPercentage);
        });

        it('should detect KOL from twitter username', () => {
            const result = GmGnMapper.parseTopHolders(holders, tokenSupply, tokenCreator);
            
            // First holder in fixture has twitter_username: "laoyouhui"
            const holderWithTwitter = result.find(h => h.socials?.twitter);
            expect(holderWithTwitter).toBeDefined();
            expect(holderWithTwitter?.isKOL).toBe(true);
        });

        it('should add socials when twitter username is present', () => {
            const result = GmGnMapper.parseTopHolders(holders, tokenSupply, tokenCreator);
            
            const holderWithTwitter = result.find(h => h.socials?.twitter);
            expect(holderWithTwitter?.socials).toBeDefined();
            expect(holderWithTwitter?.socials?.twitter).toBeDefined();
        });

        it('should mark creator correctly', () => {
            const testHolders = [{
                address: tokenCreator,
                amount_cur: 1000,
                usd_value: 50,
                twitter_username: null,
                twitter_name: null,
                name: null,
            }] as unknown as GmGnTokenHolder[];
            
            const result = GmGnMapper.parseTopHolders(testHolders, tokenSupply, tokenCreator);
            expect(result[0].isCreator).toBe(true);
        });

        it('should be case insensitive for creator detection', () => {
            const testHolders = [{
                address: tokenCreator.toUpperCase(),
                amount_cur: 1000,
                usd_value: 50,
                twitter_username: null,
                twitter_name: null,
                name: null,
            }] as unknown as GmGnTokenHolder[];
            
            const result = GmGnMapper.parseTopHolders(testHolders, tokenSupply, tokenCreator);
            expect(result[0].isCreator).toBe(true);
        });

        it('should filter out burn addresses', () => {
            const testHolders = [
                {
                    address: '0x000000000000000000000000000000000000dead',
                    amount_cur: 1000,
                    usd_value: 50,
                    twitter_username: null,
                    twitter_name: null,
                    name: null,
                },
                {
                    address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                    amount_cur: 500,
                    usd_value: 25,
                    twitter_username: null,
                    twitter_name: null,
                    name: null,
                },
            ] as unknown as GmGnTokenHolder[];
            
            const result = GmGnMapper.parseTopHolders(testHolders, tokenSupply, tokenCreator);
            expect(result.length).toBe(1);
            expect(result[0].address).toBe('0xe8852d270294cc9a84fe73d5a434ae85a1c34444');
        });

        it('should filter out pool addresses', () => {
            const testHolders = [
                {
                    address: '0x10ed43c718714eb63d5aa57b78b54704e256024e', // PancakeSwap router
                    amount_cur: 1000,
                    usd_value: 50,
                    twitter_username: null,
                    twitter_name: null,
                    name: null,
                },
                {
                    address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
                    amount_cur: 500,
                    usd_value: 25,
                    twitter_username: null,
                    twitter_name: null,
                    name: null,
                },
            ] as unknown as GmGnTokenHolder[];
            
            const result = GmGnMapper.parseTopHolders(testHolders, tokenSupply, tokenCreator);
            expect(result.length).toBe(1);
            expect(result[0].address).toBe('0xe8852d270294cc9a84fe73d5a434ae85a1c34444');
        });

        it('should set isWhale to false by default', () => {
            const result = GmGnMapper.parseTopHolders(holders, tokenSupply, tokenCreator);
            expect(result.every(h => h.isWhale === false)).toBe(true);
        });

        it('should set significantHolderIn to empty array by default', () => {
            const result = GmGnMapper.parseTopHolders(holders, tokenSupply, tokenCreator);
            expect(result.every(h => Array.isArray(h.significantHolderIn) && h.significantHolderIn.length === 0)).toBe(true);
        });
    });
});
