import { AlertRuleConfig, AlertRuleName } from "../types";

/**
 * Weighted configuration - uses custom weights to prioritize certain checks
 *
 * Weight priorities:
 * - Critical security (3.0): Honeypot, Mintable, Pausable
 * - High importance (2.0): Renounced, LP Burned
 * - Medium importance (1.0): Freezable, Blacklist
 *
 * Requires 75% weighted score to pass
 */
export const weightedConfig: AlertRuleConfig = {
    optionalRules: [
        AlertRuleName.NO_HONEYPOT,      // 3.0 weight
        AlertRuleName.NO_MINTABLE,      // 3.0 weight
        AlertRuleName.NO_PAUSABLE,      // 3.0 weight
        AlertRuleName.IS_RENOUNCED,     // 2.0 weight
        AlertRuleName.LP_BURNED,        // 2.0 weight
        AlertRuleName.NO_FREEZABLE,     // 1.0 weight (default)
        AlertRuleName.NO_BLACKLIST      // 1.0 weight (default)
    ],
    ruleWeights: {
        // Critical - these are deal-breakers
        [AlertRuleName.NO_HONEYPOT]: 3.0,
        [AlertRuleName.NO_MINTABLE]: 3.0,
        [AlertRuleName.NO_PAUSABLE]: 3.0,

        // High importance - very risky without these
        [AlertRuleName.IS_RENOUNCED]: 2.0,
        [AlertRuleName.LP_BURNED]: 2.0,

        // Medium importance - concerning but not critical
        // [AlertRuleName.NO_FREEZABLE]: 1.0,  // default
        // [AlertRuleName.NO_BLACKLIST]: 1.0,  // default
    },
    minOptionalScore: 0.75, // 75% of maximum weighted score
    evaluateAllRules: true
};

/**
 * Example calculation:
 * Max possible: (3+3+3+2+2+1+1) = 15 points
 * 
 * Scenario 1: All pass except blacklist
 * - Score: 14/15 = 93.3% ✅ PASS (> 75%)
 * 
 * Scenario 2: Honeypot fails (critical)
 * - Score: 12/15 = 80% ✅ PASS (> 75%)
 * 
 * Scenario 3: Renounced + LP burned fail
 * - Score: 11/15 = 73.3% ❌ FAIL (< 75%)
 * 
 * Scenario 4: All critical pass, but renounced + freezable + blacklist fail
 * - Score: 11/15 = 73.3% ❌ FAIL (< 75%)
 */

