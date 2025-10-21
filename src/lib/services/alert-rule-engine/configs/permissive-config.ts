import { AlertRuleConfig } from "../types";

/**
 * Permissive configuration - only blocks on honeypots,
 * uses scoring for other checks
 * Use with caution - may allow riskier tokens through
 */
export const permissiveConfig: AlertRuleConfig = {
    blockerRules: [
        'no_honeypot'
    ],
    optionalRules: [
        'is_renounced',
        'lp_burned',
        'no_mintable',
        'no_pausable',
        'no_freezable',
        'no_blacklist'
    ],
    minOptionalScore: 0.6, // 60% of optional checks must pass
    evaluateAllRules: true
};

