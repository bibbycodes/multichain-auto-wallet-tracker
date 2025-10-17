import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Global setup for Jest tests
 * Loads .env.test file before any tests run
 */
export default async function globalSetup() {
    // Load .env.test file with override flag to override existing env vars
    const envTestPath = path.resolve(__dirname, '../.env.test');
    dotenv.config({ path: envTestPath, override: true });

    console.log('🧪 Test environment loaded');
    console.log(`📦 Using test database: ${process.env.DATABASE_URL}`);

    // Verify DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        throw new Error(
            'DATABASE_URL is not set. Please ensure .env.test exists with a valid DATABASE_URL'
        );
    }

    // CRITICAL: Block tests if not using a test database
    if (
        !process.env.DATABASE_URL.includes('_test') &&
        !process.env.DATABASE_URL.includes('test_')
    ) {
        throw new Error(
            `🚨 FATAL: DATABASE_URL must point to a test database!\n` +
            `Current: ${process.env.DATABASE_URL}\n` +
            `Expected: Database name should contain "test" or "_test"\n` +
            `This prevents accidental data loss in development/production databases.`
        );
    }

    console.log('✅ Confirmed using test database');
}
