import { AlertRule, AlertRuleName, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if the token supply can be increased
 * Mintable tokens allow creating new supply which dilutes holders
 */
export class NoMintableRule implements AlertRule {
    name = AlertRuleName.NO_MINTABLE;
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        return {
            passed: !tokenSecurity.isMintable,
            reason: tokenSecurity.isMintable
                ? 'Token is MINTABLE - supply can be increased'
                : 'Token is not mintable',
            severity: 'critical'
        };
    }
}

