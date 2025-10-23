import { PriceUpdateContextData } from "../services/price-update-context/types";

/**
 * Result of evaluating a single rule
 */
export interface RuleResult {
    passed: boolean;
    reason?: string;
    severity?: 'critical' | 'warning' | 'info';
    metadata?: Record<string, any>;
}

/**
 * Base interface for all price update rules
 */
export interface PriceUpdateRule {
    name: PriceUpdateRuleName;
    evaluate(context: PriceUpdateContextData): Promise<RuleResult>;
}

/**
 * All available price update rule names
 */
export enum PriceUpdateRuleName {
    FIRST_UPDATE_THRESHOLD = 'first_update_threshold',
    MINIMUM_TIME_BETWEEN = 'minimum_time_between',
    MILESTONE_MULTIPLIER = 'milestone_multiplier',
}

/**
 * Configuration for how to apply and combine rules in a specific scenario
 */
export interface RuleApplicationConfig {
    requiredRules: PriceUpdateRuleName[];  // Which rules must be evaluated
    logicOperator: 'AND' | 'OR';           // How to combine rule results
}

/**
 * Configuration for the price update rule engine
 */
export interface PriceUpdateConfig {
    /**
     * Cooldown period between updates in minutes
     * Default: 60 minutes
     */
    cooldownMinutes?: number;

    /**
     * First update threshold multiplier
     * Default: 2.0 (2x)
     */
    firstUpdateThreshold?: number;

    /**
     * Milestone thresholds (e.g., [5, 10, 50, 100])
     * Default: [5, 10, 25, 50, 100, 250, 500, 1000]
     */
    milestones?: number[];

    /**
     * Rule applicability configuration
     * Defines which rules apply in different scenarios and how to combine them
     */
    ruleApplicationConfig?: {
        firstUpdate: RuleApplicationConfig;
        subsequentUpdates: RuleApplicationConfig;
    };
}

/**
 * Final decision from the price update rule engine
 */
export interface UpdateDecision {
    passes: boolean;
    reason: string;
    failedRules?: PriceUpdateRuleName[];
    passedRules?: PriceUpdateRuleName[];
    results?: Map<PriceUpdateRuleName, RuleResult>;
}

/**
 * Get the default price update configuration
 */
export function getDefaultPriceUpdateConfig(): Required<PriceUpdateConfig> {
    return {
        cooldownMinutes: 60, // 1 hour
        firstUpdateThreshold: 2.0, // 2x
        milestones: [5, 10, 25, 50, 100, 250, 500, 1000],
        ruleApplicationConfig: {
            firstUpdate: {
                requiredRules: [
                    PriceUpdateRuleName.FIRST_UPDATE_THRESHOLD
                ],
                logicOperator: 'AND' // Only need 2x threshold
            },
            subsequentUpdates: {
                requiredRules: [
                    PriceUpdateRuleName.MINIMUM_TIME_BETWEEN,
                    PriceUpdateRuleName.MILESTONE_MULTIPLIER
                ],
                logicOperator: 'AND' // cooldown AND milestone
            }
        }
    };
}
