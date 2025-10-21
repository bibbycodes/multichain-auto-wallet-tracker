import { AlertRuleConfig } from "../types";

/**
 * Balanced configuration - core security checks are required,
 * but allows some flexibility on less critical checks
 */
export const balancedConfig: AlertRuleConfig = {
    requiredRules: [
        'is_renounced',
        'lp_burned'
    ],
    blockerRules: [
        'no_honeypot',
        'no_mintable',
        'no_pausable',
        'no_freezable'
    ],
    optionalRules: [
        'no_blacklist'
    ],
    minOptionalScore: 0.5,
    evaluateAllRules: false
};

