import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../socials/types";

export enum AutoTrackerTokenDataSource {
    BIRDEYE = "birdeye",
    GMGN = "gmgn",
    MORALIS = "moralis",
}

export interface TokenData {
    id?: string;
    address: string;
    name: string;
    symbol: string;
    chainId: ChainId
    decimals: number;
    totalSupply: number;
    socials: SocialMedia;
    pairAddress: string;
    logoUrl?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    creationTime?: Date;
    dataSource: AutoTrackerTokenDataSource;
}

export type TokenDataWithMarketCap = TokenData & TokenPriceDetails

export interface TokenDataWithMarketCapAndRawData<T> {
    token: TokenDataWithMarketCap
    rawData: T
}

export interface TokenPriceDetails {
    price: number;
    marketCap: number;
    liquidity: number;
}

export interface VolumeDetails {
    volume: number;
    volumeChange: number;
    volume5m: number;
    volume5mChange: number;
    volume1h: number;
    volume1hChange: number;
    volume6h: number;
    volume6hChange: number;
    volume12h: number;
    volume12hChange: number;
    volume24h: number;
    volume24hChange: number;
    volume7d: number;
    volume7dChange: number;
}

export interface TokenHolderDistribution {
    numberOfHolders: number;
    top10Percentage: number;
    whales: string[];
    devPercentage: number;
    poolPercentage: number;
    bundles: Bundle[];
    topHolders: string[];
}

export interface TokenSecurity {
    isHoneypot: boolean; // Can the token be frozon
    isMintable: boolean; // Can the token be minted
    isLpTokenBurned: boolean; // Is the LP token burned
    isPausable: boolean; // Can the token be paused
    isFreezable: boolean; // Can the token be freezed
    isRenounced: boolean; // is token ownership renounced
    buyTax?: number;
    sellTax?: number;
    transferTax?: number;
    transferFee?: number;
    transferFeeUpgradeable?: boolean;
    isBlacklist?: boolean;
}

export interface Bundle {
    sourceWallet: string
    destinationWallets: string[]
    amount: number
    percentageOfSupply: number
}

export interface TokenAnalysis {
    distribution: TokenHolderDistribution;
    security: TokenSecurity;
}