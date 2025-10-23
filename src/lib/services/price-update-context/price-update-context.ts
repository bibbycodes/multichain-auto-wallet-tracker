import { Alert } from "@prisma/client";
import { AutoTrackerToken } from "../../models/token";
import { PriceUpdateContextData } from "./types";

/**
 * Context class that encapsulates all data needed for price update evaluation
 * Calculates derived fields (multipliers, time deltas) from raw inputs
 */
export class PriceUpdateContext {
    private readonly contextData: PriceUpdateContextData;

    constructor(params: {
        signalAlert: Alert;
        token: AutoTrackerToken;
        currentPrice: number;
        currentMcap: number;
        lastPriceUpdate?: Alert;
        priceUpdateCount: number;
    }) {
        // Calculate derived fields
        const now = Date.now();
        const timeSinceSignal = now - params.signalAlert.created_at.getTime();

        let timeSinceLastUpdate: number | undefined;
        if (params.lastPriceUpdate) {
            timeSinceLastUpdate = now - params.lastPriceUpdate.created_at.getTime();
        }

        const priceMultiplier = params.currentPrice / params.signalAlert.price;
        const mcapMultiplier = params.currentMcap / params.signalAlert.market_cap;

        this.contextData = {
            signalAlert: params.signalAlert,
            token: params.token,
            currentPrice: params.currentPrice,
            currentMcap: params.currentMcap,
            lastPriceUpdate: params.lastPriceUpdate,
            priceUpdateCount: params.priceUpdateCount,
            timeSinceSignal,
            timeSinceLastUpdate,
            priceMultiplier,
            mcapMultiplier,
        };
    }

    /**
     * Get the full context data
     */
    toObject(): PriceUpdateContextData {
        return this.contextData;
    }

    /**
     * Get the original signal alert
     */
    get signalAlert(): Alert {
        return this.contextData.signalAlert;
    }

    /**
     * Get the token
     */
    get token(): AutoTrackerToken {
        return this.contextData.token;
    }

    /**
     * Get current price
     */
    get currentPrice(): number {
        return this.contextData.currentPrice;
    }

    /**
     * Get current market cap
     */
    get currentMcap(): number {
        return this.contextData.currentMcap;
    }

    /**
     * Get the last price update (if any)
     */
    get lastPriceUpdate(): Alert | undefined {
        return this.contextData.lastPriceUpdate;
    }

    /**
     * Get the count of previous price updates
     */
    get priceUpdateCount(): number {
        return this.contextData.priceUpdateCount;
    }

    /**
     * Get time since signal in milliseconds
     */
    get timeSinceSignal(): number {
        return this.contextData.timeSinceSignal;
    }

    /**
     * Get time since last update in milliseconds (undefined if no previous updates)
     */
    get timeSinceLastUpdate(): number | undefined {
        return this.contextData.timeSinceLastUpdate;
    }

    /**
     * Get price multiplier (current / signal)
     */
    get priceMultiplier(): number {
        return this.contextData.priceMultiplier;
    }

    /**
     * Get market cap multiplier (current / signal)
     */
    get mcapMultiplier(): number {
        return this.contextData.mcapMultiplier;
    }

    /**
     * Check if this is the first update
     */
    get isFirstUpdate(): boolean {
        return this.contextData.priceUpdateCount === 0;
    }
}
