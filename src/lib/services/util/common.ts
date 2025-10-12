import { PublicKey } from "@solana/web3.js"

export const getUniqueArray = <T>(array: T[]): T[] => {
    return Array.from(new Set(array))
}

export const isSolanaAddress = (address: string) => {
    try {
        new PublicKey(address)
        return true
    } catch (error) {
        return false
    }
}