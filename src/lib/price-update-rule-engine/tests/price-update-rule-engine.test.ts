import { PriceUpdateRuleEngine } from '../price-update-rule-engine';
import { PriceUpdateContext } from '../../services/price-update-context/price-update-context';
import { PriceUpdateRuleName, getDefaultPriceUpdateConfig } from '../types';
import {
    createFirstUpdateContext,
    createContextWithPreviousUpdate
} from '../../../../tests/mocks/price-update';

describe('PriceUpdateRuleEngine', () => {
    describe('with default configuration', () => {
        it('should pass when all rules pass (first update at 2x)', async () => {
            const contextData = createFirstUpdateContext(2.0, 2.0);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            expect(decision.reason).toContain('All required rules passed');
            expect(decision.passedRules?.length).toBe(1); // Only first_update_threshold is required
            expect(decision.failedRules?.length).toBe(0);
        });

        it('should fail when first update threshold not met (1.5x)', async () => {
            const contextData = createFirstUpdateContext(1.5, 1.5);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(false);
            expect(decision.reason).toContain('Rules failed');
            expect(decision.reason).toContain('first_update_threshold');
            expect(decision.failedRules).toContain('first_update_threshold');
        });

        it('should fail when cooldown not met', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 10.0,
                mcapMultiplier: 10.0,
                timeSinceLastUpdateMs: 30 * 60 * 1000 // 30 minutes (< 60 min default)
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(false);
            expect(decision.reason).toContain('Rules failed');
            expect(decision.reason).toContain('minimum_time_between');
            expect(decision.failedRules).toContain('minimum_time_between');
        });

        it('should fail when milestone not reached (7x after 5x already announced)', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 7.0,
                mcapMultiplier: 7.0,
                lastUpdatePrice: 500, // 5x already announced
                lastUpdateMcap: 5000000,
                timeSinceLastUpdateMs: 2 * 60 * 60 * 1000 // 2 hours (cooldown met)
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(false);
            expect(decision.reason).toContain('Rules failed');
            expect(decision.reason).toContain('milestone_multiplier');
            expect(decision.failedRules).toContain('milestone_multiplier');
        });

        it('should pass when milestone reached (10x after 5x already announced)', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 10.0,
                mcapMultiplier: 10.0,
                lastUpdatePrice: 500, // 5x already announced
                lastUpdateMcap: 5000000,
                timeSinceLastUpdateMs: 2 * 60 * 60 * 1000 // 2 hours
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            expect(decision.reason).toContain('All required rules passed');
            expect(decision.passedRules?.length).toBe(2); // milestone and cooldown
        });
    });

    describe('with custom configuration', () => {
        it('should respect custom cooldown period (30 minutes)', async () => {
            const config = {
                ...getDefaultPriceUpdateConfig(),
                cooldownMinutes: 30
            };

            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 10.0,
                mcapMultiplier: 10.0,
                timeSinceLastUpdateMs: 30 * 60 * 1000 // Exactly 30 minutes
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, config);

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            expect(decision.passedRules).toContain('minimum_time_between');
        });

        it('should respect custom first update threshold (1.5x)', async () => {
            const config = {
                ...getDefaultPriceUpdateConfig(),
                firstUpdateThreshold: 1.5
            };

            const contextData = createFirstUpdateContext(1.5, 1.5);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, config);

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            expect(decision.passedRules).toContain('first_update_threshold');
        });

        it('should respect custom milestones [2, 5, 10]', async () => {
            const config = {
                ...getDefaultPriceUpdateConfig(),
                milestones: [2, 5, 10]
            };

            const contextData = createFirstUpdateContext(2.0, 2.0);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, config);

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            // First update only requires first_update_threshold, not milestone
            expect(decision.passedRules).toContain(PriceUpdateRuleName.FIRST_UPDATE_THRESHOLD);
        });
    });

    describe('real-world scenarios', () => {
        it('scenario: first update at 2.1x should pass', async () => {
            const contextData = createFirstUpdateContext(2.1, 2.5);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            expect(decision.reason).toContain('All required rules passed');
        });

        it('scenario: second update too soon should fail', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 3.0,
                mcapMultiplier: 3.0,
                timeSinceLastUpdateMs: 5 * 60 * 1000 // 5 minutes
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(false);
            expect(decision.failedRules).toContain('minimum_time_between');
        });

        it('scenario: hitting 10x milestone after 1 hour should pass', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 10.0,
                mcapMultiplier: 10.0,
                lastUpdatePrice: 500, // Last announced 5x
                lastUpdateMcap: 5000000,
                timeSinceLastUpdateMs: 65 * 60 * 1000 // 65 minutes
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            expect(decision.passedRules?.length).toBe(2); // milestone and cooldown
        });

        it('scenario: hitting 100x milestone should pass even after long time', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 100.0,
                mcapMultiplier: 100.0,
                lastUpdatePrice: 5000, // Last announced 50x
                lastUpdateMcap: 50000000,
                timeSinceLastUpdateMs: 5 * 60 * 60 * 1000 // 5 hours
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            const milestoneResult = decision.results?.get(PriceUpdateRuleName.MILESTONE_MULTIPLIER);
            expect(milestoneResult?.metadata?.milestone).toBe(100);
        });

        it('scenario: token at 7.5x on first update should announce 5x milestone', async () => {
            const contextData = createFirstUpdateContext(7.5, 7.5);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            // First update only checks threshold, but milestone rule still evaluated
            const milestoneResult = decision.results?.get(PriceUpdateRuleName.MILESTONE_MULTIPLIER);
            expect(milestoneResult?.passed).toBe(true);
            expect(milestoneResult?.metadata?.milestone).toBe(5);
        });

        it('scenario: token at 1.9x on first update should fail (below 2x)', async () => {
            const contextData = createFirstUpdateContext(1.9, 1.9);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(false);
            expect(decision.failedRules).toContain('first_update_threshold');
        });

        it('scenario: token stuck at 6x after 5x announced should fail', async () => {
            const contextData = createContextWithPreviousUpdate({
                priceMultiplier: 6.0,
                mcapMultiplier: 6.0,
                lastUpdatePrice: 500, // 5x announced
                lastUpdateMcap: 5000000,
                timeSinceLastUpdateMs: 90 * 60 * 1000 // 90 minutes (cooldown met)
            });
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(false);
            expect(decision.failedRules).toContain('milestone_multiplier');
            expect(decision.passedRules).toContain('minimum_time_between');
        });
    });

    describe('edge cases', () => {
        it('should handle exact milestone match (5.0x)', async () => {
            const contextData = createFirstUpdateContext(5.0, 5.0);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            const milestoneResult = decision.results?.get(PriceUpdateRuleName.MILESTONE_MULTIPLIER);
            expect(milestoneResult?.metadata?.milestone).toBe(5);
        });

        it('should handle very high multipliers (1000x)', async () => {
            const contextData = createFirstUpdateContext(1000.0, 1000.0);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.passes).toBe(true);
            const milestoneResult = decision.results?.get(PriceUpdateRuleName.MILESTONE_MULTIPLIER);
            expect(milestoneResult?.metadata?.milestone).toBe(1000);
        });

        it('should provide detailed results for all rules', async () => {
            const contextData = createFirstUpdateContext(10.0, 10.0);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const decision = await engine.evaluate();

            expect(decision.results).toBeDefined();
            expect(decision.results?.size).toBe(3);
            expect(decision.results?.has(PriceUpdateRuleName.FIRST_UPDATE_THRESHOLD)).toBe(true);
            expect(decision.results?.has(PriceUpdateRuleName.MINIMUM_TIME_BETWEEN)).toBe(true);
            expect(decision.results?.has(PriceUpdateRuleName.MILESTONE_MULTIPLIER)).toBe(true);
        });
    });

    describe('getRules method', () => {
        it('should return all registered rules', () => {
            const contextData = createFirstUpdateContext(2.0, 2.0);
            const context = new PriceUpdateContext(contextData);
            const engine = new PriceUpdateRuleEngine(context, getDefaultPriceUpdateConfig());

            const rules = engine.getRules();

            expect(rules).toHaveLength(3);
            expect(rules.map(r => r.name)).toEqual([
                PriceUpdateRuleName.FIRST_UPDATE_THRESHOLD,
                PriceUpdateRuleName.MINIMUM_TIME_BETWEEN,
                PriceUpdateRuleName.MILESTONE_MULTIPLIER
            ]);
        });
    });
});
