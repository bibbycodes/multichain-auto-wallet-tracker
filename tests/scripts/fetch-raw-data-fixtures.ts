import { RawTokenDataCache } from "../../src/lib/services/raw-data/raw-data";
import { ChainsMap } from "../../src/shared/chains";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to fetch raw data from various sources and save as fixtures
 * This data will be used across multiple test suites
 */
export const fetchRawDataFixtures = async () => {
    console.log('🚀 Starting raw data fixture collection...');
    
    // Test token address from token-builder test
    const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const chainId = ChainsMap.bsc; // BSC chain
    
    console.log(`📊 Fetching data for token: ${tokenAddress} on chain: ${chainId}`);
    
    try {
        // Create raw data cache instance
        const rawDataCache = new RawTokenDataCache(tokenAddress, chainId);
        
        // Collect data from all sources
        console.log('⏳ Collecting data from all sources...');
        await rawDataCache.collect();
        
        // Get all the raw data
        const rawData = rawDataCache.toObject();
        
        // Create base fixtures directory
        const baseFixturesDir = path.join(__dirname, '../fixtures');
        if (!fs.existsSync(baseFixturesDir)) {
            fs.mkdirSync(baseFixturesDir, { recursive: true });
        }
        
        // Get individual source data
        const birdeyeData = rawData.birdeye;
        const gmgnData = rawData.gmgn;
        const chainBaseData = rawData.chainBase;
        
        // Create service-specific directories and save data
        if (birdeyeData) {
            const birdeyeDir = path.join(baseFixturesDir, 'birdeye');
            if (!fs.existsSync(birdeyeDir)) {
                fs.mkdirSync(birdeyeDir, { recursive: true });
            }
            
            // Save each key from BirdEyeTokenDataRawData interface
            const birdeyeKeys = ['tokenOverview', 'tokenSecurity', 'markets'];
            
            for (const key of birdeyeKeys) {
                const keyData = (birdeyeData as any)[key];
                if (keyData !== undefined) {
                    const keyPath = path.join(birdeyeDir, `${key}-${tokenAddress}.json`);
                    fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2));
                    console.log(`✅ Saved Birdeye ${key} data to: ${keyPath}`);
                }
            }
            
            // Save raw data for reference
            const rawDataPath = path.join(birdeyeDir, `raw-data-${tokenAddress}.json`);
            fs.writeFileSync(rawDataPath, JSON.stringify(birdeyeData, null, 2));
            console.log(`✅ Saved Birdeye raw data to: ${rawDataPath}`);
        }
        
        if (gmgnData) {
            const gmgnDir = path.join(baseFixturesDir, 'gmgn');
            if (!fs.existsSync(gmgnDir)) {
                fs.mkdirSync(gmgnDir, { recursive: true });
            }
            
            // Save each key from GmGnTokenDataRawData interface
            const gmgnKeys = ['tokenInfo', 'socials', 'holders'];
            
            for (const key of gmgnKeys) {
                const keyData = (gmgnData as any)[key];
                if (keyData !== undefined) {
                    const keyPath = path.join(gmgnDir, `${key}-${tokenAddress}.json`);
                    fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2));
                    console.log(`✅ Saved GMGN ${key} data to: ${keyPath}`);
                }
            }
            
            // Save raw data for reference
            const rawDataPath = path.join(gmgnDir, `raw-data-${tokenAddress}.json`);
            fs.writeFileSync(rawDataPath, JSON.stringify(gmgnData, null, 2));
            console.log(`✅ Saved GMGN raw data to: ${rawDataPath}`);
        }
        
        if (chainBaseData) {
            const chainBaseDir = path.join(baseFixturesDir, 'chainbase');
            if (!fs.existsSync(chainBaseDir)) {
                fs.mkdirSync(chainBaseDir, { recursive: true });
            }
            
            // Save each key from ChainBaseTokenDataRawData interface
            const chainBaseKeys = ['topHolders'];
            
            for (const key of chainBaseKeys) {
                const keyData = (chainBaseData as any)[key];
                if (keyData !== undefined) {
                    const keyPath = path.join(chainBaseDir, `${key}-${tokenAddress}.json`);
                    fs.writeFileSync(keyPath, JSON.stringify(keyData, null, 2));
                    console.log(`✅ Saved ChainBase ${key} data to: ${keyPath}`);
                }
            }
            
            // Save raw data for reference
            const rawDataPath = path.join(chainBaseDir, `raw-data-${tokenAddress}.json`);
            fs.writeFileSync(rawDataPath, JSON.stringify(chainBaseData, null, 2));
            console.log(`✅ Saved ChainBase raw data to: ${rawDataPath}`);
        }
        
        // Save combined raw data for reference
        const combinedPath = path.join(baseFixturesDir, 'raw-data-combined.json');
        fs.writeFileSync(combinedPath, JSON.stringify(rawData, null, 2));
        console.log(`✅ Saved combined raw data to: ${combinedPath}`);
        
        // Save metadata about the fixture
        const metadata = {
            tokenAddress,
            chainId,
            timestamp: new Date().toISOString(),
            sources: {
                birdeye: birdeyeData ? 'available' : 'unavailable',
                gmgn: gmgnData ? 'available' : 'unavailable',
                chainBase: chainBaseData ? 'available' : 'unavailable'
            }
        };
        
        const metadataPath = path.join(baseFixturesDir, 'raw-data-metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`✅ Saved metadata to: ${metadataPath}`);
        
        console.log('🎉 Raw data fixture collection completed successfully!');
        
        // Log some sample data for verification
        console.log('\n📋 Sample data preview:');
        if (birdeyeData) {
            console.log('Birdeye - Price:', (birdeyeData as any).price || 'N/A');
            console.log('Birdeye - Market Cap:', (birdeyeData as any).marketCap || 'N/A');
        }
        if (gmgnData) {
            console.log('GMGN - Price:', (gmgnData as any).price || 'N/A');
            console.log('GMGN - Market Cap:', (gmgnData as any).marketCap || 'N/A');
        }
        if (chainBaseData) {
            console.log('ChainBase - Name:', (chainBaseData as any).name || 'N/A');
            console.log('ChainBase - Symbol:', (chainBaseData as any).symbol || 'N/A');
        }
        
    } catch (error) {
        console.error('❌ Error fetching raw data fixtures:', error);
        throw error;
    }
};

// Run the script if called directly
if (require.main === module) {
    fetchRawDataFixtures()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}
