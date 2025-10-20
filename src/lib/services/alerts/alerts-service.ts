import { Database } from '../../db/database';
import { SocialPlatform } from '@prisma/client';
import { AutoTrackerToken } from '../../models/token';
import { RawTokenDataCache } from '../raw-data/raw-data';

export class AlertsService {
    constructor(
        private readonly database: Database = Database.getInstance()
    ) { }

    async createAlertForToken(
        token: AutoTrackerToken,
        marketCap: number,
        price: number,
        socialPlatform: SocialPlatform = SocialPlatform.TELEGRAM,
    ): Promise<void> {
        try {
            // Get token from database to ensure it exists and get the token_id
            const dbToken = await this.database.tokens.findOneByAddress(token.address);
            if (dbToken) {
                await this.database.alerts.createAlert({
                    token_id: dbToken.id,
                    token: {
                        connect: {
                            address: token.address
                        }
                    },
                    social_platform: socialPlatform,
                    market_cap: marketCap,
                    price: price
                });
            } else {
                console.warn(`Token not found in database, skipping alert creation: ${token.address}`);
            }
        } catch (error) {
            console.error('Failed to create alert record:', error);
            // Don't throw error here as the message was already sent successfully
        }
    }

    async hasTokenAlerted(tokenAddress: string): Promise<boolean> {
        try {
            const alertCount = await this.database.alerts.countByTokenAddress(tokenAddress);
            return alertCount > 0;
        } catch (error) {
            console.error('Failed to check if token has alerted:', error);
            return false;
        }
    }
}
