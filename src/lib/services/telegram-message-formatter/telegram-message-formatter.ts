import { BaseContextData } from "../token-context/types";
import { formatHolder, formatLines, formatMarketCap, formatPercentage, formatStringWithSeparatorAndNoSpaces, formatTreeList, getBasicChecksString, normaliseSymbol } from "./formatters";
import { generateBirdeyeUrl, generateExplorerUrl, generateGmgnUrl, getPhotonLink, linkify } from "./utils";

export class TelegramMessageFormatter {
    constructor(
        private baseContext: BaseContextData,
    ) {
    }

    getTokenBotLinksString(): string {
        const links = [
            linkify(getPhotonLink(this.baseContext.token.address), 'PH'),
            linkify(generateBirdeyeUrl(this.baseContext.token.address, this.baseContext.token.chainId), 'BD'),
            linkify(generateGmgnUrl(this.baseContext.token.address, this.baseContext.token.chainId), 'GM'),
            linkify(generateExplorerUrl(this.baseContext.token.address, this.baseContext.token.chainId), 'EX'),
        ]
        return formatStringWithSeparatorAndNoSpaces(links, '·')
    }

    getAlertHeader(): string {
        return `${normaliseSymbol(this.baseContext.token.symbol)}: ${formatMarketCap(this.baseContext.priceDetails.marketCap)} 🚨 \n${this.getTokenBotLinksString()}`
    }

    getTopHoldersString(): string {
        const topHolders = this.baseContext.tokenDistribution.tokenHolders.slice(0, 10)
        if (topHolders.length === 0) {
            return ''
        }
        return formatTreeList('👑 Top Holders:', this.baseContext.tokenDistribution.tokenHolders.slice(0, 10).map(holder => formatHolder(holder)))
    }

    getBasicChecksString(): string {
        return getBasicChecksString(
            this.baseContext.tokenSecurity.isRenounced, 
            this.baseContext.tokenSecurity.isLpTokenBurned
        )
    }

    getAlertMessage(): string {
        const elements = [
            this.getAlertHeader(),
            this.getTopHoldersString(),
            this.getBasicChecksString(),
        ]
        return formatLines(elements)
    }
}