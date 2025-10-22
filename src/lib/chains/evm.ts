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

    /**
     * Check if an address is a pool, liquidity address, or DEX router
     * @param address - The address to check (case-insensitive)
     */
    isPoolOrLiquidityAddress(address: string): boolean {
        const lowerAddress = address.toLowerCase();

        if (!lowerAddress) {
            return false;
        }
        
        // Check if address is in the VALUES of knownLiquidityAddresses map
        const liquidityValues = Array.from(this.knownLiquidityAddresses.values()).map(v => v.toLowerCase());
        if (liquidityValues.includes(lowerAddress)) {
            return true;
        }
        
        // Check if address is in the VALUES of knownAddresses map (includes routers and pools)
        const knownValues = Array.from(this.knownAddresses.values()).map(v => v.toLowerCase());
        if (knownValues.includes(lowerAddress)) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if an address is a burn address (dead address or null address)
     * @param address - The address to check (case-insensitive)
     */
    isBurnAddress(address: string): boolean {
        const lowerAddress = address.toLowerCase();
        
        // Check burn addresses
        if (this.burnAddresses.some((addr: string) => addr.toLowerCase() === lowerAddress)) {
            return true;
        }
        
        // Check null addresses
        if (this.nullAddresses.some((addr: string) => addr.toLowerCase() === lowerAddress)) {
            return true;
        }
        
        return false;
    }
}