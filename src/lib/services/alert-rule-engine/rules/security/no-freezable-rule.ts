import { AlertRule, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if individual wallets can be frozen
 * Freezable tokens allow blocking specific addresses
 */
export class NoFreezableRule implements AlertRule {
    name = 'no_freezable';
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        return {
            passed: !tokenSecurity.isFreezable,
            reason: tokenSecurity.isFreezable
                ? 'Token is FREEZABLE - individual wallets can be frozen'
                : 'Token is not freezable',
            severity: 'critical'
        };
    }
}

