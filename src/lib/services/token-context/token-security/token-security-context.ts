import { isEvmChainId } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { TokenSecurity } from "../../../models/token/types";
import { RawTokenDataCache } from "../../raw-data/raw-data";
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from "../../apis/birdeye/client/types";

export class TokenSecurityContext {
    public tokenSecurity: TokenSecurity = {
        isHoneypot: false,
        isMintable: false,
        isLpTokenBurned: false,
        isPausable: false,
        isFreezable: false,
        isRenounced: false,
    }
    constructor(
        private rawData: RawTokenDataCache,
        private readonly token: AutoTrackerToken,
    ) {
    }

    async getBirdeyeTokenSecurity(): Promise<BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity | null> {
        return await this.rawData.birdeye.getTokenSecurity()
    }

    async getEvmTokenSecurity(): Promise<BirdeyeEvmTokenSecurity | null> {
        const birdeyeTokenSecurity = await this.getBirdeyeTokenSecurity()
        if (!birdeyeTokenSecurity) {
            return null
        }
        return birdeyeTokenSecurity as BirdeyeEvmTokenSecurity
    }

    async getTokenSecurity(): Promise<TokenSecurity> {
        if (!isEvmChainId(this.token.chainId)) {
            throw new Error("Chain not supported")
        }
        this.tokenSecurity = {
            isHoneypot: await this.getIsHoneypot(),
            isMintable: await this.getIsMintable(),
            isLpTokenBurned: await this.getIsLpTokenBurned(),
            isPausable: await this.getIsPausable(),
            isFreezable: await this.getIsFreezable(),
            buyTax: await this.getBuyTax(),
            sellTax: await this.getSellTax(),
            isBlacklist: await this.getIsBlacklist(),
            isRenounced: await this.getIsRenounced(),
        }
        return this.tokenSecurity
    }

    async getIsHoneypot(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(parseInt(birdeyeEvmTokenSecurity.isHoneypot)) || Boolean(parseInt(birdeyeEvmTokenSecurity.cannotSellAll)) || Boolean(parseInt(birdeyeEvmTokenSecurity.honeypotWithSameCreator))
    }

    async getIsCannotSellAll(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(parseInt(birdeyeEvmTokenSecurity.cannotSellAll))
    }

    async getIsMintable(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(parseInt(birdeyeEvmTokenSecurity.isMintable))
    }

    async getIsPausable(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(parseInt(birdeyeEvmTokenSecurity.transferPausable))
    }

    async getIsFreezable(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(parseInt(birdeyeEvmTokenSecurity.transferPausable))
    }

    async getIsLpTokenBurned(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        const lockedLpHolders = birdeyeEvmTokenSecurity.lpHolders?.filter(lpHolder => Boolean(lpHolder.is_locked)) || []
        const lockedRatio = lockedLpHolders.reduce((acc, lpHolder) => acc + Number(lpHolder.percent), 0)
        return lockedRatio > 0.9
    }

    async getBuyTax(): Promise<number> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return 0
        }
        return Number(birdeyeEvmTokenSecurity.buyTax)
    }

    async getSellTax(): Promise<number> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return 0
        }
        return Number(birdeyeEvmTokenSecurity.sellTax)
    }

    async getIsBlacklist(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(birdeyeEvmTokenSecurity.isBlacklisted)
    }

    async getIsRenounced(): Promise<boolean> {
        const birdeyeEvmTokenSecurity = await this.getEvmTokenSecurity()
        if (!birdeyeEvmTokenSecurity) {
            return false
        }
        return Boolean(birdeyeEvmTokenSecurity.ownerAddress === null)
    }
}