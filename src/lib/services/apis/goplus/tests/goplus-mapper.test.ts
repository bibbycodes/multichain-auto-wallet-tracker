import { GoPlusSolanaTokenSecurity, GoPlusSolanaTokenSecurityResponse, GoPlusTokenSecurity, TokenSecurityResponse } from "python-proxy-scraper-client";
import { GoPlusMapper } from '../goplus-mapper';

// Import real fixtures
import tokenSecurityFixture from '../../../../../../tests/fixtures/goplus/tokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

describe('GoPlusMapper', () => {
    const testTokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';

    describe('extractTokenSecurityFromEvm', () => {
        it('should extract token security from EVM security response', () => {
            const mockResponse: TokenSecurityResponse = {
                code: 1,
                message: 'OK',
                result: {
                    [testTokenAddress]: tokenSecurityFixture as unknown as GoPlusTokenSecurity
                }
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(tokenSecurityFixture as unknown as GoPlusTokenSecurity);

            expect(result).toBeDefined();
            expect(result).toMatchObject({
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false,
                isRenounced: true,
                buyTax: 0,
                sellTax: 0,
                transferTax: undefined,
                isBlacklist: false,
            });
        });

        it('should handle empty security object', () => {
            const emptySecurity = {} as GoPlusTokenSecurity;

            const result = GoPlusMapper.extractTokenSecurityFromEvm(emptySecurity);

            expect(result).toBeDefined();
            expect(result.isHoneypot).toBe(false);
            expect(result.isMintable).toBe(false);
        });

        it('should handle honeypot detection correctly', () => {
            const honeypotSecurity = {
                ...tokenSecurityFixture,
                is_honeypot: "1",
                cannot_buy: "1"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(honeypotSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isHoneypot).toBe(true);
        });

        it('should handle mintable token correctly', () => {
            const mintableSecurity = {
                ...tokenSecurityFixture,
                is_mintable: "1"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(mintableSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isMintable).toBe(true);
        });

        it('should handle pausable token correctly', () => {
            const pausableSecurity = {
                ...tokenSecurityFixture,
                transfer_pausable: "1"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(pausableSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isPausable).toBe(true);
            expect(result?.isFreezable).toBe(true);
        });

        it('should handle LP token burned detection correctly', () => {
            const burnedLpSecurity = {
                ...tokenSecurityFixture,
                lp_holders: [
                    {
                        address: "0x123",
                        tag: "",
                        is_contract: 0,
                        balance: "1000000",
                        percent: "0.95",
                        is_locked: 1
                    },
                    {
                        address: "0x456",
                        tag: "",
                        is_contract: 0,
                        balance: "50000",
                        percent: "0.05",
                        is_locked: 1
                    }
                ]
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(burnedLpSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isLpTokenBurned).toBe(true);
        });

        it('should handle LP token not burned when locked ratio <= 90%', () => {
            const notBurnedLpSecurity = {
                ...tokenSecurityFixture,
                lp_holders: [
                    {
                        address: "0x123",
                        tag: "",
                        is_contract: 0,
                        balance: "800000",
                        percent: "0.8",
                        is_locked: 1
                    },
                    {
                        address: "0x456",
                        tag: "",
                        is_contract: 0,
                        balance: "200000",
                        percent: "0.2",
                        is_locked: 0
                    }
                ]
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(notBurnedLpSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isLpTokenBurned).toBe(false);
        });

        it('should handle owner renounced detection correctly', () => {
            const renouncedSecurity = {
                ...tokenSecurityFixture,
                owner_address: "0x0000000000000000000000000000000000000000"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(renouncedSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isRenounced).toBe(true);
        });

        it('should handle owner not renounced detection correctly', () => {
            const notRenouncedSecurity = {
                ...tokenSecurityFixture,
                owner_address: "0x1234567890123456789012345678901234567890"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(notRenouncedSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isRenounced).toBe(false);
        });

        it('should handle tax values correctly', () => {
            const taxSecurity = {
                ...tokenSecurityFixture,
                buy_tax: "5.5",
                sell_tax: "10.0",
                transfer_tax: "2.5"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(taxSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.buyTax).toBe(5.5);
            expect(result?.sellTax).toBe(10.0);
            expect(result?.transferTax).toBe(2.5);
        });

        it('should handle blacklist detection correctly', () => {
            const blacklistedSecurity = {
                ...tokenSecurityFixture,
                is_blacklisted: "1"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(blacklistedSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isBlacklist).toBe(true);
        });

        it('should handle string boolean values correctly', () => {
            const stringBooleanSecurity = {
                ...tokenSecurityFixture,
                is_honeypot: "true",
                is_mintable: "false",
                transfer_pausable: "TRUE"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(stringBooleanSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isHoneypot).toBe(true);
            expect(result?.isMintable).toBe(false);
            expect(result?.isPausable).toBe(true);
        });

        it('should handle undefined/null values gracefully', () => {
            const undefinedSecurity = {
                ...tokenSecurityFixture,
                is_honeypot: undefined,
                buy_tax: undefined,
                sell_tax: null,
                transfer_tax: ""
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(undefinedSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isHoneypot).toBe(false);
            expect(result?.buyTax).toBeUndefined();
            expect(result?.sellTax).toBeUndefined();
            expect(result?.transferTax).toBeUndefined();
        });
    });

    describe('extractTokenSecurityFromSolana', () => {
        it('should extract token security from Solana security response', () => {
            const mockSolanaSecurity: GoPlusSolanaTokenSecurity = {
                mintable: { 
                    status: 'enabled',
                    authority: [{ address: '0x123', malicious_address: 0 }]
                },
                freezable: { 
                    status: 'enabled',
                    authority: [{ address: '0x456', malicious_address: 0 }]
                },
                balance_mutable_authority: { 
                    status: 'enabled',
                    authority: [{ address: '0x789', malicious_address: 0 }]
                },
                closable: { 
                    status: 'disabled',
                    authority: []
                },
                default_account_state_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_fee_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_hook_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                creators: [],
                default_account_state: 'initialized',
                dex: [],
                holder_count: '5',
                holders: [],
                lp_holders: [],
                metadata: {
                    description: 'Test token',
                    name: 'Test Token',
                    symbol: 'TEST',
                    uri: 'https://example.com'
                },
                metadata_mutable: {
                    metadata_upgrade_authority: [{ address: '0xabc', malicious_address: 0 }],
                    status: 'enabled'
                },
                non_transferable: '0',
                total_supply: '1000000000',
                transfer_fee: {},
                transfer_hook: [],
                trusted_token: 1
            };

            const result = GoPlusMapper.extractTokenSecurityFromSolana(mockSolanaSecurity);

            expect(result).toBeDefined();
            expect(result).toMatchObject({
                isHoneypot: false,
                isMintable: true,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: true,
                isRenounced: false,
                buyTax: undefined,
                sellTax: undefined,
                transferTax: undefined,
                isBlacklist: false,
            });
        });

        it('should handle empty Solana security object', () => {
            const emptySecurity = {} as GoPlusSolanaTokenSecurity;

            const result = GoPlusMapper.extractTokenSecurityFromSolana(emptySecurity);

            expect(result).toBeDefined();
            expect(result.isHoneypot).toBe(false);
            expect(result.isMintable).toBe(false);
        });

        it('should handle disabled mint authority as renounced', () => {
            const disabledMintSecurity: GoPlusSolanaTokenSecurity = {
                mintable: { 
                    status: 'disabled',
                    authority: []
                },
                freezable: { 
                    status: 'enabled',
                    authority: [{ address: '0x456', malicious_address: 0 }]
                },
                balance_mutable_authority: { 
                    status: 'enabled',
                    authority: [{ address: '0x789', malicious_address: 0 }]
                },
                closable: { 
                    status: 'disabled',
                    authority: []
                },
                default_account_state_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_fee_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_hook_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                creators: [],
                default_account_state: 'initialized',
                dex: [],
                holder_count: '5',
                holders: [],
                lp_holders: [],
                metadata: {
                    description: 'Test token',
                    name: 'Test Token',
                    symbol: 'TEST',
                    uri: 'https://example.com'
                },
                metadata_mutable: {
                    metadata_upgrade_authority: [],
                    status: 'disabled'
                },
                non_transferable: '0',
                total_supply: '1000000000',
                transfer_fee: {},
                transfer_hook: [],
                trusted_token: 1
            };

            const result = GoPlusMapper.extractTokenSecurityFromSolana(disabledMintSecurity);

            expect(result?.isRenounced).toBe(true);
            expect(result?.isMintable).toBe(false);
        });

        it('should handle disabled freeze authority correctly', () => {
            const disabledFreezeSecurity: GoPlusSolanaTokenSecurity = {
                mintable: { 
                    status: 'enabled',
                    authority: [{ address: '0x123', malicious_address: 0 }]
                },
                freezable: { 
                    status: 'disabled',
                    authority: []
                },
                balance_mutable_authority: { 
                    status: 'enabled',
                    authority: [{ address: '0x789', malicious_address: 0 }]
                },
                closable: { 
                    status: 'disabled',
                    authority: []
                },
                default_account_state_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_fee_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_hook_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                creators: [],
                default_account_state: 'initialized',
                dex: [],
                holder_count: '5',
                holders: [],
                lp_holders: [],
                metadata: {
                    description: 'Test token',
                    name: 'Test Token',
                    symbol: 'TEST',
                    uri: 'https://example.com'
                },
                metadata_mutable: {
                    metadata_upgrade_authority: [{ address: '0xabc', malicious_address: 0 }],
                    status: 'enabled'
                },
                non_transferable: '0',
                total_supply: '1000000000',
                transfer_fee: {},
                transfer_hook: [],
                trusted_token: 1
            };

            const result = GoPlusMapper.extractTokenSecurityFromSolana(disabledFreezeSecurity);

            expect(result?.isFreezable).toBe(false);
        });

        it('should handle all authorities disabled', () => {
            const allDisabledSecurity: GoPlusSolanaTokenSecurity = {
                mintable: { 
                    status: 'disabled',
                    authority: []
                },
                freezable: { 
                    status: 'disabled',
                    authority: []
                },
                balance_mutable_authority: { 
                    status: 'disabled',
                    authority: []
                },
                closable: { 
                    status: 'disabled',
                    authority: []
                },
                default_account_state_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_fee_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                transfer_hook_upgradable: { 
                    status: 'disabled',
                    authority: []
                },
                creators: [],
                default_account_state: 'initialized',
                dex: [],
                holder_count: '5',
                holders: [],
                lp_holders: [],
                metadata: {
                    description: 'Test token',
                    name: 'Test Token',
                    symbol: 'TEST',
                    uri: 'https://example.com'
                },
                metadata_mutable: {
                    metadata_upgrade_authority: [],
                    status: 'disabled'
                },
                non_transferable: '0',
                total_supply: '1000000000',
                transfer_fee: {},
                transfer_hook: [],
                trusted_token: 1
            };

            const result = GoPlusMapper.extractTokenSecurityFromSolana(allDisabledSecurity);

            expect(result?.isMintable).toBe(false);
            expect(result?.isFreezable).toBe(false);
            expect(result?.isRenounced).toBe(true);
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle empty LP holders array', () => {
            const emptyLpHoldersSecurity = {
                ...tokenSecurityFixture,
                lp_holders: []
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(emptyLpHoldersSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.isLpTokenBurned).toBe(false);
        });

        it('should handle malformed tax values', () => {
            const malformedTaxSecurity = {
                ...tokenSecurityFixture,
                buy_tax: "invalid",
                sell_tax: "not-a-number",
                transfer_tax: "NaN"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(malformedTaxSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.buyTax).toBeUndefined();
            expect(result?.sellTax).toBeUndefined();
            expect(result?.transferTax).toBeUndefined();
        });

        it('should handle zero tax values', () => {
            const zeroTaxSecurity = {
                ...tokenSecurityFixture,
                buy_tax: "0",
                sell_tax: "0.0",
                transfer_tax: "0"
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(zeroTaxSecurity as unknown as GoPlusTokenSecurity);

            expect(result?.buyTax).toBe(0);
            expect(result?.sellTax).toBe(0);
            expect(result?.transferTax).toBe(0);
        });

        it('should handle LP holders with mixed locked status', () => {
            const mixedLpHoldersSecurity = {
                ...tokenSecurityFixture,
                lp_holders: [
                    {
                        address: "0x123",
                        tag: "",
                        is_contract: 0,
                        balance: "500000",
                        percent: "0.5",
                        is_locked: 1
                    },
                    {
                        address: "0x456",
                        tag: "",
                        is_contract: 0,
                        balance: "300000",
                        percent: "0.3",
                        is_locked: 0
                    },
                    {
                        address: "0x789",
                        tag: "",
                        is_contract: 0,
                        balance: "200000",
                        percent: "0.2",
                        is_locked: 1
                    }
                ]
            };

            const result = GoPlusMapper.extractTokenSecurityFromEvm(mixedLpHoldersSecurity as unknown as GoPlusTokenSecurity);

            // 50% + 20% = 70% locked, which is <= 90%
            expect(result?.isLpTokenBurned).toBe(false);
        });
    });
});
