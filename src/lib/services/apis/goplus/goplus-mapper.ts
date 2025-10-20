import { GoPlusTokenSecurity, GoPlusSolanaTokenSecurity } from "python-proxy-scraper-client";
import { TokenSecurity } from "../../../models/token/types";
import { MIN_BURN_RATIO } from "../../../../shared/constants";

export class GoPlusMapper {
    /**
     * Extract TokenSecurity from GoPlus EVM token security data
     */
    public static extractTokenSecurityFromEvm(security: GoPlusTokenSecurity): TokenSecurity {
        return this.mapGoPlusTokenSecurityToTokenSecurity(security);
    }

    /**
     * Extract TokenSecurity from GoPlus Solana token security data
     */
    public static extractTokenSecurityFromSolana(security: GoPlusSolanaTokenSecurity): TokenSecurity {
        return this.mapGoPlusSolanaTokenSecurityToTokenSecurity(security);
    }

    /**
     * Map GoPlus EVM token security to TokenSecurity model
     */
    private static mapGoPlusTokenSecurityToTokenSecurity(security: GoPlusTokenSecurity): TokenSecurity {
        // Calculate if LP token is burned (>90% locked)
        const lpHolders = security.lp_holders || [];
        const lockedLpHolders = lpHolders.filter(holder => Boolean(holder.is_locked));
        const lockedRatio = lockedLpHolders.reduce((acc, holder) => acc + Number(holder.percent), 0);

        // Check if owner is renounced (owner_address is null or zero address)
        const isRenounced = !security.owner_address ||
                          security.owner_address === '0x0000000000000000000000000000000000000000';

        return {
            isHoneypot: this.parseStringBoolean(security.is_honeypot),
            isMintable: this.parseStringBoolean(security.is_mintable),
            isLpTokenBurned: lockedRatio > MIN_BURN_RATIO,
            isPausable: this.parseStringBoolean(security.transfer_pausable),
            isFreezable: this.parseStringBoolean(security.transfer_pausable),
            isRenounced,
            buyTax: this.parseStringNumber(security.buy_tax),
            sellTax: this.parseStringNumber(security.sell_tax),
            transferTax: this.parseStringNumber(security.transfer_tax),
            isBlacklist: this.parseStringBoolean(security.is_blacklisted),
        };
    }

    /**
     * Map GoPlus Solana token security to TokenSecurity model
     */
    private static mapGoPlusSolanaTokenSecurityToTokenSecurity(security: GoPlusSolanaTokenSecurity): TokenSecurity {
        // For Solana, check if mint authority exists
        const isMintable = security.mintable?.status === 'enabled';
        const isFreezable = security.freezable?.status === 'enabled';

        return {
            isHoneypot: false, // Solana doesn't have a direct honeypot indicator
            isMintable,
            isLpTokenBurned: false, // Solana LP data needs different calculation
            isPausable: false, // Not directly available for Solana
            isFreezable,
            isRenounced: security.mintable?.status === 'disabled', // If mint authority is disabled, consider it renounced
            buyTax: undefined,
            sellTax: undefined,
            transferTax: undefined,
            isBlacklist: false, // Not directly available for Solana
        };
    }

    /**
     * Helper to parse GoPlus string boolean values ("0" or "1")
     */
    private static parseStringBoolean(value: string | undefined): boolean {
        if (!value) return false;
        return value === "1" || value.toLowerCase() === "true";
    }

    /**
     * Helper to parse GoPlus string number values
     */
    private static parseStringNumber(value: string | undefined): number | undefined {
        if (!value) return undefined;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
    }
}
