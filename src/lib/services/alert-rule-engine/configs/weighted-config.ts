import { AlertRuleConfig } from "../types";

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
        'no_honeypot',      // 3.0 weight
        'no_mintable',      // 3.0 weight
        'no_pausable',      // 3.0 weight
        'is_renounced',     // 2.0 weight
        'lp_burned',        // 2.0 weight
        'no_freezable',     // 1.0 weight (default)
        'no_blacklist'      // 1.0 weight (default)
    ],
    ruleWeights: {
        // Critical - these are deal-breakers
        'no_honeypot': 3.0,
        'no_mintable': 3.0,
        'no_pausable': 3.0,
        
        // High importance - very risky without these
        'is_renounced': 2.0,
        'lp_burned': 2.0,
        
        // Medium importance - concerning but not critical
        // 'no_freezable': 1.0,  // default
        // 'no_blacklist': 1.0,  // default
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

