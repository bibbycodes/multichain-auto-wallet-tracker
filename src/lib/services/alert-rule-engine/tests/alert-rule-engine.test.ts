import { AlertRuleEngine } from '../alert-rule-engine';
import { BaseContext } from '../../token-context/base-context';
import { AlertRuleConfig, AlertRuleName, RuleGroup } from '../types';
import { strictConfig, balancedConfig } from '../configs';
import { createMockBaseContextData } from './test-helpers';

// Mock BaseContext
jest.mock('../../token-context/base-context');

describe('AlertRuleEngine', () => {
    let mockBaseContext: jest.Mocked<BaseContext>;

    beforeEach(() => {
        mockBaseContext = {
            toObject: jest.fn(),
        } as any;
    });

    describe('Default Configuration', () => {
        it('should alert when all security checks pass', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
            expect(decision.failedRules).toHaveLength(0);
        });

        it('should not alert when honeypot detected (blocker rule)', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: true, // Blocker rule fails
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain(AlertRuleName.NO_HONEYPOT);
            expect(decision.failedRules).toContain(AlertRuleName.NO_HONEYPOT);
        });

        it('should not alert when required rule fails', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: false, // Required rule fails
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('Required rules failed');
            expect(decision.failedRules).toContain(AlertRuleName.IS_RENOUNCED);
        });
    });

    describe('Strict Configuration', () => {
        it('should require all security checks to pass', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, strictConfig);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
        });

        it('should fail if any security check fails', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: true, // Fails
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, strictConfig);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.failedRules).toContain(AlertRuleName.NO_MINTABLE);
        });
    });

    describe('Balanced Configuration', () => {
        it('should pass with core security checks', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false // Optional rule passes
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, balancedConfig);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
        });

        it('should fail on blocker rule', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: true, // Blocker
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, balancedConfig);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('Blocker');
        });
    });

    describe('Rule Management', () => {
        it('should allow unregistering rules', () => {
            const engine = new AlertRuleEngine(mockBaseContext);
            const initialCount = engine.getRules().length;

            engine.unregisterRule(AlertRuleName.IS_RENOUNCED);

            expect(engine.getRules().length).toBe(initialCount - 1);
            expect(engine.getRules().find(r => r.name === AlertRuleName.IS_RENOUNCED)).toBeUndefined();
        });
    });

    describe('Optional Rules with Scoring', () => {
        it('should pass when optional rules meet minimum score', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                optionalRules: [
                    AlertRuleName.IS_RENOUNCED,
                    AlertRuleName.LP_BURNED,
                    AlertRuleName.NO_MINTABLE
                ],
                minOptionalScore: 0.6 // 60% required
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
            expect(decision.score).toBeGreaterThanOrEqual(0.6);
        });

        it('should fail when optional rules do not meet minimum score', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: false, // Fail
                    isLpTokenBurned: false, // Fail
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                optionalRules: [
                    AlertRuleName.IS_RENOUNCED,
                    AlertRuleName.LP_BURNED,
                    AlertRuleName.NO_MINTABLE,
                    AlertRuleName.NO_PAUSABLE
                ],
                minOptionalScore: 0.7 // 70% required
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('score too low');
            expect(decision.score).toBeLessThan(0.7);
        });
    });


    describe('Blacklist Rules', () => {
        it('should reject when any blacklist rule fails', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false, // Pass
                    isMintable: true,  // Blacklist rule fails
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                blacklistRules: [AlertRuleName.NO_MINTABLE, AlertRuleName.NO_PAUSABLE]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('Blacklist rules failed');
            expect(decision.reason).toContain(AlertRuleName.NO_MINTABLE);
            expect(decision.failedRules).toContain(AlertRuleName.NO_MINTABLE);
        });

        it('should pass when all blacklist rules pass', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false, // Pass
                    isPausable: false, // Pass
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                blacklistRules: [AlertRuleName.NO_MINTABLE, AlertRuleName.NO_PAUSABLE]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
            expect(decision.reason).toContain('All required checks passed');
        });

        it('should reject when multiple blacklist rules fail', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: true,  // Fail
                    isPausable: true,  // Fail
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                blacklistRules: [AlertRuleName.NO_MINTABLE, AlertRuleName.NO_PAUSABLE]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('Blacklist rules failed');
            expect(decision.failedRules).toContain(AlertRuleName.NO_MINTABLE);
            expect(decision.failedRules).toContain(AlertRuleName.NO_PAUSABLE);
        });
    });

    describe('Whitelist Rules', () => {
        it('should pass when at least one whitelist rule passes', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,  // Pass
                    isLpTokenBurned: false, // Fail
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                whitelistRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
            expect(decision.reason).toContain('All required checks passed');
        });

        it('should reject when no whitelist rules pass', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: false, // Fail
                    isLpTokenBurned: false, // Fail
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                whitelistRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('No whitelist rules passed');
            expect(decision.reason).toContain('at least one required');
        });

        it('should pass when all whitelist rules pass', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,  // Pass
                    isLpTokenBurned: true, // Pass
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                whitelistRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
        });
    });

    describe('Combined Blacklist and Whitelist', () => {
        it('should evaluate blacklist before whitelist', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,  // Whitelist pass
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: true,  // Blacklist fail
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                blacklistRules: [AlertRuleName.NO_MINTABLE],
                whitelistRules: [AlertRuleName.IS_RENOUNCED]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(false);
            expect(decision.reason).toContain('Blacklist rules failed');
        });

        it('should pass when blacklist passes and whitelist has at least one pass', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,  // Whitelist pass
                    isLpTokenBurned: false, // Whitelist fail
                    isHoneypot: false,
                    isMintable: false,  // Blacklist pass
                    isPausable: false,  // Blacklist pass
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                blacklistRules: [AlertRuleName.NO_MINTABLE, AlertRuleName.NO_PAUSABLE],
                whitelistRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED]
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
        });
    });
});

