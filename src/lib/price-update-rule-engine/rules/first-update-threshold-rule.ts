
import { PriceUpdateContextData } from "../../services/price-update-context/types";
import { PriceUpdateRule, PriceUpdateRuleName, RuleResult } from "../types";

/**
 * Ensures first price update requires 2x (100%) increase in price OR market cap
 * Only applies when no previous price updates exist
 */
export class FirstUpdateThresholdRule implements PriceUpdateRule {
    name = PriceUpdateRuleName.FIRST_UPDATE_THRESHOLD;

    constructor(private threshold: number = 2.0) {}

    async evaluate(context: PriceUpdateContextData): Promise<RuleResult> {
        // Only applies to first update
        if (context.priceUpdateCount > 0) {
            return {
                passed: true,
                reason: 'Not first update - rule does not apply',
                severity: 'info'
            };
        }

        const metPriceThreshold = context.priceMultiplier >= this.threshold;
        const metMcapThreshold = context.mcapMultiplier >= this.threshold;

        if (metPriceThreshold || metMcapThreshold) {
            return {
                passed: true,
                reason: `First update threshold met: ${context.priceMultiplier.toFixed(2)}x price, ${context.mcapMultiplier.toFixed(2)}x mcap (threshold: ${this.threshold}x)`,
                metadata: {
                    priceMultiplier: context.priceMultiplier,
                    mcapMultiplier: context.mcapMultiplier,
                    threshold: this.threshold
                }
            };
        }

        return {
            passed: false,
            reason: `First update requires ${this.threshold}x increase. Current: ${context.priceMultiplier.toFixed(2)}x price, ${context.mcapMultiplier.toFixed(2)}x mcap`,
            severity: 'info',
            metadata: {
                priceMultiplier: context.priceMultiplier,
                mcapMultiplier: context.mcapMultiplier,
                threshold: this.threshold
            }
        };
    }
}
