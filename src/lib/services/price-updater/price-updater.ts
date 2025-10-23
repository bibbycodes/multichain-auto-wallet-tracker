import { Alert } from "@prisma/client";
import { xHoursAgo, xMinutesAgo } from "../../../utils/date";
import { Database } from "../../db/database";
import { AutoTrackerToken } from "../../models/token";
import {
    PriceUpdateContext,
    PriceUpdateRuleEngine,
    UpdateDecision,
    PriceUpdateConfig
} from "../price-update-context";

const MINIMUM_CHECK_INTERVAL_MINUTES = 5;

export class PriceUpdater {
    constructor(
        private readonly db: Database = Database.getInstance(),
        private readonly config?: PriceUpdateConfig
    ) {}

    /**
     * Get tokens that need price update evaluation
     * Filters out tokens that had a price update in the last 5 minutes to avoid unnecessary checks
     */
    async getTokensToUpdate(): Promise<{alert: Alert, token: AutoTrackerToken}[]> {
        const last24Hours = xHoursAgo(24);
        const alertedTokens = await this.db.alerts.getAlertsAndTokensAfterDate(last24Hours);

        // Filter out tokens that had a recent price update (within 5 minutes)
        const minCheckTime = xMinutesAgo(MINIMUM_CHECK_INTERVAL_MINUTES);
        const filtered = [];

        for (const { alert, token } of alertedTokens) {
            const lastUpdate = await this.db.alerts.getLastPriceUpdate(token.address);

            // Include if no previous update OR last update was more than 5 minutes ago
            if (!lastUpdate || lastUpdate.created_at < minCheckTime) {
                filtered.push({
                    alert,
                    token: AutoTrackerToken.fromDb(token)
                });
            }
        }

        return filtered;
    }

    /**
     * Evaluate whether a price update should be sent for a token
     */
    async shouldSendPriceUpdate(
        signalAlert: Alert,
        token: AutoTrackerToken,
        currentPrice: number,
        currentMcap: number
    ): Promise<UpdateDecision> {
        // Get price update history
        const { count, lastUpdate } = await this.db.alerts.getPriceUpdateInfo(token.address);

        // Build context
        const context = new PriceUpdateContext({
            signalAlert,
            token,
            currentPrice,
            currentMcap,
            lastPriceUpdate: lastUpdate || undefined,
            priceUpdateCount: count
        });

        // Evaluate with rule engine
        const engine = new PriceUpdateRuleEngine(context, this.config);
        return await engine.evaluate();
    }
}