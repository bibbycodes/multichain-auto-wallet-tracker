import { ChainId } from "../../shared/chains"

export interface ChainConfig {
    chainId: ChainId
    chainName: string
    nativeToken: string
    wrappedNativeTokenAddress: string
    usdcAddress: string
    usdtAddress: string
    burnAddresses?: string[]
    nullAddresses?: string[]
    knownAddresses?: Map<string, string>
    knownLiquidityAddresses?: Map<string, string>
}
