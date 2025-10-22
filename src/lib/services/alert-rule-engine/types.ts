import { BaseContextData } from "../token-context/types";

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
 * Base interface for all alert rules
 */
export interface AlertRule {
    name: AlertRuleName;
    group: RuleGroup;
    /**
     * Weight for scoring (default: 1.0)
     * Higher weight = more important
     */
    weight?: number;
    evaluate(context: BaseContextData): Promise<RuleResult>;
}

/**
 * All available alert rule names
 * Ensures type safety across rule configurations
 */
export enum AlertRuleName {
    IS_RENOUNCED = 'is_renounced',
    LP_BURNED = 'lp_burned',
    NO_HONEYPOT = 'no_honeypot',
    NO_MINTABLE = 'no_mintable',
    NO_PAUSABLE = 'no_pausable',
    NO_FREEZABLE = 'no_freezable',
    NO_BLACKLIST = 'no_blacklist',
}

/**
 * Categories for organizing rules
 */
export enum RuleGroup {
    SECURITY = 'security',
    DISTRIBUTION = 'distribution',
    LIQUIDITY = 'liquidity',
    MARKET = 'market',
    TAX = 'tax',
}

/**
 * Rule weight configuration for custom scoring
 */
export type RuleWeightConfig = {
    [K in AlertRuleName]?: number;
};

/**
 * Configuration for the alert rule engine
 */
export interface AlertRuleConfig {
    /**
     * All rules in this list must pass for an alert to be sent
     */
    requiredRules?: AlertRuleName[];

    /**
     * If any of these rules fail, immediately reject without checking other rules
     */
    blockerRules?: AlertRuleName[];

    /**
     * If ANY of these rules fail, the alert will be rejected
     * Similar to blockerRules but evaluated after blockers
     * All blacklist rules must pass to proceed
     */
    blacklistRules?: AlertRuleName[];

    /**
     * At least ONE of these rules must pass for the alert to be sent
     * Opposite of blacklist - requires at least one passing rule
     */
    whitelistRules?: AlertRuleName[];

    /**
     * At least one of these rules must pass (optional scoring)
     */
    optionalRules?: AlertRuleName[];

    /**
     * Custom weights for rules (overrides default weights)
     * Example: { [AlertRuleName.IS_RENOUNCED]: 2.0, [AlertRuleName.LP_BURNED]: 1.5 }
     */
    ruleWeights?: RuleWeightConfig;

    /**
     * Minimum score for optional rules (0-1)
     * When using weights, this is the percentage of maximum possible score
     * Example: 0.7 means 70% of maximum weighted score must be achieved
     */
    minOptionalScore?: number;

    /**
     * Whether to continue evaluating after a blocker rule fails
     * Useful for debugging but slower
     */
    evaluateAllRules?: boolean;
}

/**
 * Final decision from the alert rule engine
 */
export interface AlertDecision {
    shouldAlert: boolean;
    reason: string;
    failedRules?: AlertRuleName[];
    passedRules?: AlertRuleName[];
    results?: Map<AlertRuleName, RuleResult>;
    /**
     * Normalized score (0-1)
     * Actual score / Maximum possible score
     */
    score?: number;
    /**
     * Detailed scoring information
     */
    scoreDetails?: {
        actualScore: number;
        maxPossibleScore: number;
        normalizedScore: number;
        ruleScores: Map<AlertRuleName, { weight: number; passed: boolean; contribution: number }>;
    };
}

/**
 * Summary of rule evaluation for logging/debugging
 */
export interface RuleEvaluationSummary {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    criticalFailures: number;
    warningFailures: number;
    executionTimeMs: number;
}

