import { IsRenouncedRule } from '../../rules/security/is-renounced-rule';
import { BaseContextData } from '../../../token-context/types';
import { AlertRuleName, RuleGroup } from '../../types';

describe('IsRenouncedRule', () => {
    const rule = new IsRenouncedRule();

    it('should pass when contract ownership is renounced', async () => {
        const context: Partial<BaseContextData> = {
            tokenSecurity: {
                isRenounced: true,
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false
            }
        };

        const result = await rule.evaluate(context as BaseContextData);

        expect(result.passed).toBe(true);
        expect(result.severity).toBe('critical');
        expect(result.reason).toContain('renounced');
    });

    it('should fail when contract ownership is not renounced', async () => {
        const context: Partial<BaseContextData> = {
            tokenSecurity: {
                isRenounced: false,
                isHoneypot: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false
            }
        };

        const result = await rule.evaluate(context as BaseContextData);

        expect(result.passed).toBe(false);
        expect(result.severity).toBe('critical');
        expect(result.reason).toContain('NOT renounced');
    });

    it('should have correct name and group', () => {
        expect(rule.name).toBe(AlertRuleName.IS_RENOUNCED);
        expect(rule.group).toBe(RuleGroup.SECURITY);
    });
});

