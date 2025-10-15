import { ChainId } from "../../shared/chains"
import { ChainConfig } from "./types"

export class EvmChain {
    public readonly burnAddresses: string[]
    public readonly nullAddresses: string[]
    public readonly chainId: ChainId
    public readonly chainName: string
    public readonly nativeToken: string
    public readonly wrappedNativeTokenAddress: string
    public readonly usdcAddress: string
    public readonly usdtAddress: string
    public readonly knownAddresses: Map<string, string>
    public readonly knownLiquidityAddresses: Map<string, string>
    constructor(config: ChainConfig) {
        this.chainId = config.chainId
        this.chainName = config.chainName
        this.nativeToken = config.nativeToken
        this.wrappedNativeTokenAddress = config.wrappedNativeTokenAddress
        this.usdcAddress = config.usdcAddress
        this.usdtAddress = config.usdtAddress
        this.burnAddresses = config.burnAddresses || ['0x000000000000000000000000000000000000dead']
        this.nullAddresses = config.nullAddresses || ['0x0000000000000000000000000000000000000000']
        this.knownAddresses = config.knownAddresses || new Map()
        this.knownLiquidityAddresses = config.knownLiquidityAddresses || new Map()
    }

    isNativeToken(tokenAddress: string): boolean {
        return tokenAddress === this.wrappedNativeTokenAddress
    }

    isQuoteToken(tokenAddress: string): boolean {
        return tokenAddress === this.usdcAddress || tokenAddress === this.usdtAddress || this.isNativeToken(tokenAddress)
    }

    isKnownAddress(address: string): boolean {
        return this.knownAddresses.has(address)
    }   

    isKnownLiquidityAddress(address: string): boolean {
        return this.knownLiquidityAddresses.has(address)
    }
}