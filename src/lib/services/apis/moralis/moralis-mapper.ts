import { TokenDataSource } from "@prisma/client";
import { ChainId, ChainsMap, getInternallySupportedChainIds } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { TokenData, TokenDataWithMarketCap } from "../../../models/token/types";
import { SocialMedia } from "../../../models/socials/types";
import { MoralisEvmTokenMetaData, MoralisEvmTokenPrice, MoralisSolanaTokenMetadata, MoralisSolanaTokenPairResponseData, MoralisSolanaTokenPrice } from "./types";
import { CHAIN_ID_TO_MORALIS_CHAIN, MORALIS_CHAIN_TO_CHAIN_ID, MoralisChain } from "./moralis-chain-map";

export class MoralisMapper {
    static chainIdToChain(chainId: ChainId): MoralisChain {
        const chain = CHAIN_ID_TO_MORALIS_CHAIN[chainId];
        if (!chain) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }
        return chain;
    }

    static chainToChainId(chain: MoralisChain): ChainId {
        return MORALIS_CHAIN_TO_CHAIN_ID[chain];
    }

    static getSupportedChains(): ChainId[] {
        return (Object.keys(CHAIN_ID_TO_MORALIS_CHAIN) as ChainId[])
            .filter(chainId => getInternallySupportedChainIds().includes(chainId));
    }

    /**
     * Static helper functions for extracting data from Moralis structures
     */
    public static extractEvmSocials(tokenMetadata: MoralisEvmTokenMetaData): SocialMedia {
        return {
            twitter: tokenMetadata.links.twitter,
            telegram: tokenMetadata.links.telegram,
            discord: tokenMetadata.links.discord,
            website: tokenMetadata.links.website,
            reddit: tokenMetadata.links.reddit,
            instagram: tokenMetadata.links.instagram,
        };
    }

    public static extractSolanaSocials(tokenMetadata: MoralisSolanaTokenMetadata): SocialMedia {
        return {
            twitter: tokenMetadata.links.twitter,
            telegram: tokenMetadata.links.telegram,
            discord: tokenMetadata.links.discord,
            website: tokenMetadata.links.website,
            reddit: tokenMetadata.links.reddit,
        };
    }

    public static extractEvmPrice(tokenPrice: MoralisEvmTokenPrice): number {
        return tokenPrice.usdPrice;
    }

    public static extractEvmMarketCap(tokenMetadata: MoralisEvmTokenMetaData): number {
        return Number(tokenMetadata.market_cap);
    }

    public static extractEvmLiquidity(tokenPrice: MoralisEvmTokenPrice): number {
        return Number(tokenPrice.pairTotalLiquidityUsd);
    }

    public static extractSolanaPrice(price: MoralisSolanaTokenPrice): number {
        return price.usdPrice;
    }

    public static extractSolanaMarketCap(tokenMetadata: MoralisSolanaTokenMetadata): number {
        return Number(tokenMetadata.fullyDilutedValue);
    }

    public static extractSolanaLiquidity(pair: MoralisSolanaTokenPairResponseData): number {
        return pair.liquidityUsd;
    }

    private static buildEvmTokenData(
        tokenMetadata: MoralisEvmTokenMetaData,
        tokenPrice: MoralisEvmTokenPrice,
        chainId: ChainId
    ): TokenData {
        return {
            address: tokenMetadata.address,
            chainId,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            decimals: Number(tokenMetadata.decimals),
            totalSupply: Number(tokenMetadata.total_supply_formatted),
            socials: this.extractEvmSocials(tokenMetadata),
            pairAddress: tokenPrice.pairAddress,
            description: tokenMetadata.description,
            logoUrl: tokenMetadata.logo ?? tokenMetadata.thumbnail,
            creationTime: new Date(tokenMetadata.created_at),
            dataSource: TokenDataSource.MORALIS,
        };
    }

    private static buildSolanaTokenData(
        tokenMetadata: MoralisSolanaTokenMetadata,
        pair: MoralisSolanaTokenPairResponseData
    ): TokenData {
        return {
            address: tokenMetadata.mint,
            chainId: ChainsMap.solana,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            decimals: Number(tokenMetadata.decimals),
            totalSupply: Number(tokenMetadata.totalSupplyFormatted),
            socials: this.extractSolanaSocials(tokenMetadata),
            pairAddress: pair.pairAddress,
            description: tokenMetadata.description,
            dataSource: TokenDataSource.MORALIS,
        };
    }

    static mapEvmTokenMetadataToTokenDataWithMarketCap(
        chainId: ChainId,
        tokenMetadata: MoralisEvmTokenMetaData, 
        tokenPrice: MoralisEvmTokenPrice
    ): TokenDataWithMarketCap {
        const baseData = this.buildEvmTokenData(tokenMetadata, tokenPrice, chainId);
        return {
            ...baseData,
            price: this.extractEvmPrice(tokenPrice),
            marketCap: this.extractEvmMarketCap(tokenMetadata),
            liquidity: this.extractEvmLiquidity(tokenPrice),
        };
    }

    static mapSolanaTokenMetadataToTokenDataWithMarketCap(
        tokenMetadata: MoralisSolanaTokenMetadata, 
        price: MoralisSolanaTokenPrice,
        pair: MoralisSolanaTokenPairResponseData
    ): TokenDataWithMarketCap {
        const baseData = this.buildSolanaTokenData(tokenMetadata, pair);
        return {
            ...baseData,
            price: this.extractSolanaPrice(price),
            marketCap: this.extractSolanaMarketCap(tokenMetadata),
            liquidity: this.extractSolanaLiquidity(pair),
        };
    }

    static mapMoralisTokenToAutoTrackerToken(
        moralisToken: MoralisEvmTokenMetaData,
        tokenPrice: MoralisEvmTokenPrice,
        chainId: ChainId
    ): AutoTrackerToken {
        const tokenData = this.buildEvmTokenData(moralisToken, tokenPrice, chainId);
        return new AutoTrackerToken(tokenData);
    }
}
