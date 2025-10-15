import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { GmGnService } from "../apis/gmgn/gmgn-service";
import { GmGnMapper } from "../apis/gmgn/gmgn-mapper";
import { GmGnTokenDataRawData } from "../apis/gmgn/types";
import { BaseDataSource } from "./base-data-source";

export class GmgnRawDataSource extends BaseDataSource<GmGnTokenDataRawData> {
    constructor(
        tokenAddress: string,
        chainId: ChainId,
        initialData?: Partial<GmGnTokenDataRawData>,
        private gmgnService: GmGnService = GmGnService.getInstance(),
    ) {
        super(tokenAddress, chainId, initialData);
    }

    async collect(): Promise<void> {
        await Promise.allSettled([
            this.getHolders(),
            this.getTokenInfo(),
            this.getGmgnSocials()
        ]);
    }

    async getHolders(): Promise<GmGnTokenHolder[] | null> {
        return this.getOrFetch(
            'holders',
            () => this.gmgnService.getHolders(this.tokenAddress, this.chainId)
        );
    }

    async getTokenInfo(): Promise<GmGnMultiWindowTokenInfo | null> {
        return this.getOrFetch(
            'tokenInfo',
            () => this.gmgnService.getMultiWindowTokenInfo(this.tokenAddress, this.chainId)
        );
    }

    async getGmgnSocials(): Promise<GmGnTokenSocials | null> {
        return this.getOrFetch(
            'socials',
            () => this.gmgnService.getTokenSocials(this.tokenAddress, this.chainId)
        );
    }

    async getSocials(): Promise<SocialMedia | null> {
        const gmgnSocials = await this.getGmgnSocials();
        if (!gmgnSocials) {
            return null;
        }
        return GmGnMapper.extractSocials(gmgnSocials);
    }

    async getPrice(): Promise<number | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractPrice(tokenInfo);
    }

    async getMarketCap(): Promise<number | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractMarketCap(tokenInfo);
    }

    async getLiquidity(): Promise<number | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractLiquidity(tokenInfo);
    }

    async getSupply(): Promise<number | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractSupply(tokenInfo);
    }

    async getDecimals(): Promise<number | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractDecimals(tokenInfo);
    }

    async getName(): Promise<string | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractName(tokenInfo);
    }

    async getSymbol(): Promise<string | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractSymbol(tokenInfo);
    }

    async getLogoUrl(): Promise<string | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractLogoUrl(tokenInfo);
    }

    async getDescription(): Promise<string | null> {
        const gmgnSocials = await this.getGmgnSocials();
        if (!gmgnSocials) {
            return null;
        }
        return GmGnMapper.extractDescription(gmgnSocials) ?? null;
    }

    async getCreatedBy(): Promise<string | null> {
        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            return null;
        }
        return GmGnMapper.extractCreatedBy(tokenInfo);
    }
}
