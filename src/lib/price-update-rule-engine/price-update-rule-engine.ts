import { PriceUpdateContext } from "../services/price-update-context/price-update-context";
import { PriceUpdateRule, PriceUpdateRuleName, RuleResult, UpdateDecision, PriceUpdateConfig } from "./types";
import {
    FirstUpdateThresholdRule,
    MinimumTimeBetweenRule,
    MilestoneMultiplierRule
} from "./rules";

/**
 * Price Update Rule Engine - Evaluates rules to determine if a price update should be sent
 *
 * All rules are binary (pass/fail) - ALL must pass for an update to be sent
 * Rules:
 * - FirstUpdateThresholdRule: Requires 2x for first update
 * - MinimumTimeBetweenRule: Enforces cooldown period
 * - MilestoneMultiplierRule: Checks for milestone achievements
 */
export class PriceUpdateRuleEngine {
    private rules: PriceUpdateRule[] = [];
    private config: Required<PriceUpdateConfig>;

    constructor(
        private readonly context: PriceUpdateContext,
        config: Required<PriceUpdateConfig>
    ) {
        this.config = config;
        this.registerRules();
    }

    /**
     * Main evaluation method - determines if a price update should be sent
     * All rules must pass for shouldSendUpdate = true
     */
    async evaluate(): Promise<UpdateDecision> {
        const contextData = this.context.toObject();
        const results = await this.evaluateRules(contextData);
        return this.makeDecision(results);
    }

    /**
     * Evaluate all rules against the context
     */
    private async evaluateRules(contextData: any): Promise<Map<PriceUpdateRuleName, RuleResult>> {
        const results = new Map<PriceUpdateRuleName, RuleResult>();

        for (const rule of this.rules) {
            try {
                const result = await rule.evaluate(contextData);
                results.set(rule.name, result);
            } catch (error) {
                console.error(`Error evaluating rule '${rule.name}':`, error);
                results.set(rule.name, {
                    passed: false,
                    reason: `Rule evaluation failed: ${error}`,
                    severity: 'critical'
                });
            }
        }

        return results;
    }

    /**
     * Make the final decision based on rule results and configuration
     */
    private makeDecision(results: Map<PriceUpdateRuleName, RuleResult>): UpdateDecision {
        const contextData = this.context.toObject();
        const isFirstUpdate = contextData.priceUpdateCount === 0;

        // Get the applicable rule configuration
        const ruleConfig = isFirstUpdate
            ? this.config.ruleApplicationConfig.firstUpdate
            : this.config.ruleApplicationConfig.subsequentUpdates;

        // Filter results to only include required rules
        const requiredResults = new Map<PriceUpdateRuleName, RuleResult>();
        for (const ruleName of ruleConfig.requiredRules) {
            const result = results.get(ruleName);
            if (result) {
                requiredResults.set(ruleName, result);
            }
        }

        // Categorize results
        const failedRules: PriceUpdateRuleName[] = [];
        const passedRules: PriceUpdateRuleName[] = [];

        for (const [ruleName, result] of requiredResults) {
            if (result.passed) {
                passedRules.push(ruleName);
            } else {
                failedRules.push(ruleName);
            }
        }

        // Apply logic operator
        const shouldPass = ruleConfig.logicOperator === 'OR'
            ? passedRules.length > 0  // At least one rule passed
            : failedRules.length === 0; // All rules passed

        if (!shouldPass) {
            const reasons = failedRules
                .map(name => {
                    const result = requiredResults.get(name);
                    return `${name}: ${result?.reason || 'failed'}`;
                })
                .join('; ');

            return {
                passes: false,
                reason: `Rules failed (${ruleConfig.logicOperator}) - ${reasons}`,
                failedRules,
                passedRules,
                results
            };
        }

        // Rules passed according to logic operator
        return {
            passes: true,
            reason: `All required rules passed (${ruleConfig.logicOperator})`,
            failedRules,
            passedRules,
            results
        };
    }

    /**
     * Register all rules with configuration
     */
    private registerRules(): void {
        this.rules = [
            new FirstUpdateThresholdRule(this.config.firstUpdateThreshold),
            new MinimumTimeBetweenRule(this.config.cooldownMinutes),
            new MilestoneMultiplierRule(this.config.milestones)
        ];
    }


    /**
     * Get all registered rules
     */
    getRules(): PriceUpdateRule[] {
        return this.rules;
    }
}
