import { AlertRule, AlertRuleName, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if the token is flagged as a honeypot
 * Honeypots allow buying but prevent selling
 */
export class NoHoneypotRule implements AlertRule {
    name = AlertRuleName.NO_HONEYPOT;
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        return {
            passed: !tokenSecurity.isHoneypot,
            reason: tokenSecurity.isHoneypot
                ? 'Token is flagged as HONEYPOT - cannot sell'
                : 'No honeypot detected',
            severity: 'critical'
        };
    }
}

