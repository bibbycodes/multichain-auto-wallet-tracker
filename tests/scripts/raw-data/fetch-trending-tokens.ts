import { BirdEyeFetcherService } from "../../../src/lib/services/apis/birdeye/birdeye-service";
import { RawTokenDataCache } from "../../../src/lib/services/raw-data/raw-data";
import { ChainsMap } from "../../../src/shared/chains";
import { BirdeyeMapper } from "../../../src/lib/services/apis/birdeye/birdeye-mapper";

/**
 * Script to fetch trending tokens from Birdeye and collect raw data for each
 * This will help populate the raw-data-jsons directory with real trending token data
 */
export const fetchTrendingTokens = async () => {
    console.log('🚀 Starting trending tokens raw data collection...');
    
    const birdeyeService = BirdEyeFetcherService.getInstance();
    const chainId = ChainsMap.bsc; // Focus on BSC for now
    const chain = BirdeyeMapper.chainIdToChain(chainId);
    
    try {
        // Fetch trending tokens from Birdeye
        console.log(`📊 Fetching top 100 trending tokens by market cap for chain: ${chain} (${chainId})`);
        const trendingTokens = await birdeyeService.getTop100TrendingTokensByMarketCap(chainId);
        
        console.log(`✅ Found ${trendingTokens.length} trending tokens`);
        
        // Process each token (limit to first 5 for testing)
        const tokensToProcess = trendingTokens
        for (let i = 0; i < tokensToProcess.length; i++) {
            const token = tokensToProcess[i];
            console.log(`\n🔄 Processing token ${i + 1}/${tokensToProcess.length}: ${token.name} (${token.symbol})`);
            console.log(`   Address: ${token.address}`);
            console.log(`   Price: $${token.price}`);
            console.log(`   Market Cap Rank: ${token.rank}`);
            console.log(`   24h Volume: $${token.volume24hUSD.toLocaleString()}`);
            
            try {
                // Create raw data cache instance
                const rawDataCache = new RawTokenDataCache(token.address, chainId);
                
                // Collect data from all sources
                console.log('   ⏳ Collecting raw data...');
                await rawDataCache.collect();
                
                // Get the collected data
                const rawData = rawDataCache.toObject();
                
                // Log what was collected
                console.log('   ✅ Raw data collected:');
                if (rawData.birdeye?.tokenOverview) console.log('     - Birdeye token overview');
                if (rawData.birdeye?.tokenSecurity) console.log('     - Birdeye token security');
                if (rawData.birdeye?.markets) console.log('     - Birdeye markets');
                if (rawData.gmgn?.tokenInfo) console.log('     - GMGN token info');
                if (rawData.gmgn?.socials) console.log('     - GMGN socials');
                if (rawData.gmgn?.holders) console.log('     - GMGN holders');
                if (rawData.chainBase?.topHolders) console.log('     - ChainBase top holders');
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`   ❌ Error processing token ${token.address}:`, error);
                // Continue with next token
            }
        }
        
        console.log('\n🎉 Trending tokens raw data collection completed!');
        console.log('📁 Check the /raw-data-jsons directory for saved fixtures');
        
    } catch (error) {
        console.error('❌ Error fetching trending tokens:', error);
        throw error;
    }
};

// Run the script if called directly
if (require.main === module) {
    fetchTrendingTokens()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}
