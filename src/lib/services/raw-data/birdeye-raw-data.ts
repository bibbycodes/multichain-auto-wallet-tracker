import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { BirdEyeFetcherService } from "../apis/birdeye/birdeye-service";
import { BirdeyeMapper } from "../apis/birdeye/birdeye-mapper";
import { BirdeyeEvmTokenSecurity, BirdeyeSolanaTokenSecurity, BirdTokenEyeOverview, MarketsData } from "../apis/birdeye/client/types";
import { BirdEyeTokenDataRawData } from "../apis/birdeye/types";
import { BaseDataSource } from "./base-data-source";

export class BirdeyeRawTokenData extends BaseDataSource<BirdEyeTokenDataRawData> {
    constructor(
        tokenAddress: string,
        chainId: ChainId,
        initialData?: Partial<BirdEyeTokenDataRawData>,
        private birdeyeService: BirdEyeFetcherService = BirdEyeFetcherService.getInstance(),
    ) {
        super(tokenAddress, chainId, initialData);  
    }

    async collect(): Promise<void> {
        await Promise.allSettled([
            this.getTokenSecurity(),
            this.getTokenOverview(),
            this.getMarkets()
        ]);
    }

    async getTokenSecurity(): Promise<BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity | null> {
        return this.getOrFetch(
            'tokenSecurity',
            () => this.birdeyeService.getTokenSecurity(this.tokenAddress, this.chainId)
        );
    }

    async getMarkets(): Promise<MarketsData | null> {
        return this.getOrFetch(
            'markets',
            () => this.birdeyeService.getMarkets(this.tokenAddress, this.chainId)
        );
    }

    async getTokenOverview(): Promise<BirdTokenEyeOverview | null> {
        return this.getOrFetch(
            'tokenOverview',
            () => this.birdeyeService.getTokenOverview(this.tokenAddress, this.chainId)
        );
    }

    // Convenience methods for common data access
    async getPrice(): Promise<number | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractPrice(tokenOverview);
    }

    async getMarketCap(): Promise<number | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractMarketCap(tokenOverview);
    }

    async getLiquidity(): Promise<number | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractLiquidity(tokenOverview);
    }

    async getSupply(): Promise<number | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractSupply(tokenOverview);
    }

    async getDecimals(): Promise<number | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractDecimals(tokenOverview);
    }

    async getName(): Promise<string | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractName(tokenOverview);
    }

    async getSymbol(): Promise<string | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractSymbol(tokenOverview);
    }

    async getLogoUrl(): Promise<string | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractLogoUrl(tokenOverview);
    }

    async getDescription(): Promise<string | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractDescription(tokenOverview) ?? null;
    }

    async getSocials(): Promise<SocialMedia | null> {
        const tokenOverview = await this.getTokenOverview();
        if (!tokenOverview) {
            return null;
        }
        return BirdeyeMapper.extractSocials(tokenOverview);
    }

    async getCreatedBy(): Promise<string | null> {
        const tokenSecurity = await this.getTokenSecurity();
        if (!tokenSecurity) {
            return null;
        }
        return BirdeyeMapper.extractCreatedBy(tokenSecurity) ?? null;
    }
}
