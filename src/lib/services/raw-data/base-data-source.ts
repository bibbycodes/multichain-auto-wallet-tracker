import { TokenDataSource } from "@prisma/client";
import { ChainId } from "../../../shared/chains";
import { withTryCatch } from "../../../utils/fetch";
import { SocialMedia } from "../../models/socials/types";
import { FixtureSaver } from "./fixture-saver";

/**
 * Base class for data source implementations that provides caching functionality
 */
export abstract class BaseDataSource<TData extends Record<string, any>> {
    protected data: Partial<TData>;

    constructor(
        protected tokenAddress: string,
        protected chainId: ChainId,
        initialData?: Partial<TData>
    ) {
        this.data = initialData ?? {};
    }

    /**
     * Collect all data for this source
     */
    abstract collect(): Promise<void>;

    /**
     * Common token data methods that all data sources should implement
     */
    abstract getPrice(): Promise<number | null>;
    abstract getMarketCap(): Promise<number | null>;
    abstract getLiquidity(): Promise<number | null>;
    abstract getSupply(): Promise<number | null>;
    abstract getDecimals(): Promise<number | null>;
    abstract getName(): Promise<string | null>;
    abstract getSymbol(): Promise<string | null>;
    abstract getLogoUrl(): Promise<string | null>;
    abstract getDescription(): Promise<string | null>;
    abstract getSocials(): Promise<SocialMedia | null>;
    abstract getCreatedBy(): Promise<string | null>;

    /**
     * Get the data source name for fixture saving
     */
    protected abstract getDataSourceName(): string;

    /**
     * Get cached data or fetch if not available
     */
    protected async getOrFetch<T>(
        propertyKey: keyof TData,
        fetcher: () => Promise<T>,
        validator: (data: T) => boolean = () => true,
        saveFixture: boolean = false
    ): Promise<T | null> {
        if (this.data[propertyKey] !== undefined) {
            return this.data[propertyKey] as T;
        }

        const result = await withTryCatch(fetcher);
        if (result !== null && !validator(result)) {
            return null;
        }
        
        this.data[propertyKey] = result as any;
        
        // Save fixture if result is not null
        if (result !== null && saveFixture) {
            await FixtureSaver.saveFixture(
                this.getDataSourceName(),
                propertyKey as string,
                this.tokenAddress,
                result
            );
        }
        
        return result;
    }

    /**
     * Get the raw data object
     */
    public toObject(): Partial<TData> {
        return this.data;
    }

    /**
     * Get the raw data as JSON string
     */
    public toJson(): string {
        return JSON.stringify(this.data);
    }

    /**
     * Update the data
     */
    public updateData(data: Partial<TData>): void {
        this.data = { ...this.data, ...data };
    }
}
