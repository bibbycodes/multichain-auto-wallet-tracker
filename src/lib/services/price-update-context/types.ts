import { Alert } from "@prisma/client";
import { AutoTrackerToken } from "../../models/token";

/**
 * Data structure containing all context needed to evaluate price update rules
 */
export interface PriceUpdateContextData {
    /** Original signal alert that started tracking this token */
    signalAlert: Alert;

    /** Token being evaluated */
    token: AutoTrackerToken;

    /** Current market price */
    currentPrice: number;

    /** Current market capitalization */
    currentMcap: number;

    /** Most recent price update alert (if any) */
    lastPriceUpdate?: Alert;

    /** Total count of previous price updates */
    priceUpdateCount: number;

    // Calculated fields
    /** Time elapsed since signal alert was created (milliseconds) */
    timeSinceSignal: number;

    /** Time elapsed since last price update (milliseconds), undefined if no previous updates */
    timeSinceLastUpdate?: number;

    /** Current price / signal alert price */
    priceMultiplier: number;

    /** Current mcap / signal alert mcap */
    mcapMultiplier: number;
}
