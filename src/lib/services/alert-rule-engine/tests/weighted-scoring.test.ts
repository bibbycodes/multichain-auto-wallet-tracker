import { AlertRuleEngine } from '../alert-rule-engine';
import { BaseContext } from '../../token-context/base-context';
import { AlertRuleConfig, AlertRuleName, RuleGroup, AlertRule, RuleResult } from '../types';
import { weightedConfig } from '../configs';
import { createMockBaseContextData } from './test-helpers';
import { BaseContextData } from '../../token-context/types';

// Mock BaseContext
jest.mock('../../token-context/base-context');

describe('Weighted Scoring', () => {
    let mockBaseContext: jest.Mocked<BaseContext>;

    beforeEach(() => {
        mockBaseContext = {
            toObject: jest.fn(),
        } as any;
    });

    describe('Basic Weighted Scoring', () => {
        it('should calculate weighted score correctly when all rules pass', async () => {
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
                optionalRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED, AlertRuleName.NO_HONEYPOT],
                ruleWeights: {
                    [AlertRuleName.IS_RENOUNCED]: 2.0,
                    [AlertRuleName.LP_BURNED]: 2.0,
                    [AlertRuleName.NO_HONEYPOT]: 3.0
                },
                minOptionalScore: 0.7
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.shouldAlert).toBe(true);
            expect(decision.scoreDetails).toBeDefined();
            expect(decision.scoreDetails!.actualScore).toBe(7); // 2+2+3
            expect(decision.scoreDetails!.maxPossibleScore).toBe(7);
            expect(decision.scoreDetails!.normalizedScore).toBe(1.0); // 100%
        });

        it('should calculate weighted score correctly with mixed results', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,      // 2.0 - PASS
                    isLpTokenBurned: false, // 2.0 - FAIL
                    isHoneypot: false,      // 3.0 - PASS
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                optionalRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED, AlertRuleName.NO_HONEYPOT],
                ruleWeights: {
                    [AlertRuleName.IS_RENOUNCED]: 2.0,
                    [AlertRuleName.LP_BURNED]: 2.0,
                    [AlertRuleName.NO_HONEYPOT]: 3.0
                },
                minOptionalScore: 0.7
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.scoreDetails).toBeDefined();
            expect(decision.scoreDetails!.actualScore).toBe(5); // 2+3 (lp_burned failed)
            expect(decision.scoreDetails!.maxPossibleScore).toBe(7);
            expect(decision.scoreDetails!.normalizedScore).toBeCloseTo(5/7, 2); // ~71.4%
            expect(decision.shouldAlert).toBe(true); // > 70%
        });

        it('should fail when weighted score is below threshold', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,      // 2.0 - PASS
                    isLpTokenBurned: false, // 2.0 - FAIL
                    isHoneypot: true,       // 3.0 - FAIL
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                optionalRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED, AlertRuleName.NO_HONEYPOT],
                ruleWeights: {
                    [AlertRuleName.IS_RENOUNCED]: 2.0,
                    [AlertRuleName.LP_BURNED]: 2.0,
                    [AlertRuleName.NO_HONEYPOT]: 3.0
                },
                minOptionalScore: 0.7
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            expect(decision.scoreDetails).toBeDefined();
            expect(decision.scoreDetails!.actualScore).toBe(2); // Only is_renounced passed
            expect(decision.scoreDetails!.maxPossibleScore).toBe(7);
            expect(decision.scoreDetails!.normalizedScore).toBeCloseTo(2/7, 2); // ~28.6%
            expect(decision.shouldAlert).toBe(false); // < 70%
            expect(decision.reason).toContain('score too low');
        });
    });

    describe('Weighted Config', () => {
        it('should pass with all critical rules passing (93%)', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: true // Only this fails (1.0 weight)
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, weightedConfig);
            const decision = await engine.evaluate();

            // Max: 3+3+3+2+2+1+1 = 15
            // Actual: 14 (all except blacklist)
            expect(decision.scoreDetails!.actualScore).toBe(14);
            expect(decision.scoreDetails!.maxPossibleScore).toBe(15);
            expect(decision.scoreDetails!.normalizedScore).toBeCloseTo(14/15, 2); // 93.3%
            expect(decision.shouldAlert).toBe(true);
        });

        it('should pass when one critical rule fails but overall > 75%', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,
                    isLpTokenBurned: true,
                    isHoneypot: true,      // Critical fails (3.0)
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, weightedConfig);
            const decision = await engine.evaluate();

            // Actual: 12 (15 - 3 for honeypot)
            expect(decision.scoreDetails!.actualScore).toBe(12);
            expect(decision.scoreDetails!.normalizedScore).toBe(0.8); // 80%
            expect(decision.shouldAlert).toBe(true);
        });

        it('should fail when high importance rules fail', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: false,    // High importance fails (2.0)
                    isLpTokenBurned: false, // High importance fails (2.0)
                    isHoneypot: false,
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const engine = new AlertRuleEngine(mockBaseContext, weightedConfig);
            const decision = await engine.evaluate();

            // Actual: 11 (15 - 4 for renounced and lp_burned)
            expect(decision.scoreDetails!.actualScore).toBe(11);
            expect(decision.scoreDetails!.normalizedScore).toBeCloseTo(11/15, 2); // 73.3%
            expect(decision.shouldAlert).toBe(false); // < 75%
        });
    });


    describe('Score Details', () => {
        it('should provide detailed breakdown of each rule contribution', async () => {
            mockBaseContext.toObject.mockResolvedValue(createMockBaseContextData({
                tokenSecurity: {
                    isRenounced: true,      // 2.0 - PASS
                    isLpTokenBurned: false, // 1.5 - FAIL
                    isHoneypot: false,      // 3.0 - PASS
                    isMintable: false,
                    isPausable: false,
                    isFreezable: false,
                    isBlacklist: false
                }
            }));

            const config: AlertRuleConfig = {
                optionalRules: [AlertRuleName.IS_RENOUNCED, AlertRuleName.LP_BURNED, AlertRuleName.NO_HONEYPOT],
                ruleWeights: {
                    [AlertRuleName.IS_RENOUNCED]: 2.0,
                    [AlertRuleName.LP_BURNED]: 1.5,
                    [AlertRuleName.NO_HONEYPOT]: 3.0
                },
                minOptionalScore: 0.5
            };

            const engine = new AlertRuleEngine(mockBaseContext, config);
            const decision = await engine.evaluate();

            const ruleScores = decision.scoreDetails!.ruleScores;
            
            // Check is_renounced
            const renouncedScore = ruleScores.get(AlertRuleName.IS_RENOUNCED);
            expect(renouncedScore).toEqual({
                weight: 2.0,
                passed: true,
                contribution: 2.0
            });

            // Check lp_burned
            const lpBurnedScore = ruleScores.get(AlertRuleName.LP_BURNED);
            expect(lpBurnedScore).toEqual({
                weight: 1.5,
                passed: false,
                contribution: 0 // Failed, so 0 contribution
            });

            // Check no_honeypot
            const honeypotScore = ruleScores.get(AlertRuleName.NO_HONEYPOT);
            expect(honeypotScore).toEqual({
                weight: 3.0,
                passed: true,
                contribution: 3.0
            });
        });
    });
});

