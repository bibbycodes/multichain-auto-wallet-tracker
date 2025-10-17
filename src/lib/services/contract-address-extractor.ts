import { getUniqueArray, isSolanaAddress } from "./util/common";

export class ContractAddressExtractor {
    constructor() {
    }

    static extractEvmContractAddress(message: string): string[] {
        const regex = /0x[a-fA-F0-9]{40}/g
        const matches = message.match(regex)
        return getUniqueArray(matches ?? [])
    }

    static extractSolanaContractAddress(message: string): string[] {
        const regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g
        const matches = message.match(regex)
        return getUniqueArray(matches ?? []).filter((address) => isSolanaAddress(address))
    }

    static extractAllContractAddresses(message: string): { evm: string[], solana: string[] } {
        return {
            evm: this.extractEvmContractAddress(message),
            solana: this.extractSolanaContractAddress(message),
        }
    }
}