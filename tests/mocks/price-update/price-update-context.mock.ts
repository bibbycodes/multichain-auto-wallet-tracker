import { PriceUpdateContextData } from '../../../src/lib/services/price-update-context/types';
import { createMockToken } from '../common/token.mock';
import { createMockSignalAlert, createMockPriceUpdateAlert } from '../common/alert.mock';
import { Alert } from '@prisma/client';
import { AutoTrackerToken } from '../../../src/lib/models/token';

/**
 * Helper to create mock PriceUpdateContextData
 * Automatically calculates derived fields if not provided
 */
export function createMockPriceUpdateContext(
    partial: Partial<PriceUpdateContextData> = {}
): PriceUpdateContextData {
    const signalAlert = partial.signalAlert || createMockSignalAlert();
    const token = partial.token || createMockToken();
    const currentPrice = partial.currentPrice ?? signalAlert.price * 2; // Default to 2x
    const currentMcap = partial.currentMcap ?? signalAlert.market_cap * 2; // Default to 2x

    // Calculate derived fields
    const priceMultiplier = partial.priceMultiplier ?? currentPrice / signalAlert.price;
    const mcapMultiplier = partial.mcapMultiplier ?? currentMcap / signalAlert.market_cap;

    const now = Date.now();
    const timeSinceSignal = partial.timeSinceSignal ?? (now - signalAlert.created_at.getTime());

    let timeSinceLastUpdate: number | undefined;
    if (partial.lastPriceUpdate) {
        timeSinceLastUpdate = partial.timeSinceLastUpdate ?? (now - partial.lastPriceUpdate.created_at.getTime());
    }

    const defaultContext: PriceUpdateContextData = {
        signalAlert,
        token,
        currentPrice,
        currentMcap,
        lastPriceUpdate: partial.lastPriceUpdate,
        priceUpdateCount: partial.priceUpdateCount ?? 0,
        timeSinceSignal,
        timeSinceLastUpdate,
        priceMultiplier,
        mcapMultiplier,
    };

    return {
        ...defaultContext,
        ...partial,
    };
}

/**
 * Helper to create context for first update scenario
 */
export function createFirstUpdateContext(
    priceMultiplier: number = 2.0,
    mcapMultiplier: number = 2.0
): PriceUpdateContextData {
    const signalAlert = createMockSignalAlert();

    return createMockPriceUpdateContext({
        signalAlert,
        currentPrice: signalAlert.price * priceMultiplier,
        currentMcap: signalAlert.market_cap * mcapMultiplier,
        lastPriceUpdate: undefined,
        priceUpdateCount: 0,
        priceMultiplier,
        mcapMultiplier,
    });
}

/**
 * Helper to create context with a previous update
 */
export function createContextWithPreviousUpdate(
    options: {
        priceMultiplier?: number;
        mcapMultiplier?: number;
        lastUpdatePrice?: number;
        lastUpdateMcap?: number;
        timeSinceLastUpdateMs?: number;
    } = {}
): PriceUpdateContextData {
    const signalAlert = createMockSignalAlert();
    const priceMultiplier = options.priceMultiplier ?? 3.0;
    const mcapMultiplier = options.mcapMultiplier ?? 3.0;

    const lastUpdatePrice = options.lastUpdatePrice ?? signalAlert.price * 2;
    const lastUpdateMcap = options.lastUpdateMcap ?? signalAlert.market_cap * 2;

    const timeSinceLastUpdateMs = options.timeSinceLastUpdateMs ?? 3600000; // 1 hour default
    const lastUpdateCreatedAt = new Date(Date.now() - timeSinceLastUpdateMs);

    const lastPriceUpdate = createMockPriceUpdateAlert({
        token_address: signalAlert.token_address,
        price: lastUpdatePrice,
        market_cap: lastUpdateMcap,
        created_at: lastUpdateCreatedAt,
    });

    return createMockPriceUpdateContext({
        signalAlert,
        currentPrice: signalAlert.price * priceMultiplier,
        currentMcap: signalAlert.market_cap * mcapMultiplier,
        lastPriceUpdate,
        priceUpdateCount: 1,
        timeSinceLastUpdate: timeSinceLastUpdateMs,
        priceMultiplier,
        mcapMultiplier,
    });
}
