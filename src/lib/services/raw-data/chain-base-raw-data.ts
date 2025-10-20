import { TokenDataSource } from "@prisma/client";
import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { ChainBaseService } from "../apis/chain-base/chain-base-service";
import { ChainBaseTokenDataRawData, ChainBaseTopHolder } from "../apis/chain-base/types";
import { BaseDataSource } from "./base-data-source";

export class ChainBaseRawData extends BaseDataSource<ChainBaseTokenDataRawData> {
    constructor(
        tokenAddress: string,
        chainId: ChainId,
        initialData?: Partial<ChainBaseTokenDataRawData>,
        private chainBaseService: ChainBaseService = ChainBaseService.getInstance(),
    ) {
        super(tokenAddress, chainId, initialData);
    }

    protected getDataSourceName(): string {
        return TokenDataSource.CHAIN_BASE.toLowerCase();
    }

    async collect(): Promise<void> {
        await this.getTopHolders();
    }

    async getTopHolders(): Promise<ChainBaseTopHolder[] | null> {
        return this.getOrFetch(
            'topHolders',
            () => this.chainBaseService.fetchTopHoldersForToken(this.tokenAddress, this.chainId)
        );
    }

    // ChainBase does not provide these fields, so return null
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
