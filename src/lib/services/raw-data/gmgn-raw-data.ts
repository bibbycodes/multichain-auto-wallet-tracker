import { GmGnMultiWindowTokenInfo, GmGnTokenHolder, GmGnTokenSecurityAndLaunchpad, GmGnTokenSocials } from "python-proxy-scraper-client";
import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { GmGnService } from "../apis/gmgn/gmgn-service";
import { GmGnMapper } from "../apis/gmgn/gmgn-mapper";
import { GmGnTokenDataRawData } from "../apis/gmgn/types";
import { BaseDataSource } from "./base-data-source";
import { TokenDataSource } from "@prisma/client";

export class GmgnRawDataSource extends BaseDataSource<GmGnTokenDataRawData> {
    constructor(
        tokenAddress: string,
        chainId: ChainId,
        initialData?: Partial<GmGnTokenDataRawData>,
        private gmgnService: GmGnService = GmGnService.getInstance(),
    ) {
        super(tokenAddress, chainId, initialData);
    }

    protected getDataSourceName(): string {
        return TokenDataSource.GMGN.toLowerCase();
    }

    async collect(): Promise<void> {
        await Promise.allSettled([
            this.getHolders(),
            this.getTokenInfo(),
            this.getGmgnSocials()
        ]);
    }

    async getTokenSecurityAndLaunchpad(): Promise<GmGnTokenSecurityAndLaunchpad | null> {
        return this.getOrFetch(
            'tokenSecurityAndLaunchpad',
            () => this.gmgnService.getTokenSecurityAndLaunchpad(this.tokenAddress, this.chainId)
        );
    }

    async getHolders(): Promise<GmGnTokenHolder[] | null> {
        return this.getOrFetch(
            'holders',
            () => this.gmgnService.getHolders(this.tokenAddress, this.chainId)
        );
    }

    async getTokenInfo(): Promise<GmGnMultiWindowTokenInfo | null> {
        const validator = (data: GmGnMultiWindowTokenInfo) => {
            const hasCorrectAddress = data.address === this.tokenAddress;
            const hasCorrectDecimals = data.decimals !== 0;
            return hasCorrectAddress && hasCorrectDecimals;
        }
        return this.getOrFetch(
            'tokenInfo',
            () => this.gmgnService.getMultiWindowTokenInfo(this.tokenAddress, this.chainId),
            validator
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
