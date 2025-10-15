import { TokenHolder } from "../token-context/token-distribution/types"
import { getTwitterHandleUrl, linkify } from "./utils"

export const formatStringWithSeparatorAndNoSpaces = (data: string[], separator: string = '|') => {
    return data.filter(Boolean).join(separator)
}

export const formatLines = (lines: (string | null | undefined)[]): string => {
    return lines.filter(Boolean).join('\n\n')
}

export const normaliseSymbol = (symbol: string): string => {
    if (symbol.startsWith('$')) {
        return symbol.trim().toUpperCase()
    }
    return `$${symbol}`.trim().toUpperCase()
}

export const concatenateAddress = (address: string, leftPadding: number = 4, rightPadding: number = 3): string => {
    return `${address.slice(0, leftPadding)}...${address.slice(-rightPadding)}`
}

export const formatHolder = (holder: TokenHolder): string => {
    const concatenatedAddress = concatenateAddress(holder.address)
    if (holder.isCreator) { 
        return `${concatenatedAddress} - ${formatPercentage(holder.percentage)} 🧑‍💻`
    }
    if (holder.isPool) {
        return `${concatenatedAddress} - ${formatPercentage(holder.percentage)} 💧`
    }
    if (holder.isKOL && holder.socials?.twitter) {
        const holderString = `${concatenatedAddress} - ${formatPercentage(holder.percentage)} 🌟`
        return `${linkify(getTwitterHandleUrl(holder.socials.twitter), holderString)}`
    }
    if (holder.isWhale) {
        return `${concatenatedAddress} - ${formatPercentage(holder.percentage)} 🐳`
    }
    return `${concatenatedAddress} - ${formatPercentage(holder.percentage)}`
}

export const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`
}

export const formatTreeList = (header: string, values: string[]): string => {
    if (values.length === 0) {
        return header
    }
    
    const lines = values.map((value, index) => {
        const prefix = index === values.length - 1 ? '└' : '├'
        return `  ${prefix} ${value}`
    })
    
    return `${header}\n${lines.join('\n')}`
}

export const getBasicChecksString = (isMintRenounced: boolean, isFreezeRenounced: boolean, isBurned: boolean) => {
    return formatTreeList('🔒 Basic Checks:', [
        `${isMintRenounced ? '✅' : '❌'} Mint Renounced`,
        `${isFreezeRenounced ? '✅' : '❌'} Freeze Renounced`,
        `${isBurned ? '✅' : '❌'} LP Burned`
    ])
}

export const formatDollarValue = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    }).format(value)
}

export const formatMarketCap = (marketCap: number): string => {
    return formatDollarValue(marketCap)
}