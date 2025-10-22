import { AlertRuleConfig, AlertRuleName } from "../types";

/**
 * Balanced configuration - core security checks are required,
 * but allows some flexibility on less critical checks
 */
export const balancedConfig: AlertRuleConfig = {
    requiredRules: [
        AlertRuleName.IS_RENOUNCED,
        AlertRuleName.LP_BURNED
    ],
    blockerRules: [
        AlertRuleName.NO_HONEYPOT,
        AlertRuleName.NO_MINTABLE,
        AlertRuleName.NO_PAUSABLE,
        AlertRuleName.NO_FREEZABLE,
        AlertRuleName.NO_BLACKLIST
    ],
    minOptionalScore: 0.5,
    evaluateAllRules: false
};