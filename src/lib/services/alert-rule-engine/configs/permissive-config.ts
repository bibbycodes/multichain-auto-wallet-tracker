import { AlertRuleConfig, AlertRuleName } from "../types";

/**
 * Permissive configuration - only blocks on honeypots,
 * uses scoring for other checks
 * Use with caution - may allow riskier tokens through
 */
export const permissiveConfig: AlertRuleConfig = {
    blockerRules: [
        AlertRuleName.NO_HONEYPOT
    ],
    optionalRules: [
        AlertRuleName.IS_RENOUNCED,
        AlertRuleName.LP_BURNED,
        AlertRuleName.NO_MINTABLE,
        AlertRuleName.NO_PAUSABLE,
        AlertRuleName.NO_FREEZABLE,
        AlertRuleName.NO_BLACKLIST
    ],
    minOptionalScore: 0.6, // 60% of optional checks must pass
    evaluateAllRules: true
};

