import { AlertRule, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if the token contract ownership is renounced
 * This is a critical security check - renounced ownership means
 * the contract cannot be modified by the owner
 */
export class IsRenouncedRule implements AlertRule {
    name = 'is_renounced';
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        return {
            passed: tokenSecurity.isRenounced,
            reason: tokenSecurity.isRenounced
                ? 'Contract ownership is renounced'
                : 'Contract ownership is NOT renounced - owner can modify contract',
            severity: 'critical'
        };
    }
}

