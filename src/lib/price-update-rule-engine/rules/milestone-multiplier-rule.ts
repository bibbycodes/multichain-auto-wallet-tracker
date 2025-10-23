import { PriceUpdateRule, PriceUpdateRuleName, RuleResult } from "../types";
import { PriceUpdateContextData } from "../../services/price-update-context/types";

/**
 * Checks if token has crossed a major milestone (5x, 10x, 50x, 100x, etc.)
 * Only passes if this is a NEW milestone (not previously announced)
 */
export class MilestoneMultiplierRule implements PriceUpdateRule {
    name = PriceUpdateRuleName.MILESTONE_MULTIPLIER;

    private readonly milestones: number[];

    constructor(milestones: number[] = [5, 10, 25, 50, 100, 250, 500, 1000]) {
        // Sort milestones in ascending order
        this.milestones = [...milestones].sort((a, b) => a - b);
    }

    async evaluate(context: PriceUpdateContextData): Promise<RuleResult> {
        const maxMultiplier = Math.max(
            context.priceMultiplier,
            context.mcapMultiplier
        );

        // Find all NEW milestones that have been crossed
        const newMilestones = this.milestones.filter(milestone => {
            return maxMultiplier >= milestone && this.isNewMilestone(milestone, context);
        });

        // Get the HIGHEST new milestone crossed
        const crossedMilestone = newMilestones.length > 0
            ? newMilestones[newMilestones.length - 1]
            : undefined;

        if (crossedMilestone) {
            const metric = context.priceMultiplier >= crossedMilestone ? 'price' : 'market cap';
            return {
                passed: true,
                reason: `Milestone achieved: ${crossedMilestone}x ${metric} from initial signal!`,
                metadata: {
                    milestone: crossedMilestone,
                    priceMultiplier: context.priceMultiplier,
                    mcapMultiplier: context.mcapMultiplier
                }
            };
        }

        // No new milestone crossed
        const nextMilestone = this.milestones.find(m => m > maxMultiplier);
        const progress = nextMilestone
            ? `${Math.floor(maxMultiplier / nextMilestone * 100)}% to ${nextMilestone}x`
            : 'Beyond all milestones!';

        return {
            passed: false,
            reason: `No new milestone crossed. Current: ${maxMultiplier.toFixed(2)}x (${progress})`,
            severity: 'info',
            metadata: {
                currentMultiplier: maxMultiplier,
                nextMilestone,
                progress
            }
        };
    }

    private isNewMilestone(milestone: number, context: PriceUpdateContextData): boolean {
        // If no previous updates, any milestone is new
        if (!context.lastPriceUpdate) {
            return true;
        }

        // Check if previous update already announced this milestone
        const previousMaxMultiplier = Math.max(
            context.lastPriceUpdate.price / context.signalAlert.price,
            context.lastPriceUpdate.market_cap / context.signalAlert.market_cap
        );

        // Milestone is new if we've crossed it since last update
        return previousMaxMultiplier < milestone;
    }
}