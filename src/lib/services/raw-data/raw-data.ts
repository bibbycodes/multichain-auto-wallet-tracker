import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { BirdEyeTokenDataRawData } from "../apis/birdeye/types";
import { ChainBaseTokenDataRawData } from "../apis/chain-base/types";
import { GmGnTokenDataRawData } from "../apis/gmgn/types";
import { BirdeyeRawTokenData } from "./birdeye-raw-data";
import { ChainBaseRawData } from "./chain-base-raw-data";
import { GmgnRawDataSource } from "./gmgn-raw-data";
import { RawDataInput } from "./types";

export class RawTokenDataCache {
    public readonly birdeye: BirdeyeRawTokenData;
    public readonly gmgn: GmgnRawDataSource;
    public readonly chainBase: ChainBaseRawData;
    public readonly chainId: ChainId;
    public readonly tokenAddress: string;

    constructor(
        tokenAddress: string,
        chainId: ChainId,
        data?: RawDataInput,
    ) {
        this.birdeye = new BirdeyeRawTokenData(tokenAddress, chainId, data?.birdeye);
        this.gmgn = new GmgnRawDataSource(tokenAddress, chainId, data?.gmgn);
        this.chainBase = new ChainBaseRawData(tokenAddress, chainId, data?.chainBase);
        this.chainId = chainId;
        this.tokenAddress = tokenAddress;
    }

    async collect(): Promise<void> {
        await Promise.allSettled([
            this.birdeye.collect(),
            this.gmgn.collect(),
            this.chainBase.collect()
        ]);
    }

    /**
     * Helper method to fetch from multiple sources with fallback
     * @param birdeyeFetcher - Function to fetch from Birdeye
     * @param gmgnFetcher - Function to fetch from GMGN
     * @param errorMessage - Optional error message. If provided, throws on failure. If not, returns null.
     */
    private async getFromSources<T>(
        birdeyeFetcher: () => Promise<T | null>,
        gmgnFetcher: () => Promise<T | null>,
        errorMessage?: string
    ): Promise<T | null> {
        const birdeyeResult = await birdeyeFetcher();
        if (birdeyeResult !== null) {
            return birdeyeResult;
        }
        
        const gmgnResult = await gmgnFetcher();
        if (gmgnResult !== null) {
            return gmgnResult;
        }

        if (errorMessage) {
            throw new Error(errorMessage);
        }
        
        return null;
    }

    async getTokenPrice(): Promise<number> {
        return this.getFromSources(
            () => this.birdeye.getPrice(),
            () => this.gmgn.getPrice(),
            'Price is not available'
        ) as Promise<number>;
    }

    async getTokenMarketCap(): Promise<number> {
        return this.getFromSources(
            () => this.birdeye.getMarketCap(),
            () => this.gmgn.getMarketCap(),
            'Market cap is not available'
        ) as Promise<number>;
    }

    async getTokenLiquidity(): Promise<number> {
        return this.getFromSources(
            () => this.birdeye.getLiquidity(),
            () => this.gmgn.getLiquidity(),
            'Liquidity is not available'
        ) as Promise<number>;
    }

    async getTokenSupply(): Promise<number | null> {    
        return this.getFromSources(
            () => this.birdeye.getSupply(),
            () => this.gmgn.getSupply(),
            'Supply is not available'
        ) as Promise<number>;
    }

    async getTokenDecimals(): Promise<number | null> {
        return this.getFromSources(
            () => this.birdeye.getDecimals(),
            () => this.gmgn.getDecimals(),
            'Decimals is not available'
        ) as Promise<number>;
    }

    async getTokenName(): Promise<string | null> {
        return this.getFromSources(
            () => this.birdeye.getName(),
            () => this.gmgn.getName(),
            'Name is not available'
        ) as Promise<string>;
    }

    async getTokenSymbol(): Promise<string | null> {
        return this.getFromSources(
            () => this.birdeye.getSymbol(),
            () => this.gmgn.getSymbol(),
            'Symbol is not available'
        ) as Promise<string>;
    }

    async getTokenLogoUrl(): Promise<string | null> {
        return this.getFromSources(
            () => this.birdeye.getLogoUrl(),
            () => this.gmgn.getLogoUrl()
        );
    }

    async getTokenDescription(): Promise<string | null> {
        return this.getFromSources(
            () => this.birdeye.getDescription(),
            () => this.gmgn.getDescription()
        );
    }

    async getTokenSocials(): Promise<SocialMedia | null> {
        return this.getFromSources(
            () => this.birdeye.getSocials(),
            () => this.gmgn.getSocials()
        );
    }

    async getTokenCreatedBy(): Promise<string | null> {
        return this.getFromSources(
            () => this.birdeye.getCreatedBy(),
            () => this.gmgn.getCreatedBy()
        );
    }

    public toJson(): string {
        return JSON.stringify(this.toObject());
    }

    public toObject(): RawDataInput {
        return {
            birdeye: this.birdeye.toObject(),
            gmgn: this.gmgn.toObject(),
            chainBase: this.chainBase.toObject(),
        };
    }

    public updateBirdeyeData(data: Partial<BirdEyeTokenDataRawData>): void {
        this.birdeye.updateData(data);
    }

    public updateGmgnData(data: Partial<GmGnTokenDataRawData>): void {
        this.gmgn.updateData(data);
    }

    public updateChainBaseData(data: Partial<ChainBaseTokenDataRawData>): void {
        this.chainBase.updateData(data);
    }
}