import { PrismaClient, ChainType } from '@prisma/client';

/**
 * Seed BSC chain data
 */
export async function seedChains(prisma: PrismaClient): Promise<void> {
    console.log('Seeding BSC chain...');

    await prisma.chain.upsert({
        where: { chain_id: '56' },
        update: {},
        create: {
            chain_id: '56',
            name: 'BSC',
            chain_type: ChainType.EVM,
            native_token_address: '0x0000000000000000000000000000000000000000',
            wrapped_token_address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            created_at: new Date(),
            updated_at: new Date(),
        },
    });

    console.log('✓ BSC chain seeded');
}
