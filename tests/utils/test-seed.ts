import { PrismaClient, Token } from '@prisma/client';
import { AutoTrackerToken } from '../../src/lib/models/token';
import { ChainId } from '../../src/shared/chains';
import { BirdeyeMapper } from '../../src/lib/services/apis/birdeye/birdeye-mapper';
import { GmGnMapper } from '../../src/lib/services/apis/gmgn/gmgn-mapper';
import {
    BirdeyeEvmTokenSecurity,
    BirdeyeSolanaTokenSecurity,
    BirdTokenEyeOverview
} from '../../src/lib/services/apis/birdeye/client/types';
import { GmGnMultiWindowTokenInfo, GmGnTokenSocials } from 'python-proxy-scraper-client';
import { TestDbHelper } from './db-helper';
import { TokensRepository } from '../../src/lib/db/repositories/tokens';

// Import fixtures
import tokenOverviewFixture from '../fixtures/birdeye/tokenOverview-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import tokenSecurityFixture from '../fixtures/birdeye/tokenSecurity-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import marketsFixture from '../fixtures/birdeye/markets-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import gmgnTokenInfoFixture from '../fixtures/gmgn/tokenInfo-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';
import gmgnSocialsFixture from '../fixtures/gmgn/socials-0xe8852d270294cc9a84fe73d5a434ae85a1c34444.json';

/**
 * Test data seed utility for populating database with fixture-based test data
 */
export class TestSeed {
    private prisma: PrismaClient;
    private tokensRepo: TokensRepository;

    constructor(prisma?: PrismaClient) {
        this.prisma = prisma || TestDbHelper.getInstance().getPrisma();
        this.tokensRepo = new TokensRepository(this.prisma);
    }

    /**
     * Create a token from Birdeye fixtures
     */
    async createBirdeyeToken(options?: {
        address?: string;
        chainId?: ChainId;
        tokenOverview?: Partial<BirdTokenEyeOverview>;
        tokenSecurity?: Partial<BirdeyeEvmTokenSecurity | BirdeyeSolanaTokenSecurity>;
    }): Promise<Token> {
        const address = options?.address || tokenOverviewFixture.address;
        const chainId = options?.chainId || '1';

        // Merge provided overrides with fixtures
        const tokenOverview = {
            ...tokenOverviewFixture,
            ...options?.tokenOverview,
            address,
        } as BirdTokenEyeOverview;

        const tokenSecurity = {
            ...tokenSecurityFixture,
            ...options?.tokenSecurity,
        } as BirdeyeEvmTokenSecurity;

        const pairAddress = marketsFixture.items[0]?.address || '0xpairaddress';

        // Use mapper to create AutoTrackerToken
        const autoTrackerToken = BirdeyeMapper.mapBirdeyeTokenToAutoTrackerToken(
            tokenOverview,
            tokenSecurity,
            pairAddress,
            chainId
        );

        // Save to database
        return await this.prisma.token.create({
            data: autoTrackerToken.toDb(),
        });
    }

    /**
     * Create a token from GMGN fixtures
     */
    async createGmgnToken(options?: {
        address?: string;
        chainId?: ChainId;
        tokenInfo?: Partial<GmGnMultiWindowTokenInfo>;
        socials?: Partial<GmGnTokenSocials>;
    }): Promise<Token> {
        const address = options?.address || gmgnTokenInfoFixture.address;
        const chainId = options?.chainId || '56';

        // Merge provided overrides with fixtures
        const tokenInfo = {
            ...gmgnTokenInfoFixture,
            ...options?.tokenInfo,
            address,
        } as GmGnMultiWindowTokenInfo;

        const socials = {
            ...gmgnSocialsFixture,
            ...options?.socials,
            address,
        } as GmGnTokenSocials;

        // Use mapper to create AutoTrackerToken
        const autoTrackerToken = GmGnMapper.mapGmGnTokenToAutoTrackerToken(
            tokenInfo,
            socials,
            chainId
        );

        // Save to database using repository
        return await this.tokensRepo.createToken(autoTrackerToken.toDb());
    }

