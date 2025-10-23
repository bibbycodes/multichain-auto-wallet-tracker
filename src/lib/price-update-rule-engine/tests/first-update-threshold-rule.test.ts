import { FirstUpdateThresholdRule } from '../rules/first-update-threshold-rule';
import { PriceUpdateRuleName } from '../types';
import {
    createFirstUpdateContext,
    createContextWithPreviousUpdate
} from '../../../../tests/mocks/price-update';

describe('FirstUpdateThresholdRule', () => {
    describe('with default threshold (2.0x)', () => {
        const rule = new FirstUpdateThresholdRule();

        it('should have correct name', () => {
            expect(rule.name).toBe(PriceUpdateRuleName.FIRST_UPDATE_THRESHOLD);
        });

        it('should pass when price multiplier meets threshold (2x) and is first update', async () => {
            const context = createFirstUpdateContext(2.0, 1.5);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('First update threshold met');
            expect(result.reason).toContain('2.00x price');
            expect(result.metadata?.priceMultiplier).toBe(2.0);
            expect(result.metadata?.threshold).toBe(2.0);
        });

        it('should pass when mcap multiplier meets threshold (2x) and is first update', async () => {
            const context = createFirstUpdateContext(1.5, 2.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('First update threshold met');
            expect(result.reason).toContain('2.00x mcap');
            expect(result.metadata?.mcapMultiplier).toBe(2.0);
        });

        it('should pass when both price and mcap exceed threshold', async () => {
            const context = createFirstUpdateContext(3.0, 2.5);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('First update threshold met');
        });

        it('should fail when neither price nor mcap meet threshold', async () => {
            const context = createFirstUpdateContext(1.8, 1.9);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('First update requires 2x increase');
            expect(result.reason).toContain('1.80x price');
            expect(result.reason).toContain('1.90x mcap');
            expect(result.severity).toBe('info');
        });

        it('should pass (not apply) when it is not the first update', async () => {
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 1.8,
                mcapMultiplier: 1.8,
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Not first update');
            expect(result.reason).toContain('rule does not apply');
            expect(result.severity).toBe('info');
        });
    });

    describe('with custom threshold', () => {
        it('should respect custom threshold (1.5x)', async () => {
            const rule = new FirstUpdateThresholdRule(1.5);
            const context = createFirstUpdateContext(1.5, 1.4);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('1.50x price');
            expect(result.metadata?.threshold).toBe(1.5);
        });

        it('should respect custom threshold (3.0x)', async () => {
            const rule = new FirstUpdateThresholdRule(3.0);
            const context = createFirstUpdateContext(2.5, 2.5);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('requires 3x increase');
            expect(result.metadata?.threshold).toBe(3.0);
        });
    });

    describe('edge cases', () => {
        const rule = new FirstUpdateThresholdRule();

        it('should handle exact threshold match', async () => {
            const context = createFirstUpdateContext(2.0, 1.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
        });

        it('should handle very high multipliers', async () => {
            const context = createFirstUpdateContext(100.0, 50.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('100.00x price');
        });

        it('should handle price decrease (multiplier < 1)', async () => {
            const context = createFirstUpdateContext(0.5, 0.5);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('0.50x price');
        });
    });
});
