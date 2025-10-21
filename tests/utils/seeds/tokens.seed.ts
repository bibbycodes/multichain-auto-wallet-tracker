import { PrismaClient } from '@prisma/client';
import { TestSeed } from '../test-seed';

/**
 * Seed a single test token on BSC
 */
export async function seedTokens(prisma: PrismaClient): Promise<void> {
    console.log('Seeding test token...');

    const testSeed = new TestSeed(prisma);

    // Create one GMGN token on BSC using fixtures
    // This uses the Russell rug Survivor token fixture
    await testSeed.createGmgnToken({
        address: '0xe8852d270294cc9a84fe73d5a434ae85a1c34444',
        chainId: '56', // BSC
    });

    console.log('✓ Test token seeded (0xe8852d270294cc9a84fe73d5a434ae85a1c34444 on BSC)');
}
