import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { GeckoTerminalService } from "../apis/gecko-terminal/gecko-terminal-service";
import { GeckoTerminalMapper } from "../apis/gecko-terminal/gecko-terminal-mapper";
import { GeckoTerminalTokenDetails, Pool } from "python-proxy-scraper-client";
import { GeckoTerminaTokenDataRawData } from "../apis/gecko-terminal/types";
import { BaseDataSource } from "./base-data-source";
import { TokenDataSource } from "@prisma/client";

export class GeckoTerminalRawData extends BaseDataSource<GeckoTerminaTokenDataRawData> {
    constructor(
        tokenAddress: string,
        chainId: ChainId,
        initialData?: Partial<GeckoTerminaTokenDataRawData>,
        private geckoTerminalService: GeckoTerminalService = GeckoTerminalService.getInstance(),
    ) {
        super(tokenAddress, chainId, initialData);
    }

    protected getDataSourceName(): string {
        return TokenDataSource.GECKO_TERMINAL.toLowerCase();
    }

    async collect(): Promise<void> {
        await Promise.allSettled([
            this.getTokenDetails(),
            this.getTokenPools()
        ]);
    }

    async getTokenDetails(): Promise<GeckoTerminalTokenDetails | null> {
        return this.getOrFetch(
            'tokenDetails',
            () => this.geckoTerminalService.getTokenDetails(this.tokenAddress, this.chainId)
        );
    }

    async getTokenPools(): Promise<Pool[] | null> {
        return this.getOrFetch(
            'tokenPools',
            () => this.geckoTerminalService.getTokenPools(this.tokenAddress, this.chainId)
        );
    }

    // Convenience methods for common data access
    async getPrice(): Promise<number | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractPrice(tokenDetails);
    }

    async getMarketCap(): Promise<number | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractMarketCap(tokenDetails);
    }

    async getLiquidity(): Promise<number | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractLiquidity(tokenDetails);
    }

    async getSupply(): Promise<number | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractSupply(tokenDetails);
    }

    async getDecimals(): Promise<number | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractDecimals(tokenDetails);
    }

    async getName(): Promise<string | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractName(tokenDetails);
    }

    async getSymbol(): Promise<string | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractSymbol(tokenDetails);
    }

    async getLogoUrl(): Promise<string | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractLogoUrl(tokenDetails);
    }

    async getDescription(): Promise<string | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractDescription(tokenDetails);
    }

    async getSocials(): Promise<SocialMedia | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractSocials(tokenDetails);
    }

    async getCreatedBy(): Promise<string | null> {
        const tokenDetails = await this.getTokenDetails();
        if (!tokenDetails) {
            return null;
        }
        return GeckoTerminalMapper.extractCreatedBy(tokenDetails);
    }

    async getPairAddress(): Promise<string | null> {
        const tokenPools = await this.getTokenPools();
        if (!tokenPools) {
            return null;
        }
        return GeckoTerminalMapper.extractPairAddress(tokenPools);
    }

    getRawData(): GeckoTerminaTokenDataRawData {
        return {
            tokenDetails: this.data.tokenDetails!,
            tokenPools: this.data.tokenPools!
        };
    }
}
