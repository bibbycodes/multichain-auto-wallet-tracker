import { AlertRule, AlertRuleName, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if token transfers can be paused
 * Pausable tokens can be frozen, preventing all transfers
 */
export class NoPausableRule implements AlertRule {
    name = AlertRuleName.NO_PAUSABLE;
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        return {
            passed: !tokenSecurity.isPausable,
            reason: tokenSecurity.isPausable
                ? 'Token is PAUSABLE - transfers can be frozen'
                : 'Token is not pausable',
            severity: 'critical'
        };
    }
}

