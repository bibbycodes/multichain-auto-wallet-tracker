import { AlertRule, AlertRuleName, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if the token has blacklist functionality
 * Blacklisted addresses cannot transfer tokens
 */
export class NoBlacklistRule implements AlertRule {
    name = AlertRuleName.NO_BLACKLIST;
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        // Check if isBlacklist is defined before evaluating
        if (tokenSecurity.isBlacklist === undefined) {
            return {
                passed: true,
                reason: 'Blacklist status unknown - passing by default',
                severity: 'info'
            };
        }

        return {
            passed: !tokenSecurity.isBlacklist,
            reason: tokenSecurity.isBlacklist
                ? 'Token has BLACKLIST flag'
                : 'Token does not have blacklist',
            severity: 'warning'
        };
    }
}

