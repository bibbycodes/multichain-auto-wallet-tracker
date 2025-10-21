import { GoPlusRawData } from "../../src/lib/services/raw-data/go-plus-raw-data";
import { GeckoTerminalRawData } from "../../src/lib/services/raw-data/gecko-terminal-raw-data";
import { GoPlusService } from "../../src/lib/services/apis/goplus/goplus-service";
import { GeckoTerminalService } from "../../src/lib/services/apis/gecko-terminal/gecko-terminal-service";
import { GoPlusClient } from "python-proxy-scraper-client";
import { GeckoTerminalApiClient } from "python-proxy-scraper-client";
import { ChainsMap } from "../../src/shared/chains";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to fetch GoPlus and GeckoTerminal data and save as fixtures
 * This data will be used for testing the new raw data sources
 */
export const fetchGoPlusGeckoFixtures = async () => {
    console.log('🚀 Starting GoPlus and GeckoTerminal fixture collection...');
    
    // Test token address from existing fixtures
    const tokenAddress = '0xe8852d270294cc9a84fe73d5a434ae85a1c34444';
    const chainId = ChainsMap.bsc; // BSC chain
    
    console.log(`📊 Fetching data for token: ${tokenAddress} on chain: ${chainId}`);
    
    try {
        // Initialize services with their clients
        const goPlusClient = new GoPlusClient();
        const geckoTerminalClient = new GeckoTerminalApiClient();
        const goPlusService = new GoPlusService(goPlusClient);
        const geckoTerminalService = new GeckoTerminalService(geckoTerminalClient);
        
        // Create raw data instances with services
        const goPlusRawData = new GoPlusRawData(tokenAddress, chainId, undefined, goPlusService);
        const geckoTerminalRawData = new GeckoTerminalRawData(tokenAddress, chainId, undefined, geckoTerminalService);
        
        // Collect data from GoPlus
        console.log('⏳ Collecting GoPlus data...');
        await goPlusRawData.collect();
        
        // Collect data from GeckoTerminal
        console.log('⏳ Collecting GeckoTerminal data...');
        await geckoTerminalRawData.collect();
        
        // Get the raw data
        const goPlusData = goPlusRawData.toObject();
        const geckoTerminalData = geckoTerminalRawData.toObject();
        
        // Create base fixtures directory
        const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
        
        // Save GoPlus fixtures
        const goPlusDir = path.join(fixturesDir, 'goplus');
        await fs.promises.mkdir(goPlusDir, { recursive: true });
        
        if (goPlusData.tokenSecurity) {
            const tokenSecurityFile = path.join(goPlusDir, `tokenSecurity-${tokenAddress}.json`);
            await fs.promises.writeFile(
                tokenSecurityFile, 
                JSON.stringify(goPlusData.tokenSecurity, null, 2)
            );
            console.log(`✅ Saved GoPlus token security: ${tokenSecurityFile}`);
        }
        
        if (goPlusData.rugpullDetection) {
            const rugpullDetectionFile = path.join(goPlusDir, `rugpullDetection-${tokenAddress}.json`);
            await fs.promises.writeFile(
                rugpullDetectionFile, 
                JSON.stringify(goPlusData.rugpullDetection, null, 2)
            );
            console.log(`✅ Saved GoPlus rugpull detection: ${rugpullDetectionFile}`);
        }
        
        // Save GeckoTerminal fixtures
        const geckoTerminalDir = path.join(fixturesDir, 'gecko-terminal');
        await fs.promises.mkdir(geckoTerminalDir, { recursive: true });
        
        if (geckoTerminalData.tokenDetails) {
            const tokenDetailsFile = path.join(geckoTerminalDir, `tokenDetails-${tokenAddress}.json`);
            await fs.promises.writeFile(
                tokenDetailsFile, 
                JSON.stringify(geckoTerminalData.tokenDetails, null, 2)
            );
            console.log(`✅ Saved GeckoTerminal token details: ${tokenDetailsFile}`);
        }
        
        if (geckoTerminalData.tokenPools) {
            const tokenPoolsFile = path.join(geckoTerminalDir, `tokenPools-${tokenAddress}.json`);
            await fs.promises.writeFile(
                tokenPoolsFile, 
                JSON.stringify(geckoTerminalData.tokenPools, null, 2)
            );
            console.log(`✅ Saved GeckoTerminal token pools: ${tokenPoolsFile}`);
        }
        
        // Save combined raw data
        const combinedData = {
            goPlus: goPlusData,
            geckoTerminal: geckoTerminalData
        };
        
        const combinedFile = path.join(fixturesDir, 'goplus-gecko-combined.json');
        await fs.promises.writeFile(
            combinedFile, 
            JSON.stringify(combinedData, null, 2)
        );
        console.log(`✅ Saved combined data: ${combinedFile}`);
        
        console.log('🎉 GoPlus and GeckoTerminal fixture collection completed!');
        
    } catch (error) {
        console.error('❌ Error collecting fixtures:', error);
        throw error;
    }
};

// Run the script if called directly
if (require.main === module) {
    fetchGoPlusGeckoFixtures()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}
