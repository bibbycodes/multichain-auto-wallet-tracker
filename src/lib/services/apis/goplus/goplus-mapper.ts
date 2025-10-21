import { GoPlusTokenSecurity, GoPlusSolanaTokenSecurity } from "python-proxy-scraper-client";
import { TokenSecurity } from "../../../models/token/types";
import { MIN_BURN_RATIO } from "../../../../shared/constants";
import { safeParseBoolean, safeParseNumber } from "../../../../utils/object";

export class GoPlusMapper {
    /**
     * Extract TokenSecurity from GoPlus EVM token security data
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurityFromEvm(security: GoPlusTokenSecurity): Partial<TokenSecurity> {
        return this.mapGoPlusTokenSecurityToTokenSecurity(security);
    }

    /**
     * Extract TokenSecurity from GoPlus Solana token security data
     * Returns partial data - only fields that can be determined are included
     */
    public static extractTokenSecurityFromSolana(security: GoPlusSolanaTokenSecurity): Partial<TokenSecurity> {
        return this.mapGoPlusSolanaTokenSecurityToTokenSecurity(security);
    }

    /**
     * Helper to build partial TokenSecurity result from extracted values
     * Only includes fields that are not undefined
     */
    private static buildPartialTokenSecurity(fields: Partial<TokenSecurity>): Partial<TokenSecurity> {
        const result: Partial<TokenSecurity> = {};
        
        if (fields.isHoneypot !== undefined) result.isHoneypot = fields.isHoneypot;
        if (fields.isMintable !== undefined) result.isMintable = fields.isMintable;
        if (fields.isLpTokenBurned !== undefined) result.isLpTokenBurned = fields.isLpTokenBurned;
        if (fields.isPausable !== undefined) result.isPausable = fields.isPausable;
        if (fields.isFreezable !== undefined) result.isFreezable = fields.isFreezable;
        if (fields.isRenounced !== undefined) result.isRenounced = fields.isRenounced;
        if (fields.buyTax !== undefined) result.buyTax = fields.buyTax;
        if (fields.sellTax !== undefined) result.sellTax = fields.sellTax;
        if (fields.transferTax !== undefined) result.transferTax = fields.transferTax;
        if (fields.isBlacklist !== undefined) result.isBlacklist = fields.isBlacklist;
        
        return result;
    }

    /**
     * Calculate LP burn status from holder data
     */
    private static calculateLpBurnStatus(security: GoPlusTokenSecurity): boolean | undefined {
        try {
            const lpHolders = security.lp_holders;
            if (!lpHolders || !Array.isArray(lpHolders) || lpHolders.length === 0) {
                return undefined;
            }
            
            const lockedLpHolders = lpHolders.filter(holder => 
                holder && holder.is_locked && safeParseBoolean(holder.is_locked)
            );
            
            const lockedRatio = lockedLpHolders.reduce((acc, holder) => {
                const percent = safeParseNumber(holder.percent);
                return acc + (percent || 0);
            }, 0);
            
            return lockedRatio > MIN_BURN_RATIO;
        } catch (error) {
            console.warn('Error calculating LP burned status:', error);
            return undefined;
        }
    }

    /**
     * Map GoPlus EVM token security to TokenSecurity model
     * Returns partial data - only fields that can be determined are included
     */
    private static mapGoPlusTokenSecurityToTokenSecurity(security: GoPlusTokenSecurity): Partial<TokenSecurity> {
        return this.buildPartialTokenSecurity({
            isHoneypot: safeParseBoolean(security.is_honeypot),
            isMintable: safeParseBoolean(security.is_mintable),
            isLpTokenBurned: this.calculateLpBurnStatus(security),
            isPausable: safeParseBoolean(security.transfer_pausable),
            isFreezable: safeParseBoolean(security.transfer_pausable),
            isRenounced: security.owner_address !== undefined
                ? !security.owner_address || security.owner_address === '0x0000000000000000000000000000000000000000'
                : undefined,
            buyTax: safeParseNumber(security.buy_tax),
            sellTax: safeParseNumber(security.sell_tax),
            transferTax: safeParseNumber(security.transfer_tax),
            isBlacklist: safeParseBoolean(security.is_blacklisted),
        });
    }

    /**
     * Map GoPlus Solana token security to TokenSecurity model
     * Returns partial data - only fields that can be determined are included
     */
    private static mapGoPlusSolanaTokenSecurityToTokenSecurity(security: GoPlusSolanaTokenSecurity): Partial<TokenSecurity> {
        return this.buildPartialTokenSecurity({
            isHoneypot: false, // Solana doesn't have a direct honeypot indicator
            isMintable: security.mintable?.status ? security.mintable.status === 'enabled' : undefined,
            isLpTokenBurned: false, // Not available from GoPlus
            isPausable: false, // Not directly available for Solana
            isFreezable: security.freezable?.status ? security.freezable.status === 'enabled' : undefined,
            isRenounced: security.mintable?.status ? security.mintable.status === 'disabled' : undefined,
            isBlacklist: false, // Not directly available for Solana
        });
    }
}
