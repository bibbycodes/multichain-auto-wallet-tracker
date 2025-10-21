import { NoHoneypotRule } from '../../rules/security/no-honeypot-rule';
import { BaseContextData } from '../../../token-context/types';

describe('NoHoneypotRule', () => {
    const rule = new NoHoneypotRule();

    it('should pass when token is not a honeypot', async () => {
        const context: Partial<BaseContextData> = {
            tokenSecurity: {
                isHoneypot: false,
                isRenounced: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false
            }
        };

        const result = await rule.evaluate(context as BaseContextData);
        expect(result.passed).toBe(true);
        expect(result.severity).toBe('critical');
        expect(result.reason).toContain('No honeypot');
    });

    it('should fail when token is a honeypot', async () => {
        const context: Partial<BaseContextData> = {
            tokenSecurity: {
                isHoneypot: true,
                isRenounced: false,
                isMintable: false,
                isLpTokenBurned: false,
                isPausable: false,
                isFreezable: false
            }
        };

        const result = await rule.evaluate(context as BaseContextData);
        expect(result.passed).toBe(false);
        expect(result.severity).toBe('critical');
        expect(result.reason).toContain('HONEYPOT');
    });
});

