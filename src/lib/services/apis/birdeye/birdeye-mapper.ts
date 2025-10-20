import { TokenDataSource } from "@prisma/client";
import { ChainId, getInternallySupportedChainIds } from "../../../../shared/chains";
import { AutoTrackerToken } from "../../../models/token";
import { AutoTrackerTokenData, TokenDataWithMarketCap, TokenSecurity } from "../../../models/token/types";
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
    ): AutoTrackerTokenData {
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
            dataSource: TokenDataSource.BIRDEYE,
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
    ): AutoTrackerTokenData {
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

    public static isHoneypot(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        return Boolean(parseInt(tokenSecurity.isHoneypot)) ||
               Boolean(parseInt(tokenSecurity.cannotSellAll)) ||
               Boolean(parseInt(tokenSecurity.honeypotWithSameCreator));
    }

    public static isMintable(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        return Boolean(parseInt(tokenSecurity.isMintable));
    }

    public static isLpBurned(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        const lpHolders = tokenSecurity.lpHolders || [];
        const lockedLpHolders = lpHolders.filter(lpHolder => Boolean(lpHolder.is_locked));
        const lockedRatio = lockedLpHolders.reduce((acc: number, lpHolder: any) => acc + Number(lpHolder.percent), 0);
        return lockedRatio > 0.9;
    }

    public static isPausable(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        return Boolean(parseInt(tokenSecurity.transferPausable));
    }

    public static isFreezable(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        return Boolean(parseInt(tokenSecurity.transferPausable));
    }

    public static isRenounced(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        return tokenSecurity.ownerAddress === null ||
               tokenSecurity.ownerAddress === '0x0000000000000000000000000000000000000000';
    }

    public static extractBuyTax(tokenSecurity: BirdeyeEvmTokenSecurity): number {
        return Number(tokenSecurity.buyTax);
    }

    public static extractSellTax(tokenSecurity: BirdeyeEvmTokenSecurity): number {
        return Number(tokenSecurity.sellTax);
    }

    public static isBlacklisted(tokenSecurity: BirdeyeEvmTokenSecurity): boolean {
        if (typeof tokenSecurity.isBlacklisted === 'boolean') {
            return tokenSecurity.isBlacklisted;
        }
        return Boolean(parseInt(tokenSecurity.isBlacklisted));
    }

    /**
     * Extract TokenSecurity from Birdeye EVM token security data
     */
    // TODO, use chain specific burn addresses
    public static extractTokenSecurityFromEvm(tokenSecurity: BirdeyeEvmTokenSecurity): TokenSecurity {
        return {
            isHoneypot: this.isHoneypot(tokenSecurity),
            isMintable: this.isMintable(tokenSecurity),
            isLpTokenBurned: this.isLpBurned(tokenSecurity),
            isPausable: this.isPausable(tokenSecurity),
            isFreezable: this.isFreezable(tokenSecurity),
            isRenounced: this.isRenounced(tokenSecurity),
            buyTax: this.extractBuyTax(tokenSecurity),
            sellTax: this.extractSellTax(tokenSecurity),
            isBlacklist: this.isBlacklisted(tokenSecurity),
        };
    }

    /**
     * Extract TokenSecurity from Birdeye Solana token security data
     */
    public static extractTokenSecurityFromSolana(tokenSecurity: BirdeyeSolanaTokenSecurity): TokenSecurity {
        // For Solana, check if freeze authority exists
        const isFreezable = tokenSecurity.freezeAuthority !== null;
        const isRenounced = tokenSecurity.ownerAddress === null;

        // Check for transfer fees (Token 2022 feature)
        const hasTransferFee = tokenSecurity.transferFeeEnable || false;

        return {
            isHoneypot: tokenSecurity.fakeToken !== null || tokenSecurity.isTrueToken === false,
            isMintable: false, // Birdeye Solana data doesn't expose mint authority directly
            isLpTokenBurned: false, // Solana LP data needs different calculation
            isPausable: false, // Not directly available for Solana
            isFreezable: isFreezable || tokenSecurity.freezeable || false,
            isRenounced,
            buyTax: undefined,
            sellTax: undefined,
            transferFee: hasTransferFee ? undefined : undefined, // Would need to parse transferFeeData
            transferFeeUpgradeable: tokenSecurity.isToken2022 && hasTransferFee,
            isBlacklist: false,
        };
    }

    /**
     * Extract TokenSecurity from Birdeye token security data (handles both EVM and Solana)
     */
    public static extractTokenSecurity(tokenSecurity: BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity): TokenSecurity {
        // Check if it's EVM security data by checking for EVM-specific fields
        if ('isHoneypot' in tokenSecurity) {
            return this.extractTokenSecurityFromEvm(tokenSecurity as BirdeyeEvmTokenSecurity);
        } else {
            return this.extractTokenSecurityFromSolana(tokenSecurity as BirdeyeSolanaTokenSecurity);
        }
    }
}