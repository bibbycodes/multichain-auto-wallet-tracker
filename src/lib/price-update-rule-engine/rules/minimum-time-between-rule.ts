import { PriceUpdateContextData } from "../../services/price-update-context";
import { PriceUpdateRule, PriceUpdateRuleName, RuleResult } from "../types";


/**
 * Enforces cooldown period between updates to prevent spam
 * Configurable via constructor (default: 60 minutes)
 */
export class MinimumTimeBetweenRule implements PriceUpdateRule {
    name = PriceUpdateRuleName.MINIMUM_TIME_BETWEEN;

    private cooldownMs: number;

    constructor(cooldownMinutes: number = 60) {
        this.cooldownMs = cooldownMinutes * 60 * 1000;
    }

    async evaluate(context: PriceUpdateContextData): Promise<RuleResult> {
        // First update has no cooldown
        if (!context.timeSinceLastUpdate) {
            return {
                passed: true,
                reason: 'First update - no cooldown required',
                severity: 'info'
            };
        }

        const cooldownMet = context.timeSinceLastUpdate >= this.cooldownMs;
        const minutesWaited = (context.timeSinceLastUpdate / (60 * 1000)).toFixed(1);
        const minutesRequired = (this.cooldownMs / (60 * 1000)).toFixed(0);

        if (cooldownMet) {
            return {
                passed: true,
                reason: `Cooldown period satisfied: ${minutesWaited}min elapsed (required: ${minutesRequired}min)`,
                metadata: {
                    timeSinceLastUpdate: context.timeSinceLastUpdate,
                    cooldownRequired: this.cooldownMs,
                    minutesWaited: parseFloat(minutesWaited)
                }
            };
        }

        const remainingMs = this.cooldownMs - context.timeSinceLastUpdate;
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

        return {
            passed: false,
            reason: `Cooldown not met: ${minutesWaited}min elapsed, need ${minutesRequired}min (${remainingMinutes}min remaining)`,
            severity: 'info',
            metadata: {
                timeSinceLastUpdate: context.timeSinceLastUpdate,
                cooldownRequired: this.cooldownMs,
                remainingMs
            }
        };
    }
}
