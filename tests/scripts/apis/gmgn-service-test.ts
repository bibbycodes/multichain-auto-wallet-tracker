import { GmGnService } from "../../../src/lib/services/apis/gmgn/gmgn-service";

async function testGmGnService() {
    const gmgnService = GmGnService.getInstance();
    // Using a known BSC token address for testing
    const tokenAddress = '0x44443dd87EC4d1bEa3425AcC118Adb023f07F91b';
    
    // Fallback to a known working token if the first one fails
    const fallbackTokenAddress = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC

    console.log(`\n🔍 Testing GmGn Service for token: ${tokenAddress}\n`);
    console.log(`(Will fallback to ${fallbackTokenAddress} if not found)\n`);

    try {
        // Test 1: Get token and chain ID
        console.log('Test 1: Getting token and chain ID...');
        let testAddress = tokenAddress;
        let result;
        
        try {
            result = await gmgnService.getTokenAndChainId(tokenAddress);
        } catch (error) {
            console.log(`⚠️ Token ${tokenAddress} not found, trying fallback...`);
            testAddress = fallbackTokenAddress;
            result = await gmgnService.getTokenAndChainId(fallbackTokenAddress);
        }
        
        const { token, chainId } = result;
        console.log('✅ Token found on chain:', chainId);
        console.log('Token details:', {
            name: token.name,
            symbol: token.symbol,
            address: token.address,
            price: token.price.price,
            marketCap: token.price,
            liquidity: token.liquidity,
        });

        // Test 2: Get token with socials
        console.log('\nTest 2: Getting token with socials...');
        const { token: tokenWithSocials, socials, chainId: detectedChainId } = 
            await gmgnService.getTokenAndSocialsByTokenAddress(testAddress);
        console.log('✅ Token with socials retrieved');
        console.log('Socials:', {
            twitter: socials.link.twitter_username,
            telegram: socials.link.telegram,
            website: socials.link.website,
            description: socials.link.description?.substring(0, 100) + '...',
        });

        // Test 3: Get token with market cap
        console.log('\nTest 3: Getting token with market cap...');
        const tokenWithMarketCap = await gmgnService.fetchTokenWithMarketCap(tokenAddress, chainId);
        console.log('✅ Token with market cap retrieved');
        console.log('Market data:', {
            name: tokenWithMarketCap.name,
            symbol: tokenWithMarketCap.symbol,
            price: tokenWithMarketCap.price,
            marketCap: tokenWithMarketCap.marketCap,
            liquidity: tokenWithMarketCap.liquidity,
        });

        // Test 4: Get security info
        console.log('\nTest 4: Getting security info...');
        const securityInfo = await gmgnService.getPartialSecurityValues(tokenAddress, chainId);
        console.log('✅ Security info retrieved');
        console.log('Security:', {
            isHoneypot: securityInfo.isHoneypot,
            isMintable: securityInfo.isMintable,
            isFreezable: securityInfo.isFreezable,
            isLpTokenBurned: securityInfo.isLpTokenBurned,
            buyTax: securityInfo.buyTax,
            sellTax: securityInfo.sellTax,
            isBlacklist: securityInfo.isBlacklist,
        });

        // Test 5: Get top holders
        console.log('\nTest 5: Getting top holders...');
        const topHolders = await gmgnService.getHolders(tokenAddress, chainId);
        console.log(`✅ Retrieved ${topHolders.length} top holders`);
        if (topHolders.length > 0) {
            console.log('First holder:', {
                address: topHolders[0].address,
                balance: topHolders[0].amount_cur,
            });
        }

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

testGmGnService().catch(console.error);

