import { ChainId } from "../../../shared/chains";
import { GoPlusService } from "../apis/goplus/goplus-service";
import { GoPlusTokenDataRawData } from "../apis/goplus/types";
import { BaseDataSource } from "./base-data-source";
import { TokenDataSource } from "@prisma/client";
import { GoPlusRugpullDetection, GoPlusTokenSecurity, GoPlusSolanaTokenSecurity } from "python-proxy-scraper-client";
import { SocialMedia } from "../../models/socials/types";

export class GoPlusRawData extends BaseDataSource<GoPlusTokenDataRawData> {
    constructor(
        tokenAddress: string,
        chainId: ChainId,
        initialData?: Partial<GoPlusTokenDataRawData>,
        private goPlusService: GoPlusService = GoPlusService.getInstance(),
    ) {
        super(tokenAddress, chainId, initialData);
    }

    protected getDataSourceName(): string {
        return TokenDataSource.GO_PLUS.toLowerCase();
    }

    async collect(): Promise<void> {
        await Promise.allSettled([
            this.getTokenSecurity(),
            this.getRugpullDetection()
        ]);
    }

    async getTokenSecurity(): Promise<GoPlusTokenSecurity | GoPlusSolanaTokenSecurity | null> {
        return this.getOrFetch(
            'tokenSecurity',
            () => this.goPlusService.getTokenSecurity(this.tokenAddress, this.chainId)
        );
    }

    async getRugpullDetection(): Promise<GoPlusRugpullDetection | null> {
        return this.getOrFetch(
            'rugpullDetection',
            () => this.goPlusService.getRugpullDetection(this.tokenAddress, this.chainId)
        );
    }

    getRawData(): GoPlusTokenDataRawData {
        return {
            tokenSecurity: this.data.tokenSecurity!,
            rugpullDetection: this.data.rugpullDetection!
        };
    }

    // GoPlus doesn't provide these fields, so return null
    async getPrice(): Promise<number | null> {
        return null;
    }

    async getMarketCap(): Promise<number | null> {
        return null;
    }

    async getLiquidity(): Promise<number | null> {
        return null;
    }

    async getSupply(): Promise<number | null> {
        return null;
    }

    async getDecimals(): Promise<number | null> {
        return null;
    }

    async getName(): Promise<string | null> {
        return null;
    }

    async getSymbol(): Promise<string | null> {
        return null;
    }

    async getLogoUrl(): Promise<string | null> {
        return null;
    }

    async getDescription(): Promise<string | null> {
        return null;
    }

    async getSocials(): Promise<SocialMedia | null> {
        return null;
    }

    async getCreatedBy(): Promise<string | null> {
        return null;
    }
}