    /**
     * Create a minimal token with only required fields
     */
    async createMinimalToken(options: {
        address: string;
        chainId: ChainId;
        name?: string;
        symbol?: string;
        decimals?: number;
        totalSupply?: string;
        pairAddress?: string;
    }): Promise<Token> {
        return await this.tokensRepo.createToken({
            address: options.address,
            chain: {
                connect: { chain_id: options.chainId },
            },
            name: options.name || 'Test Token',
            symbol: options.symbol || 'TEST',
            decimals: options.decimals || 18,
            total_supply: options.totalSupply || '1000000000',
            pair_address: options.pairAddress || '0xpairaddress',
            data_source: 'BIRDEYE',
        });
    }

    /**
     * Create an incomplete token (missing some required fields)
     */
    async createIncompleteToken(options: {
        address: string;
        chainId: ChainId;
        missingFields?: string[];
    }): Promise<Token> {
        const missingFields = options.missingFields || ['pair_address'];

        const data: any = {
            address: options.address,
            chain: {
                connect: { chain_id: options.chainId },
            },
            name: 'Incomplete Token',
            symbol: 'INC',
            decimals: 18,
            total_supply: '1000000000',
            data_source: 'BIRDEYE',
        };

        // Add pair_address unless it's in missing fields
        if (!missingFields.includes('pair_address')) {
            data.pair_address = '0xpairaddress';
        } else {
            // Prisma requires pair_address, so we'll use a placeholder
            // In real scenario, you might need to adjust schema to make it optional
            data.pair_address = '';
        }

        return await this.tokensRepo.createToken(data);
    }

    /**
     * Create a token without chainId (for testing chainId discovery)
     * Note: This requires the schema to allow null chainId, which it currently doesn't
     */
    async createTokenWithoutChainId(options: {
        address: string;
    }): Promise<Token | null> {
        // This is a placeholder - in practice, the schema requires chainId
        // You would need to adjust the schema if you need to test this scenario
        console.warn('Cannot create token without chainId - schema requires it');
        return null;
    }

    /**
     * Seed multiple tokens at once
     */
    async seedMultipleTokens(count: number, source: 'birdeye' | 'gmgn' = 'birdeye'): Promise<Token[]> {
        const tokens: Token[] = [];

        for (let i = 0; i < count; i++) {
            const address = `0x${i.toString().padStart(40, '0')}`;

            if (source === 'birdeye') {
                tokens.push(await this.createBirdeyeToken({ address, chainId: '1' }));
            } else {
                tokens.push(await this.createGmgnToken({ address, chainId: '56' }));
            }
        }

        return tokens;
    }

    /**
     * Create a token with custom AutoTrackerToken data
     */
    async createTokenFromAutoTracker(autoTrackerToken: AutoTrackerToken): Promise<Token> {
        return await this.tokensRepo.createToken(autoTrackerToken.toDb());
    }

    /**
     * Get a token from the database
     */
    async getToken(address: string, chainId?: string): Promise<Token | null> {
        if (chainId) {
            return await this.tokensRepo.findOneByAddressAndChainId(address, chainId);
        }

        return await this.tokensRepo.findOneByAddress(address);
    }

    /**
     * Delete a token from the database
     */
    async deleteToken(address: string, chainId?: string): Promise<void> {
        if (chainId) {
            await this.prisma.token.delete({
                where: {
                    address_chain_id: {
                        address,
                        chain_id: chainId,
                    },
                },
            });
        } else {
            await this.prisma.token.deleteMany({
                where: { address },
            });
        }
    }

    /**
     * Get fixture data for use in tests
     */
    static getFixtures() {
        return {
            birdeye: {
                tokenOverview: tokenOverviewFixture as unknown as BirdTokenEyeOverview,
                tokenSecurity: tokenSecurityFixture as unknown as BirdeyeEvmTokenSecurity,
                markets: marketsFixture,
            },
            gmgn: {
                tokenInfo: gmgnTokenInfoFixture as unknown as GmGnMultiWindowTokenInfo,
                socials: gmgnSocialsFixture as unknown as GmGnTokenSocials,
            },
        };
    }
}

/**
 * Convenience function to create a test seed instance
 */
export function createTestSeed(prisma?: PrismaClient): TestSeed {
    return new TestSeed(prisma);
}
