import { ChainId } from "../../../shared/chains";
import { SocialMedia } from "../../models/socials/types";
import { BirdEyeTokenDataRawData } from "../apis/birdeye/types";
import { ChainBaseTokenDataRawData } from "../apis/chain-base/types";
import { GmGnTokenDataRawData } from "../apis/gmgn/types";
import { BirdeyeRawTokenData } from "./birdeye-raw-data";
import { ChainBaseRawData } from "./chain-base-raw-data";
import { GmgnRawDataSource } from "./gmgn-raw-data";
import { RawDataData } from "./types";
import { GoPlusRawData } from "./go-plus-raw-data";
import { GoPlusTokenDataRawData } from "../apis/goplus/types";
import { GeckoTerminalRawData } from "./gecko-terminal-raw-data";
import { GeckoTerminaTokenDataRawData } from "../apis/gecko-terminal/types";
import { BaseDataSource } from "./base-data-source";

export class RawTokenDataCache {
    public readonly birdeye: BirdeyeRawTokenData;
    public readonly gmgn: GmgnRawDataSource;
    public readonly chainBase: ChainBaseRawData;
    public readonly goPlus: GoPlusRawData;
    public readonly geckoTerminal: GeckoTerminalRawData;
    public readonly chainId: ChainId;
    public readonly tokenAddress: string;
    private readonly dataSources: BaseDataSource<BirdEyeTokenDataRawData | GmGnTokenDataRawData | ChainBaseTokenDataRawData | GoPlusTokenDataRawData | GeckoTerminaTokenDataRawData>[];

    constructor(
        tokenAddress: string,
        chainId: ChainId,
        data?: RawDataData,
    ) {
        this.birdeye = new BirdeyeRawTokenData(tokenAddress, chainId, data?.birdeye);
        this.gmgn = new GmgnRawDataSource(tokenAddress, chainId, data?.gmgn);
        this.chainBase = new ChainBaseRawData(tokenAddress, chainId, data?.chainBase);
        this.goPlus = new GoPlusRawData(tokenAddress, chainId, data?.goPlus);
        this.geckoTerminal = new GeckoTerminalRawData(tokenAddress, chainId, data?.geckoTerminal);
        this.chainId = chainId;
        this.tokenAddress = tokenAddress;
        this.dataSources = [
            this.birdeye,
            this.gmgn,
            this.chainBase,
            this.goPlus,
            this.geckoTerminal
        ];
    }

    async collect(): Promise<void> {
        await Promise.allSettled(this.dataSources.map(dataSource => dataSource.collect()));
    }

    /**
     * Helper method to fetch from multiple sources with fallback
     * @param fetchers - Array of functions to fetch data from different sources
     * @param errorMessage - Optional error message. If provided, throws on failure. If not, returns null.
     */
    private async getFromSources<T>(
        fetchers: Array<() => Promise<T | null>>,
        errorMessage?: string
    ): Promise<T | null> {
        for (const fetcher of fetchers) {
            try {
                const result = await fetcher();
                if (result !== null) {
                    return result;
                }
            } catch (error) {
                // Continue to next fetcher if one fails
                console.warn('Data source failed:', error);
            }
        }

        if (errorMessage) {
            throw new Error(errorMessage);
        }
        
        return null;
    }

    public updateData(data: Partial<RawDataData>): void {
        if (data.birdeye) {
            this.birdeye.updateData(data.birdeye);
        }
        if (data.gmgn) {
            this.gmgn.updateData(data.gmgn);
        }
        if (data.chainBase) {
            this.chainBase.updateData(data.chainBase);
        }
        if (data.goPlus) {
            this.goPlus.updateData(data.goPlus);
        }
        if (data.geckoTerminal) {
            this.geckoTerminal.updateData(data.geckoTerminal);
        }
    }

    async getTokenPrice(): Promise<number> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getPrice()),
            'Price is not available'
        ) as Promise<number>;
    }

    async getTokenMarketCap(): Promise<number> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getMarketCap()),
            'Market cap is not available'
        ) as Promise<number>;
    }

    async getTokenLiquidity(): Promise<number> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getLiquidity()),
            'Liquidity is not available'
        ) as Promise<number>;
    }

    async getTokenSupply(): Promise<number | null> {    
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getSupply()),
            'Supply is not available'
        ) as Promise<number>;
    }

    async getTokenDecimals(): Promise<number | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getDecimals()),
            'Decimals is not available'
        ) as Promise<number>;
    }

    async getTokenName(): Promise<string | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getName()),
            'Name is not available'
        ) as Promise<string>;
    }

    async getTokenSymbol(): Promise<string | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getSymbol()),
            'Symbol is not available'
        ) as Promise<string>;
    }

    async getTokenLogoUrl(): Promise<string | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getLogoUrl()),
        );
    }

    async getTokenDescription(): Promise<string | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getDescription()),
        );
    }

    async getTokenSocials(): Promise<SocialMedia | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getSocials()),
        );
    }

    async getTokenCreatedBy(): Promise<string | null> {
        return this.getFromSources(
            this.dataSources.map(dataSource => () => dataSource.getCreatedBy()),
        );
    }

    public toJson(): string {
        return JSON.stringify(this.toObject());
    }

    public toObject(): RawDataData {
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

    public updateGoPlusData(data: Partial<GoPlusTokenDataRawData>): void {
        this.goPlus.updateData(data);
    }

    public updateGeckoTerminalData(data: Partial<GeckoTerminaTokenDataRawData>): void {
        this.geckoTerminal.updateData(data);
    }
}