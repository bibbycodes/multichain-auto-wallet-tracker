import { AlertRule, RuleGroup, RuleResult } from "../../types";
import { BaseContextData } from "../../../token-context/types";

/**
 * Rule that checks if LP tokens are burned or locked
 * This prevents rug pulls where liquidity is removed
 */
export class LpBurnedRule implements AlertRule {
    name = 'lp_burned';
    group = RuleGroup.SECURITY;

    async evaluate(context: BaseContextData): Promise<RuleResult> {
        const { tokenSecurity } = context;

        return {
            passed: tokenSecurity.isLpTokenBurned,
            reason: tokenSecurity.isLpTokenBurned
                ? 'LP tokens are burned/locked (>90%)'
                : 'LP tokens are NOT sufficiently burned/locked - liquidity can be removed',
            severity: 'critical'
        };
    }
}

