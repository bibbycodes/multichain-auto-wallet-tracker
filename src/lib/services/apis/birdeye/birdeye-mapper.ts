import { ChainId, getInternallySupportedChainIds } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { TokenData, AutoTrackerTokenDataSource, TokenDataWithMarketCap } from "../../../models/token/types";
import { SocialMedia } from "../../../models/socials/types";
import { BirdeyeChain } from "./client/index";
import { BirdTokenEyeOverview, BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity } from "./client/types";
import { CHAIN_ID_TO_BIRDEYE_CHAIN, BIRDEYE_CHAIN_TO_CHAIN_ID } from "./birdeye-chain-map";

export class BirdeyeMapper {
    static chainIdToChain(chainId: ChainId): BirdeyeChain {
        const chain = CHAIN_ID_TO_BIRDEYE_CHAIN[chainId];
        if (!chain) {
            throw new Error(`Unsupported chain ID: ${chainId}`);
        }
        return chain;
    }

    static chainToChainId(chain: BirdeyeChain): ChainId {
        return BIRDEYE_CHAIN_TO_CHAIN_ID[chain];
    }

    static getSupportedChains(): ChainId[] {
        return (Object.keys(CHAIN_ID_TO_BIRDEYE_CHAIN) as ChainId[])
            .filter(chainId => getInternallySupportedChainIds().includes(chainId));
    }

    /**
     * Static helper functions for extracting data from Birdeye structures
     */
    public static extractPrice(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.price;
    }

    public static extractMarketCap(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.mc ?? tokenOverview.marketCap ?? tokenOverview.fdv;
    }

    public static extractLiquidity(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.liquidity;
    }

    public static extractSupply(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.supply ?? tokenOverview.circulatingSupply ?? tokenOverview.totalSuply;
    }

    public static extractTotalSupply(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.supply ?? tokenOverview.circulatingSupply ?? tokenOverview.totalSuply;
    }

    public static extractDecimals(tokenOverview: BirdTokenEyeOverview): number {
        return tokenOverview.decimals;
    }

    public static extractName(tokenOverview: BirdTokenEyeOverview): string {
        return tokenOverview.name;
    }

    public static extractSymbol(tokenOverview: BirdTokenEyeOverview): string {
        return tokenOverview.symbol;
    }

    public static extractLogoUrl(tokenOverview: BirdTokenEyeOverview): string {
        return tokenOverview.logoURI;
    }

    public static extractDescription(tokenOverview: BirdTokenEyeOverview): string | undefined {
        return tokenOverview.extensions?.description;
    }

    public static extractSocials(tokenOverview: BirdTokenEyeOverview): SocialMedia {
        return {
            twitter: tokenOverview.extensions?.twitter || undefined,
            telegram: tokenOverview.extensions?.telegram || undefined,
            discord: tokenOverview.extensions?.discord || undefined,
            website: tokenOverview.extensions?.website || undefined,
        };
    }

    public static extractCreatedBy(tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity): string | undefined {
        return tokenSecurity.creatorAddress ?? undefined;
    }

    private static buildTokenData(
        address: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): TokenData {
        return {
            address,
            name: this.extractName(tokenOverview),
            symbol: this.extractSymbol(tokenOverview),
            chainId,
            decimals: this.extractDecimals(tokenOverview),
            totalSupply: this.extractTotalSupply(tokenOverview),
            socials: this.extractSocials(tokenOverview),
            pairAddress,
            logoUrl: this.extractLogoUrl(tokenOverview),
            description: this.extractDescription(tokenOverview),
            createdBy: this.extractCreatedBy(tokenSecurity),
            dataSource: AutoTrackerTokenDataSource.BIRDEYE,
        };
    }

    static mapTokenOverviewToTokenDataWithMarketCap(
        tokenAddress: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): TokenDataWithMarketCap {
        const baseData = this.buildTokenData(tokenAddress, chainId, tokenOverview, tokenSecurity, pairAddress);
        return {
            ...baseData,
            marketCap: this.extractMarketCap(tokenOverview),
            price: this.extractPrice(tokenOverview),
            liquidity: this.extractLiquidity(tokenOverview),
        };
    }

    static mapTokenMetadataToTokenData(
        tokenAddress: string,
        chainId: ChainId,
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string
    ): TokenData {
        return this.buildTokenData(tokenAddress, chainId, tokenOverview, tokenSecurity, pairAddress);
    }

    public static mapBirdeyeTokenToAutoTrackerToken(
        tokenOverview: BirdTokenEyeOverview,
        tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity,
        pairAddress: string,
        chainId: ChainId
    ): AutoTrackerToken {
        const tokenData = this.buildTokenData(
            tokenOverview.address,
            chainId,
            tokenOverview,
            tokenSecurity,
            pairAddress
        );

        return new AutoTrackerToken(tokenData);
    }
}