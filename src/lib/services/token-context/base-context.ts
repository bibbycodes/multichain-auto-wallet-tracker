import { Database } from "../../db/database";

export class BaseContext {
    constructor(
        private readonly db: Database = Database.getInstance(),
    ) {
    }

    async getBaseContext() {
        // token security
        // previous alerts
        // mention history
        // Get notable wallets
        // token distribution
            // top holders
            // top traders
            // fresh wallets
            // same balance wallets
            // bundles
            // locked wallets
        
        return {

        }
    }
}