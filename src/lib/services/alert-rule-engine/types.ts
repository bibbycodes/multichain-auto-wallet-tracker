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
    name: string;
    group: RuleGroup;
    /**
     * Weight for scoring (default: 1.0)
     * Higher weight = more important
     */
    weight?: number;
    evaluate(context: BaseContextData): Promise<RuleResult>;
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
export interface RuleWeightConfig {
    [ruleName: string]: number;
}

/**
 * Configuration for the alert rule engine
 */
export interface AlertRuleConfig {
    /**
     * All rules in this list must pass for an alert to be sent
     */
    requiredRules?: string[];

    /**
     * If any of these rules fail, immediately reject without checking other rules
     */
    blockerRules?: string[];

    /**
     * If ANY of these rules fail, the alert will be rejected
     * Similar to blockerRules but evaluated after blockers
     * All blacklist rules must pass to proceed
     */
    blacklistRules?: string[];

    /**
     * At least ONE of these rules must pass for the alert to be sent
     * Opposite of blacklist - requires at least one passing rule
     */
    whitelistRules?: string[];

    /**
     * At least one of these rules must pass (optional scoring)
     */
    optionalRules?: string[];

    /**
     * Custom weights for rules (overrides default weights)
     * Example: { 'is_renounced': 2.0, 'lp_burned': 1.5 }
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
    failedRules?: string[];
    passedRules?: string[];
    results?: Map<string, RuleResult>;
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
        ruleScores: Map<string, { weight: number; passed: boolean; contribution: number }>;
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

