import { BaseContext } from "../token-context/base-context";
import { BaseContextData } from "../token-context/types";
import { AlertRule, AlertRuleConfig, AlertDecision, AlertRuleName, RuleResult, RuleEvaluationSummary } from "./types";
import {
    IsRenouncedRule,
    LpBurnedRule,
    NoHoneypotRule,
    NoMintableRule,
    NoPausableRule,
    NoFreezableRule,
    NoBlacklistRule
} from "./rules";

/**
 * Alert Rule Engine - Evaluates multiple rules to determine if an alert should be sent
 *
 * Features:
 * - Rule-based decision making
 * - Configurable rule requirements
 * - Blocker rules for immediate rejection
 * - Optional rules with scoring
 * - Detailed evaluation results for debugging
 */
export class AlertRuleEngine {
    private static readonly DEFAULT_RULE_WEIGHT = 1.0;

    private rules: Map<AlertRuleName, AlertRule> = new Map();
    private config: AlertRuleConfig;
    private logger: { warn: (msg: string) => void; error: (msg: string, error?: any) => void };

    constructor(
        private readonly baseContext: BaseContext,
        config?: AlertRuleConfig,
        logger?: { warn: (msg: string) => void; error: (msg: string, error?: any) => void }
    ) {
        this.config = config || this.getDefaultConfig();
        this.logger = logger || {
            warn: (msg: string) => console.warn(msg),
            error: (msg: string, error?: any) => console.error(msg, error)
        };
        this.registerDefaultRules();
    }

    /**
     * Register a custom rule
     */
    registerRule(rule: AlertRule): void {
        this.rules.set(rule.name, rule);
    }

    /**
     * Unregister a rule by name
     */
    unregisterRule(ruleName: AlertRuleName): void {
        this.rules.delete(ruleName);
    }

    /**
     * Get all registered rules
     */
    getRules(): AlertRule[] {
        return Array.from(this.rules.values());
    }

    /**
     * Main evaluation method - determines if an alert should be sent
     */
    async evaluate(): Promise<AlertDecision> {
        const contextData = await this.baseContext.toObject();
        const results = await this.evaluateRules(contextData);
        const decision = this.makeDecision(results);
        decision.results = results;
        return decision;
    }

    /**
     * Evaluate all rules against the context
     */
    private async evaluateRules(context: BaseContextData): Promise<Map<AlertRuleName, RuleResult>> {
        const results = new Map<AlertRuleName, RuleResult>();

        // If evaluateAllRules is false and we have blocker rules, check them first
        if (!this.config.evaluateAllRules && this.config.blockerRules) {
            for (const ruleName of this.config.blockerRules) {
                const rule = this.rules.get(ruleName);
                if (!rule) {
                    this.logger.warn(`Blocker rule '${ruleName}' not found`);
                    continue;
                }

                const result = await rule.evaluate(context);
                results.set(ruleName, result);

                // If blocker rule fails, stop immediately
                if (!result.passed) {
                    return results;
                }
            }
        }

        // Evaluate all other rules
        for (const [name, rule] of this.rules) {
            // Skip if already evaluated (blocker rules)
            if (results.has(name)) continue;

            try {
                const result = await rule.evaluate(context);
                results.set(name, result);
            } catch (error) {
                this.logger.error(`Error evaluating rule '${name}':`, error);
                results.set(name, {
                    passed: false,
                    reason: `Rule evaluation failed: ${error}`,
                    severity: 'critical'
                });
            }
        }

        return results;
    }

    /**
     * Get the weight for a rule (from config or rule default)
     */
    private getRuleWeight(ruleName: AlertRuleName): number {
        // Check config override first
        if (this.config.ruleWeights && this.config.ruleWeights[ruleName] !== undefined) {
            return this.config.ruleWeights[ruleName]!;
        }

        // Check rule's default weight
        const rule = this.rules.get(ruleName);
        if (rule && rule.weight !== undefined) {
            return rule.weight;
        }

        // Default weight
        return AlertRuleEngine.DEFAULT_RULE_WEIGHT;
    }

