import { MinimumTimeBetweenRule } from '../rules/minimum-time-between-rule';
import { PriceUpdateRuleName } from '../types';
import {
    createFirstUpdateContext,
    createContextWithPreviousUpdate
} from '../../../../tests/mocks/price-update';

describe('MinimumTimeBetweenRule', () => {
    describe('with default cooldown (60 minutes)', () => {
        const rule = new MinimumTimeBetweenRule();

        it('should have correct name', () => {
            expect(rule.name).toBe(PriceUpdateRuleName.MINIMUM_TIME_BETWEEN);
        });

        it('should pass when it is the first update (no cooldown required)', async () => {
            const context = createFirstUpdateContext();

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('First update');
            expect(result.reason).toContain('no cooldown required');
            expect(result.severity).toBe('info');
        });

        it('should pass when cooldown period is exactly met (60 minutes)', async () => {
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 60 * 60 * 1000 // 60 minutes
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Cooldown period satisfied');
            expect(result.reason).toContain('60.0min elapsed');
            expect(result.reason).toContain('required: 60min');
            expect(result.metadata?.minutesWaited).toBe(60.0);
        });

        it('should pass when cooldown period is exceeded (90 minutes)', async () => {
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 90 * 60 * 1000 // 90 minutes
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Cooldown period satisfied');
            expect(result.reason).toContain('90.0min elapsed');
        });

        it('should fail when cooldown period is not met (30 minutes)', async () => {
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 30 * 60 * 1000 // 30 minutes
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('Cooldown not met');
            expect(result.reason).toContain('30.0min elapsed');
            expect(result.reason).toContain('need 60min');
            expect(result.reason).toContain('30min remaining');
            expect(result.severity).toBe('info');
            expect(result.metadata?.remainingMs).toBe(30 * 60 * 1000);
        });

        it('should fail when cooldown period just barely not met (59 minutes)', async () => {
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 59 * 60 * 1000 // 59 minutes
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('Cooldown not met');
            expect(result.reason).toContain('59.0min elapsed');
            expect(result.reason).toContain('1min remaining');
        });
    });

    describe('with custom cooldown periods', () => {
        it('should respect 30 minute cooldown', async () => {
            const rule = new MinimumTimeBetweenRule(30);
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 30 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('30.0min elapsed');
            expect(result.reason).toContain('required: 30min');
        });

        it('should respect 5 minute cooldown (for quick updates)', async () => {
            const rule = new MinimumTimeBetweenRule(5);
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 5 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('5.0min elapsed');
        });

        it('should fail with 120 minute cooldown when only 60 minutes passed', async () => {
            const rule = new MinimumTimeBetweenRule(120);
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 60 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('60.0min elapsed');
            expect(result.reason).toContain('need 120min');
            expect(result.reason).toContain('60min remaining');
        });
    });

    describe('edge cases', () => {
        it('should handle very long cooldown periods (24 hours)', async () => {
            const rule = new MinimumTimeBetweenRule(1440); // 24 hours
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 24 * 60 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('1440.0min elapsed');
        });

        it('should handle very short time since last update (1 minute)', async () => {
            const rule = new MinimumTimeBetweenRule(60);
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 1 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('1.0min elapsed');
            expect(result.reason).toContain('59min remaining');
        });

        it('should handle fractional minutes correctly (45.5 minutes)', async () => {
            const rule = new MinimumTimeBetweenRule(60);
            const context = createContextWithPreviousUpdate({
                timeSinceLastUpdateMs: 45.5 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('45.5min elapsed');
            expect(result.reason).toContain('15min remaining');
        });
    });
});
