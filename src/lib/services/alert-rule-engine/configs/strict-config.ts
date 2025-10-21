import { AlertRuleConfig } from "../types";

/**
 * Strict configuration - all security checks must pass
 * Use this for maximum safety
 */
export const strictConfig: AlertRuleConfig = {
    requiredRules: [
        'is_renounced',
        'lp_burned',
        'no_honeypot',
        'no_mintable',
        'no_pausable',
        'no_freezable',
        'no_blacklist'
    ],
    evaluateAllRules: false
};