    /**
     * Calculate weighted score for optional rules
     */
    private calculateWeightedScore(
        optionalRuleNames: AlertRuleName[],
        results: Map<AlertRuleName, RuleResult>
    ): {
        actualScore: number;
        maxPossibleScore: number;
        normalizedScore: number;
        ruleScores: Map<AlertRuleName, { weight: number; passed: boolean; contribution: number }>;
    } {
        let actualScore = 0;
        let maxPossibleScore = 0;
        const ruleScores = new Map<AlertRuleName, { weight: number; passed: boolean; contribution: number }>();

        for (const ruleName of optionalRuleNames) {
            const weight = this.getRuleWeight(ruleName);
            const result = results.get(ruleName);

            if (!result) {
                this.logger.warn(`Optional rule '${ruleName}' not found in results, treating as failed`);
            }

            const passed = result ? result.passed : false;
            const contribution = passed ? weight : 0;

            maxPossibleScore += weight;
            actualScore += contribution;

            ruleScores.set(ruleName, { weight, passed, contribution });
        }

        const normalizedScore = maxPossibleScore > 0 ? actualScore / maxPossibleScore : 0;

        return {
            actualScore,
            maxPossibleScore,
            normalizedScore,
            ruleScores
        };
    }

    /**
     * Check blocker rules - if any fail, return rejection decision
     */
    private checkBlockerRules(
        results: Map<AlertRuleName, RuleResult>,
        passedRules: AlertRuleName[]
    ): AlertDecision | null {
        if (!this.config.blockerRules) return null;

        for (const ruleName of this.config.blockerRules) {
            const result = results.get(ruleName);
            if (result && !result.passed) {
                return {
                    shouldAlert: false,
                    reason: `Blocker rule '${ruleName}' failed: ${result.reason}`,
                    failedRules: [ruleName],
                    passedRules
                };
            }
        }

        return null;
    }

    /**
     * Check required rules - if any fail, return rejection decision
     */
    private checkRequiredRules(
        results: Map<AlertRuleName, RuleResult>,
        passedRules: AlertRuleName[]
    ): AlertDecision | null {
        if (!this.config.requiredRules) return null;

        const failedRequired: AlertRuleName[] = [];

        for (const ruleName of this.config.requiredRules) {
            const result = results.get(ruleName);
            if (!result || !result.passed) {
                failedRequired.push(ruleName);
            }
        }

        if (failedRequired.length > 0) {
            const reasons = failedRequired
                .map(name => {
                    const result = results.get(name);
                    return `${name}: ${result?.reason || 'not evaluated'}`;
                })
                .join('; ');

            return {
                shouldAlert: false,
                reason: `Required rules failed - ${reasons}`,
                failedRules: failedRequired,
                passedRules
            };
        }

        return null;
    }

    /**
     * Check blacklist rules - if ANY fail, return rejection decision
     * All blacklist rules must pass to proceed
     */
    private checkBlacklistRules(
        results: Map<AlertRuleName, RuleResult>,
        passedRules: AlertRuleName[]
    ): AlertDecision | null {
        if (!this.config.blacklistRules || this.config.blacklistRules.length === 0) {
            return null;
        }

        const failedBlacklist: AlertRuleName[] = [];

        for (const ruleName of this.config.blacklistRules) {
            const result = results.get(ruleName);
            if (!result || !result.passed) {
                failedBlacklist.push(ruleName);
            }
        }

        if (failedBlacklist.length > 0) {
            const reasons = failedBlacklist
                .map(name => {
                    const result = results.get(name);
                    return `${name}: ${result?.reason || 'not evaluated'}`;
                })
                .join('; ');

            return {
                shouldAlert: false,
                reason: `Blacklist rules failed - ${reasons}`,
                failedRules: failedBlacklist,
                passedRules
            };
        }

        return null;
    }

    /**
     * Check whitelist rules - at least ONE must pass
     * If none pass, return rejection decision
     */
    private checkWhitelistRules(
        results: Map<AlertRuleName, RuleResult>,
        passedRules: AlertRuleName[]
    ): AlertDecision | null {
        if (!this.config.whitelistRules || this.config.whitelistRules.length === 0) {
            return null;
        }

        const anyPassed = this.config.whitelistRules.some(ruleName => {
            const result = results.get(ruleName);
            return result && result.passed;
        });

        if (!anyPassed) {
            const allWhitelistRules = this.config.whitelistRules
                .map(name => {
                    const result = results.get(name);
                    const status = result?.passed ? '✅' : '❌';
                    return `${status} ${name}`;
                })
                .join(', ');

            return {
                shouldAlert: false,
                reason: `No whitelist rules passed - at least one required. Evaluated: ${allWhitelistRules}`,
                failedRules: this.config.whitelistRules,
                passedRules
            };
        }

        return null;
    }

