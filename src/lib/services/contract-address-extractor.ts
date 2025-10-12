import { getUniqueArray, isSolanaAddress } from "./util/common";

export class ContractAddressExtractor {
    constructor() {
    }

    extractEvmContractAddress(message: string): string[] {
        const regex = /0x[a-fA-F0-9]{40}/g
        const matches = message.match(regex)
        return getUniqueArray(matches ?? [])
    }

    extractSolanaContractAddress(message: string): string[] {
        const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g
        const matches = message.match(regex)
        return getUniqueArray(matches ?? []).filter((address) => isSolanaAddress(address))
    }
}