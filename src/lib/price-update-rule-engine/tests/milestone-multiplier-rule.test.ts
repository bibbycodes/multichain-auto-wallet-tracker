import { MilestoneMultiplierRule } from '../rules/milestone-multiplier-rule';
import { PriceUpdateRuleName } from '../types';
import {
    createFirstUpdateContext,
    createContextWithPreviousUpdate
} from '../../../../tests/mocks/price-update';

describe('MilestoneMultiplierRule', () => {
    describe('with default milestones', () => {
        const rule = new MilestoneMultiplierRule();

        it('should have correct name', () => {
            expect(rule.name).toBe(PriceUpdateRuleName.MILESTONE_MULTIPLIER);
        });

        it('should pass when reaching 5x milestone for first time (price)', async () => {
            const context = createFirstUpdateContext(5.0, 4.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('5x');
            expect(result.metadata?.milestone).toBe(5);
            expect(result.metadata?.priceMultiplier).toBe(5.0);
        });

        it('should pass when reaching 10x milestone (market cap)', async () => {
            const context = createFirstUpdateContext(8.0, 10.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('10x');
            expect(result.metadata?.milestone).toBe(10);
        });

        it('should pass when reaching 100x milestone', async () => {
            const context = createFirstUpdateContext(100.0, 100.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('100x');
            expect(result.metadata?.milestone).toBe(100);
        });

        it('should fail when no milestone is crossed (3x)', async () => {
            const context = createFirstUpdateContext(3.0, 3.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('No new milestone crossed');
            expect(result.reason).toContain('Current: 3.00x');
            expect(result.reason).toContain('60% to 5x');
            expect(result.severity).toBe('info');
            expect(result.metadata?.nextMilestone).toBe(5);
        });

        it('should pass when between milestones on FIRST update (7x has crossed 5x)', async () => {
            const context = createFirstUpdateContext(7.0, 7.0);

            const result = await rule.evaluate(context);

            // Should pass because 7x has crossed the 5x milestone for the first time
            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('5x');
            expect(result.metadata?.milestone).toBe(5);
        });

        it('should fail when between milestones after already announcing previous milestone', async () => {
            // Last update already announced 5x
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 7.0,
                mcapMultiplier: 7.0,
                lastUpdatePrice: 500, // 5x from signal (was announced)
                lastUpdateMcap: 5000000,
            });

            const result = await rule.evaluate(context);

            // Should fail because 7x hasn't crossed the next milestone (10x) yet
            expect(result.passed).toBe(false);
            expect(result.reason).toContain('No new milestone crossed');
            expect(result.reason).toContain('Current: 7.00x');
            expect(result.reason).toContain('70% to 10x');
        });

        it('should pass when crossing NEW milestone after previous update', async () => {
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 10.0,
                mcapMultiplier: 10.0,
                lastUpdatePrice: 500, // 5x from signal (100)
                lastUpdateMcap: 5000000, // 5x from signal (1000000)
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('10x');
            expect(result.metadata?.milestone).toBe(10);
        });

        it('should fail when milestone was already announced in previous update', async () => {
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 12.0,
                mcapMultiplier: 12.0,
                lastUpdatePrice: 1000, // 10x from signal already announced
                lastUpdateMcap: 10000000,
            });

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('No new milestone crossed');
            expect(result.reason).toContain('Current: 12.00x');
            expect(result.reason).toContain('48% to 25x');
        });

        it('should use the higher of price or mcap multiplier', async () => {
            const context = createFirstUpdateContext(3.0, 10.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('10x market cap');
            expect(result.metadata?.milestone).toBe(10);
        });
    });

    describe('with custom milestones', () => {
        it('should respect custom milestone list [2, 5, 10]', async () => {
            const rule = new MilestoneMultiplierRule([2, 5, 10]);
            const context = createFirstUpdateContext(2.0, 2.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('2x');
            expect(result.metadata?.milestone).toBe(2);
        });

        it('should pass for 3x with custom milestones [2, 5, 10] on first update', async () => {
            const rule = new MilestoneMultiplierRule([2, 5, 10]);
            const context = createFirstUpdateContext(3.0, 3.0);

            const result = await rule.evaluate(context);

            // Should pass because 3x has crossed the 2x milestone for the first time
            expect(result.passed).toBe(true);
            expect(result.reason).toContain('Milestone achieved');
            expect(result.reason).toContain('2x');
            expect(result.metadata?.milestone).toBe(2);
        });

        it('should fail for 3x after 2x already announced', async () => {
            const rule = new MilestoneMultiplierRule([2, 5, 10]);
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 3.0,
                mcapMultiplier: 3.0,
                lastUpdatePrice: 200, // 2x from signal (100)
                lastUpdateMcap: 2000000,
            });

            const result = await rule.evaluate(context);

            // Should fail because 2x was already announced and 5x hasn't been reached yet
            expect(result.passed).toBe(false);
            expect(result.reason).toContain('No new milestone crossed');
            expect(result.reason).toContain('Current: 3.00x');
            expect(result.reason).toContain('60% to 5x');
        });

        it('should handle single milestone [10]', async () => {
            const rule = new MilestoneMultiplierRule([10]);
            const context = createFirstUpdateContext(10.0, 10.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('10x');
        });

        it('should pass when crossing the highest milestone', async () => {
            const rule = new MilestoneMultiplierRule([2, 5, 10]);
            const context = createFirstUpdateContext(20.0, 20.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.metadata?.milestone).toBe(10);
        });
    });

    describe('edge cases', () => {
        const rule = new MilestoneMultiplierRule();

        it('should handle exact milestone match', async () => {
            const context = createFirstUpdateContext(25.0, 25.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.metadata?.milestone).toBe(25);
        });

        it('should handle very high multipliers (1000x)', async () => {
            const context = createFirstUpdateContext(1000.0, 1000.0);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(true);
            expect(result.reason).toContain('1000x');
        });

        it('should handle just below milestone (4.99x)', async () => {
            const context = createFirstUpdateContext(4.99, 4.99);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('Current: 4.99x');
            expect(result.reason).toContain('99% to 5x');
        });

        it('should handle low multipliers (1.5x)', async () => {
            const context = createFirstUpdateContext(1.5, 1.5);

            const result = await rule.evaluate(context);

            expect(result.passed).toBe(false);
            expect(result.reason).toContain('Current: 1.50x');
            expect(result.reason).toContain('30% to 5x');
        });

        it('should handle multiple milestones crossed since last update', async () => {
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 60.0,
                mcapMultiplier: 60.0,
                lastUpdatePrice: 500, // 5x from signal
                lastUpdateMcap: 5000000,
            });

            const result = await rule.evaluate(context);

            // Should pass with the highest milestone crossed (50x)
            expect(result.passed).toBe(true);
            expect(result.metadata?.milestone).toBe(50);
        });

        it('should fail when going beyond highest milestone after it was already announced', async () => {
            // Token reached 1000x previously, now at 1500x (beyond all milestones)
            const context = createContextWithPreviousUpdate({
                priceMultiplier: 1500.0,
                mcapMultiplier: 1500.0,
                lastUpdatePrice: 100000, // 1000x was last announced
                lastUpdateMcap: 1000000000,
                timeSinceLastUpdateMs: 120 * 60 * 1000
            });

            const result = await rule.evaluate(context);

            // Should FAIL because no new milestones exist
            expect(result.passed).toBe(false);
            expect(result.reason).toContain('No new milestone crossed');
            expect(result.reason).toContain('Beyond all milestones!');
            expect(result.metadata?.currentMultiplier).toBe(1500);
        });
    });
});
