import { AutoTrackerToken } from "../../../models/token";
import { TokenSecurity } from "../../../models/token/types";
import { RawTokenDataCache } from "../../raw-data/raw-data";
import { TokenSecurityBuilder } from "../../token-security-builder/token-security-builder";

export class TokenSecurityContext {
    private tokenSecurityBuilder: TokenSecurityBuilder
    constructor(
        private rawData: RawTokenDataCache,
        private readonly token: AutoTrackerToken,
    ) {
        this.tokenSecurityBuilder = new TokenSecurityBuilder(this.token.address, this.token.chainId, this.rawData)
    }

    async getTokenSecurity(): Promise<TokenSecurity> {
        return await this.tokenSecurityBuilder.getTokenSecurity()
    }
}