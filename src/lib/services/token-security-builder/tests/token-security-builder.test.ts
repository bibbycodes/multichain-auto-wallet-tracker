import { TokenSecurityBuilder } from '../token-security-builder';
import { RawTokenDataCache } from '../../raw-data/raw-data';
import { ChainsMap } from '../../../../shared/chains';
import { TokenSecurity } from '../../../models/token/types';
import { BirdeyeMapper } from '../../apis/birdeye/birdeye-mapper';
import { GmGnMapper } from '../../apis/gmgn/gmgn-mapper';
import { GoPlusMapper } from '../../apis/goplus/goplus-mapper';
import birdeyeSecurityFixture from '../../../../../tests/fixtures/birdeye/getTokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import gmgnSecurityFixture from '../../../../../tests/fixtures/gmgn/getTokenSecurityAndLaunchpad-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import goPlusSecurityFixture from '../../../../../tests/fixtures/goplus/tokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
const testChainId = ChainsMap.bsc;

describe('TokenSecurityBuilder', () => {
    let securityBuilder: TokenSecurityBuilder;
    let rawDataCache: RawTokenDataCache;

    beforeEach(() => {
        rawDataCache = new RawTokenDataCache(testTokenAddress, testChainId);
        securityBuilder = new TokenSecurityBuilder(testTokenAddress, testChainId, rawDataCache);
    });

    describe('constructor', () => {
        it('should create instance with provided raw data cache', () => {
            const builder = new TokenSecurityBuilder(testTokenAddress, testChainId, rawDataCache);
            expect(builder.rawData).toBe(rawDataCache);
        });

        it('should create instance with new raw data cache if not provided', () => {
            const builder = new TokenSecurityBuilder(testTokenAddress, testChainId);
            expect(builder.rawData).toBeInstanceOf(RawTokenDataCache);
        });
    });

    describe('getBirdeyeTokenSecurity', () => {
        it('should return token security from Birdeye when available', async () => {
            jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(birdeyeSecurityFixture.data as any);

            const security = await securityBuilder.getBirdeyeTokenSecurity();

            expect(security).not.toBeNull();
            expect(security?.isHoneypot).toBe(false);
            expect(security?.isMintable).toBe(false);
            expect(security?.isRenounced).toBe(true);
        });

        it('should return empty object when Birdeye security data is not available', async () => {
            jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(null);

            const security = await securityBuilder.getBirdeyeTokenSecurity();

            expect(security).toEqual({});
        });

        it('should use BirdeyeMapper to extract security', async () => {
            const extractSpy = jest.spyOn(BirdeyeMapper, 'extractTokenSecurity');
            jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(birdeyeSecurityFixture.data as any);

            await securityBuilder.getBirdeyeTokenSecurity();

            expect(extractSpy).toHaveBeenCalledWith(birdeyeSecurityFixture.data);
            extractSpy.mockRestore();
        });
    });

    describe('getGmgnTokenSecurity', () => {
        it('should return token security from GmGn when available', async () => {
            jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(gmgnSecurityFixture as any);

            const security = await securityBuilder.getGmgnTokenSecurity();

            expect(security).not.toBeNull();
            expect(security?.isHoneypot).toBe(false);
            expect(security?.isRenounced).toBe(true);
        });

        it('should return empty object when GmGn security data is not available', async () => {
            jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(null);

            const security = await securityBuilder.getGmgnTokenSecurity();

            expect(security).toEqual({});
        });

        it('should use GmGnMapper to extract security', async () => {
            const extractSpy = jest.spyOn(GmGnMapper, 'extractTokenSecurity');
            jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(gmgnSecurityFixture as any);

            await securityBuilder.getGmgnTokenSecurity();

            expect(extractSpy).toHaveBeenCalledWith(gmgnSecurityFixture.security);
            extractSpy.mockRestore();
        });
    });

    describe('getGoPlusTokenSecurity', () => {
        it('should return token security from GoPlus for EVM chains', async () => {
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(goPlusSecurityFixture as any);

            const security = await securityBuilder.getGoPlusTokenSecurity();

            expect(security).not.toBeNull();
            expect(security?.isHoneypot).toBe(false);
            expect(security?.isMintable).toBe(false);
        });

        it('should return empty object when GoPlus security data is not available', async () => {
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(null);

            const security = await securityBuilder.getGoPlusTokenSecurity();

            expect(security).toEqual({});
        });

        it('should use GoPlusMapper.extractTokenSecurityFromEvm for EVM chains', async () => {
            const extractSpy = jest.spyOn(GoPlusMapper, 'extractTokenSecurityFromEvm');
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(goPlusSecurityFixture as any);

            await securityBuilder.getGoPlusTokenSecurity();

            expect(extractSpy).toHaveBeenCalledWith(goPlusSecurityFixture);
            extractSpy.mockRestore();
        });

        it('should use GoPlusMapper.extractTokenSecurityFromSolana for Solana chain', async () => {
            const solanaBuilder = new TokenSecurityBuilder(testTokenAddress, ChainsMap.solana, rawDataCache);
            const extractSpy = jest.spyOn(GoPlusMapper, 'extractTokenSecurityFromSolana');
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(goPlusSecurityFixture as any);

            await solanaBuilder.getGoPlusTokenSecurity();

            expect(extractSpy).toHaveBeenCalledWith(goPlusSecurityFixture);
            extractSpy.mockRestore();
        });
    });

    describe('collect', () => {
        it('should collect security data from all sources', async () => {
            const birdeyeSpy = jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(birdeyeSecurityFixture.data as any);
            const gmgnSpy = jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(gmgnSecurityFixture as any);
            const goPlusSpy = jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(goPlusSecurityFixture as any);

            const result = await securityBuilder.collect();

            expect(result).toHaveProperty('birdeyeTokenSecurity');
            expect(result).toHaveProperty('gmgnTokenSecurity');
            expect(result).toHaveProperty('goPlusTokenSecurity');
            expect(result.birdeyeTokenSecurity).not.toBeNull();
            expect(result.gmgnTokenSecurity).not.toBeNull();
            expect(result.goPlusTokenSecurity).not.toBeNull();

            birdeyeSpy.mockRestore();
            gmgnSpy.mockRestore();
            goPlusSpy.mockRestore();
        });

        it('should handle when some sources return empty objects', async () => {
            jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(null);
            jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(gmgnSecurityFixture as any);
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(goPlusSecurityFixture as any);

            const result = await securityBuilder.collect();

            expect(result.birdeyeTokenSecurity).toEqual({});
            expect(result.gmgnTokenSecurity).not.toEqual({});
            expect(result.goPlusTokenSecurity).not.toEqual({});
        });
    });

    describe('getTokenSecurity', () => {
        it('should return merged security from all sources with correct priority', async () => {
            jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(birdeyeSecurityFixture.data as any);
            jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(gmgnSecurityFixture as any);
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(goPlusSecurityFixture as any);

            const result = await securityBuilder.getTokenSecurity();

            expect(result).toBeDefined();
            expect(result.isHoneypot).toBe(false);
            expect(result.isMintable).toBe(false);
            expect(result.isRenounced).toBe(true);
        });

        it('should throw when no sources are available (missing required fields)', async () => {
            jest.spyOn(rawDataCache.birdeye, 'getTokenSecurity').mockResolvedValue(null);
            jest.spyOn(rawDataCache.gmgn, 'getTokenSecurityAndLaunchpad').mockResolvedValue(null);
            jest.spyOn(rawDataCache.goPlus, 'getTokenSecurity').mockResolvedValue(null);

            // Should throw because required fields are missing
            await expect(securityBuilder.getTokenSecurity()).rejects.toThrow(
                'TokenSecurity validation failed: Missing required fields:'
            );
        });

        it('should handle single source when it provides all required fields', async () => {
            // Mock GoPlus to return all required fields
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({
                isHoneypot: false,
                isMintable: false,
                isRenounced: true,
                isPausable: false,
                isLpTokenBurned: true,
            });
            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({});
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({});

            const result = await securityBuilder.getTokenSecurity();

            expect(result).toBeDefined();
            expect(result.isHoneypot).toBe(false);
            expect(result.isMintable).toBe(false);
            expect(result.isRenounced).toBe(true);
            expect(result.isPausable).toBe(false);
            expect(result.isLpTokenBurned).toBe(true);
        });

        it('should merge using pessimistic approach for risks and optimistic for protections', async () => {
            const birdeyeSecurity: TokenSecurity = {
                isHoneypot: false,
                isMintable: true,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: false,
                buyTax: 1,
                sellTax: 2,
            };

            const gmgnSecurity: TokenSecurity = {
                isHoneypot: true,
                isMintable: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                isRenounced: false,
                buyTax: 2,
                sellTax: 5,
            };

            const goPlusSecurity: TokenSecurity = {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: true,
                isFreezable: false,
                isRenounced: true,
                buyTax: 3,
                sellTax: 1,
            };

            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue(birdeyeSecurity);
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue(gmgnSecurity);
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue(goPlusSecurity);

            const result = await securityBuilder.getTokenSecurity();

            // Pessimistic: isHoneypot=true if ANY says true
            expect(result.isHoneypot).toBe(true);
            // Pessimistic: isPausable=true if ANY says true
            expect(result.isPausable).toBe(true);
            // Optimistic: isRenounced=true if ANY says true
            expect(result.isRenounced).toBe(true);
            // isMintable: true if ANY says true (risk) -> Birdeye has true
            expect(result.isMintable).toBe(true);
            // isLpTokenBurned: true if ANY says true (protection) -> GmGn has true
            expect(result.isLpTokenBurned).toBe(true);
            // Tax fields use MAX (worst case): buyTax max(1,2,3)=3, sellTax max(2,5,1)=5
            expect(result.buyTax).toBe(3);
            expect(result.sellTax).toBe(5);
        });
    });

    describe('mergeTokenSecurity - individual field merging', () => {
        const baseTokenSecurity: TokenSecurity = {
            isHoneypot: false,
            isMintable: false,
            isLpTokenBurned: false,
            isPausable: false,
            isFreezable: false,
            isRenounced: false,
        };

        describe('isHoneypot', () => {
            it('takes a pessimistic view and returns true if any source returns true', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isHoneypot: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isHoneypot: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isHoneypot: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isHoneypot).toBe(true);
            });

            it('should fallback to Birdeye when GoPlus not available', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isHoneypot: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isHoneypot: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isHoneypot).toBe(true);
            });

            it('should fallback to GmGn when GoPlus and Birdeye not available', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({});
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isHoneypot: true });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isHoneypot).toBe(true);
            });
        });

        describe('isMintable', () => {
            it('takes a pessimistic view and returns false if any source returns false', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isMintable: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isMintable: true });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isMintable: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isMintable).toBe(true);
            });
        });

        describe('isLpTokenBurned', () => {
            it('takes a optimistic view and returns true if any source returns true', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isLpTokenBurned: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isLpTokenBurned: true });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isLpTokenBurned: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isLpTokenBurned).toBe(true);
            });
        });

        describe('isPausable', () => {
            it('takes a pessimistic view and returns true if any source returns true', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isPausable: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isPausable: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isPausable: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isPausable).toBe(true);
            });
        });

        describe('isFreezable', () => {
            it('takes a pessimistic view and returns true if any source returns true', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isFreezable: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isFreezable: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isFreezable: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isFreezable).toBe(true);
            });
        });

        describe('isRenounced', () => {
            it('takes a optimistic view and returns true if any source returns true', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isRenounced: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isRenounced: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isRenounced: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isRenounced).toBe(true);
            });
        });

        describe('buyTax', () => {
            it('should use MAX value (worst case)', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, buyTax: 5 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, buyTax: 10 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, buyTax: 3 });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.buyTax).toBe(10); // MAX(5, 10, 3)
            });

            it('should use MAX of available sources', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, buyTax: 5 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, buyTax: 10 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.buyTax).toBe(10); // MAX(5, 10)
            });

            it('should be undefined when not provided by any source', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.buyTax).toBeUndefined();
            });
        });

        describe('sellTax', () => {
            it('should use MAX value (worst case)', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, sellTax: 7 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, sellTax: 15 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, sellTax: 2 });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.sellTax).toBe(15); // MAX(7, 15, 2)
            });

            it('should use MAX of available sources', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, sellTax: 7 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, sellTax: 15 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.sellTax).toBe(15); // MAX(7, 15)
            });

            it('should be undefined when not provided by any source', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.sellTax).toBeUndefined();
            });
        });

        describe('transferTax', () => {
            it('should use MAX value (worst case)', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferTax: 4 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferTax: 8 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferTax: 1 });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferTax).toBe(8); // MAX(4, 8, 1)
            });

            it('should use MAX of available sources', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferTax: 4 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferTax: 8 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferTax).toBe(8); // MAX(4, 8)
            });
        });

        describe('transferFee', () => {
            it('should use MAX value (worst case)', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFee: 6 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFee: 12 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFee: 2 });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferFee).toBe(12); // MAX(6, 12, 2)
            });

            it('should use MAX of available sources', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFee: 6 });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFee: 12 });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferFee).toBe(12); // MAX(6, 12)
            });
        });

        describe('isBlacklist', () => {
            it('should use pessimistic OR (true if ANY is true)', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isBlacklist: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isBlacklist: true });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isBlacklist: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isBlacklist).toBe(true); // OR(true, true, false) = true
            });

            it('should return false when all sources say false', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isBlacklist: false });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, isBlacklist: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isBlacklist).toBe(false); // OR(false, false) = false
            });

            it('should be undefined when not provided by any source', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.isBlacklist).toBeUndefined();
            });
        });

        describe('transferFeeUpgradeable', () => {
            it('should use pessimistic OR (true if ANY is true)', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFeeUpgradeable: true });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFeeUpgradeable: true });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFeeUpgradeable: false });

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferFeeUpgradeable).toBe(true); // OR(true, true, false) = true
            });

            it('should return false when all sources say false', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFeeUpgradeable: false });
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({ ...baseTokenSecurity, transferFeeUpgradeable: false });
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferFeeUpgradeable).toBe(false); // OR(false, false) = false
            });

            it('should be undefined when not provided by any source', async () => {
                jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue(baseTokenSecurity);
                jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

                const result = await securityBuilder.getTokenSecurity();
                expect(result.transferFeeUpgradeable).toBeUndefined();
            });
        });
    });

    describe('validate', () => {
        it('should not throw when all required fields are present', () => {
            const validSecurity: Partial<TokenSecurity> = {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
            };

            const result = securityBuilder.validate(validSecurity);
            expect(result).toBeDefined();
            expect(result.isMintable).toBe(false);
            expect(result.isRenounced).toBe(true);
        });

        it('should throw when required field (isMintable) is undefined', () => {
            const invalidSecurity: Partial<TokenSecurity> = {
                isHoneypot: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
                // isMintable missing
            };

            expect(() => securityBuilder.validate(invalidSecurity)).toThrow(
                'TokenSecurity validation failed: Missing required fields: isMintable'
            );
        });

        it('should throw when required field (isRenounced) is undefined', () => {
            const invalidSecurity: Partial<TokenSecurity> = {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                // isRenounced missing
            };

            expect(() => securityBuilder.validate(invalidSecurity)).toThrow(
                'TokenSecurity validation failed: Missing required fields: isRenounced'
            );
        });

        it('should throw when multiple required fields are undefined', () => {
            const invalidSecurity: Partial<TokenSecurity> = {
                isFreezable: false,
                // isMintable, isRenounced, isHoneypot, isPausable, isLpTokenBurned all missing
            };

            expect(() => securityBuilder.validate(invalidSecurity)).toThrow(
                'TokenSecurity validation failed: Missing required fields:'
            );
            expect(() => securityBuilder.validate(invalidSecurity)).toThrow('isMintable');
            expect(() => securityBuilder.validate(invalidSecurity)).toThrow('isRenounced');
        });

        it('should validate custom required fields', () => {
            const security: Partial<TokenSecurity> = {
                isHoneypot: false,
                isMintable: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
                // isLpTokenBurned missing
            };

            expect(() => securityBuilder.validate(security, ['isLpTokenBurned'])).toThrow(
                'TokenSecurity validation failed: Missing required fields: isLpTokenBurned'
            );
        });

        it('should pass validation for custom required fields when present', () => {
            const security: Partial<TokenSecurity> = {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
            };

            const result = securityBuilder.validate(security, ['isLpTokenBurned', 'isHoneypot']);
            expect(result).toBeDefined();
        });

        it('should accept false as a valid value (not treat it as missing)', () => {
            const security: Partial<TokenSecurity> = {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: false,
            };

            const result = securityBuilder.validate(security);
            expect(result).toBeDefined();
            expect(result.isMintable).toBe(false);
            expect(result.isRenounced).toBe(false);
        });

        it('should return TokenSecurity type (type guard)', () => {
            const security: Partial<TokenSecurity> = {
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: true,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
            };

            const result = securityBuilder.validate(security);
            // TypeScript should treat result as TokenSecurity, not Partial<TokenSecurity>
            const testTyping: TokenSecurity = result;
            expect(testTyping).toBeDefined();
        });
    });

    describe('merging with partial/undefined values', () => {
        it('should handle when only GoPlus provides isMintable', async () => {
            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({
                isHoneypot: false,
                isRenounced: true,
                isPausable: false,
                isLpTokenBurned: true,
                // isMintable not provided
            });
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({
                isHoneypot: false,
                isRenounced: true,
                isPausable: false,
                isLpTokenBurned: true,
                // isMintable not provided
            });
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({
                isMintable: true,
                isRenounced: true,
                isHoneypot: false,
                isPausable: false,
                isLpTokenBurned: true,
            });

            const result = await securityBuilder.getTokenSecurity();

            expect(result.isMintable).toBe(true);
            expect(result.isRenounced).toBe(true);
        });

        it('should handle when only Birdeye provides isRenounced', async () => {
            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({
                isRenounced: true,
                isMintable: false,
                isHoneypot: false,
                isPausable: false,
                isLpTokenBurned: true,
            });
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({
                isMintable: false,
                isHoneypot: false,
                isPausable: false,
                isLpTokenBurned: true,
                // isRenounced not provided
            });
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({
                isMintable: false,
                isHoneypot: false,
                isPausable: false,
                isLpTokenBurned: true,
                // isRenounced not provided
            });

            const result = await securityBuilder.getTokenSecurity();

            expect(result.isRenounced).toBe(true);
            expect(result.isMintable).toBe(false);
        });

        it('should throw validation error when no provider gives required fields', async () => {
            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({
                // No isMintable or isRenounced
            });
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({
                // No isMintable or isRenounced
            });
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({
                isFreezable: false,
                // No isMintable or isRenounced
            });

            // Should throw validation error since required fields are missing
            await expect(securityBuilder.getTokenSecurity()).rejects.toThrow(
                'TokenSecurity validation failed: Missing required fields:'
            );
        });

        it('should merge correctly when providers have partial overlapping data', async () => {
            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({
                isRenounced: true,
                buyTax: 5,
                isLpTokenBurned: true,
                // No isMintable, isHoneypot, isPausable
            });
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({
                isMintable: false,
                sellTax: 10,
                isPausable: false,
                isHoneypot: false,
                // No isRenounced, isLpTokenBurned
            });
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({
                isHoneypot: true,
                isPausable: true,
                buyTax: 3,
                isLpTokenBurned: false,
                // No isMintable or isRenounced
            });

            const result = await securityBuilder.getTokenSecurity();

            expect(result.isMintable).toBe(false); // From GmGn
            expect(result.isRenounced).toBe(true); // From Birdeye
            expect(result.isHoneypot).toBe(true); // From GoPlus (pessimistic OR)
            expect(result.isPausable).toBe(true); // From GoPlus (pessimistic OR)
            expect(result.isLpTokenBurned).toBe(true); // From Birdeye (optimistic OR)
            expect(result.buyTax).toBe(5); // MAX(5, 3)
            expect(result.sellTax).toBe(10); // From GmGn only
        });

        it('should handle when providers give only some required fields', async () => {
            jest.spyOn(securityBuilder, 'getBirdeyeTokenSecurity').mockResolvedValue({
                isMintable: false,
                isRenounced: true,
                isPausable: true,
                isHoneypot: false,
                isLpTokenBurned: true,
            });
            jest.spyOn(securityBuilder, 'getGmgnTokenSecurity').mockResolvedValue({});
            jest.spyOn(securityBuilder, 'getGoPlusTokenSecurity').mockResolvedValue({});

            const result = await securityBuilder.getTokenSecurity();

            // All required fields provided by Birdeye
            expect(result.isHoneypot).toBe(false);
            expect(result.isPausable).toBe(true);
            expect(result.isLpTokenBurned).toBe(true);
            expect(result.isMintable).toBe(false);
            expect(result.isRenounced).toBe(true);

            // Optional fields not provided should be undefined
            expect(result.isFreezable).toBeUndefined();
        });
    });
});
