// CRITICAL: Load .env.test FIRST before any other imports
// This must happen before PrismaClient or any module that uses env.ts is imported
import * as dotenv from 'dotenv';
import * as path from 'path';
const envTestPath = path.resolve(__dirname, '../../../.env.test');
dotenv.config({ path: envTestPath, override: true });

import { PrismaClient } from '@prisma/client';
import { seedChains } from './chains.seed';
import { seedTokens } from './tokens.seed';

/**
 * Main seed function - runs all seed scripts in order
 */
export async function runSeeds(prisma?: PrismaClient): Promise<void> {
    const client = prisma || new PrismaClient();
    const shouldDisconnect = !prisma; // Only disconnect if we created the client

    try {
        console.log('🌱 Starting database seeding...');
        console.log(`📦 DATABASE_URL: ${process.env.DATABASE_URL}\n`);

        // Verify we're using test database
        if (!process.env.DATABASE_URL?.includes('_test')) {
            throw new Error('🚨 FATAL: Seed must run against test database only!');
        }

        // Seed in order of dependencies
        await seedChains(client);
        await seedTokens(client);

        console.log('\n✅ Database seeding complete!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        if (shouldDisconnect) {
            await client.$disconnect();
        }
    }
}

// Allow running directly with: ts-node tests/utils/seeds/index.ts
if (require.main === module) {
    runSeeds()
        .then(() => {
            console.log('Seed script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seed script failed:', error);
            process.exit(1);
        });
}