    /**
     * Categorize rule results into passed and failed
     */
    private categorizeResults(results: Map<AlertRuleName, RuleResult>): {
        failedRules: AlertRuleName[];
        passedRules: AlertRuleName[];
    } {
        const failedRules: AlertRuleName[] = [];
        const passedRules: AlertRuleName[] = [];

        for (const [ruleName, result] of results) {
            if (result.passed) {
                passedRules.push(ruleName);
            } else {
                failedRules.push(ruleName);
            }
        }

        return { failedRules, passedRules };
    }

    /**
     * Make the final decision based on rule results
     *
     * Evaluation order:
     * 1. Blocker rules (any failure = immediate rejection)
     * 2. Blacklist rules (any failure = rejection)
     * 3. Whitelist rules (at least one must pass)
     * 4. Required rules (all must pass)
     * 5. Optional rules (weighted scoring)
     */
    private makeDecision(results: Map<AlertRuleName, RuleResult>): AlertDecision {
        const { failedRules, passedRules } = this.categorizeResults(results);

        // Check blocker rules first (immediate rejection)
        const blockerDecision = this.checkBlockerRules(results, passedRules);
        if (blockerDecision) return blockerDecision;

        // Check blacklist rules (all must pass)
        const blacklistDecision = this.checkBlacklistRules(results, passedRules);
        if (blacklistDecision) return blacklistDecision;

        // Check whitelist rules (at least one must pass)
        const whitelistDecision = this.checkWhitelistRules(results, passedRules);
        if (whitelistDecision) return whitelistDecision;

        // Check required rules
        const requiredDecision = this.checkRequiredRules(results, passedRules);
        if (requiredDecision) return requiredDecision;

        // Check optional rules with weighted scoring
        if (this.config.optionalRules && this.config.optionalRules.length > 0) {
            const scoreDetails = this.calculateWeightedScore(this.config.optionalRules, results);
            const minScore = this.config.minOptionalScore || 0;

            if (scoreDetails.normalizedScore < minScore) {
                return {
                    shouldAlert: false,
                    reason: `Optional rules score too low: ${(scoreDetails.actualScore).toFixed(1)}/${scoreDetails.maxPossibleScore.toFixed(1)} (${(scoreDetails.normalizedScore * 100).toFixed(0)}%, required: ${(minScore * 100).toFixed(0)}%)`,
                    failedRules,
                    passedRules,
                    score: scoreDetails.normalizedScore,
                    scoreDetails
                };
            }

            return {
                shouldAlert: true,
                reason: `All checks passed. Score: ${scoreDetails.actualScore.toFixed(1)}/${scoreDetails.maxPossibleScore.toFixed(1)} (${(scoreDetails.normalizedScore * 100).toFixed(0)}%)`,
                failedRules,
                passedRules,
                score: scoreDetails.normalizedScore,
                scoreDetails
            };
        }

        // All required rules passed
        return {
            shouldAlert: true,
            reason: 'All required checks passed',
            failedRules,
            passedRules
        };
    }

    /**
     * Get a summary of the evaluation results
     */
    getSummary(results: Map<AlertRuleName, RuleResult>): RuleEvaluationSummary {
        let passedRules = 0;
        let failedRules = 0;
        let criticalFailures = 0;
        let warningFailures = 0;

        for (const result of results.values()) {
            if (result.passed) {
                passedRules++;
            } else {
                failedRules++;
                if (result.severity === 'critical') {
                    criticalFailures++;
                } else if (result.severity === 'warning') {
                    warningFailures++;
                }
            }
        }

        return {
            totalRules: results.size,
            passedRules,
            failedRules,
            criticalFailures,
            warningFailures,
            executionTimeMs: 0 // Will be set by caller
        };
    }

    /**
     * Register all default security rules
     */
    private registerDefaultRules(): void {
        this.registerRule(new IsRenouncedRule());
        this.registerRule(new LpBurnedRule());
        this.registerRule(new NoHoneypotRule());
        this.registerRule(new NoMintableRule());
        this.registerRule(new NoPausableRule());
        this.registerRule(new NoFreezableRule());
        this.registerRule(new NoBlacklistRule());
    }

    /**
     * Get the default configuration
     */
    private getDefaultConfig(): AlertRuleConfig {
        return {
            requiredRules: [
                AlertRuleName.IS_RENOUNCED,
                AlertRuleName.LP_BURNED
            ],
            blockerRules: [
                AlertRuleName.NO_HONEYPOT,
                AlertRuleName.NO_MINTABLE,
                AlertRuleName.NO_PAUSABLE,
                AlertRuleName.NO_FREEZABLE
            ],
            evaluateAllRules: false
        };
    }
}

