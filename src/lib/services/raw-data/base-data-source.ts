import { ChainId } from "../../../shared/chains";
import { withTryCatch } from "../../../utils/fetch";
import { SocialMedia } from "../../models/socials/types";

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
     * Get cached data or fetch if not available
     */
    protected async getOrFetch<T>(
        propertyKey: keyof TData,
        fetcher: () => Promise<T>
    ): Promise<T | null> {
        if (this.data[propertyKey] !== undefined) {
            return this.data[propertyKey] as T;
        }

        const result = await withTryCatch(fetcher);
        this.data[propertyKey] = result as any;
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
