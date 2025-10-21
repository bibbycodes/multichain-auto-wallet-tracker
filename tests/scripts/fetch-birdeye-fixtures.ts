import { BirdEyeClient } from "../../src/lib/services/apis/birdeye/client/index";
import { BirdeyeChain } from "../../src/lib/services/apis/birdeye/client/index";
import { writeFileSync } from "fs";
import { join } from "path";

// Use the same token address and chain as existing fixtures
const TOKEN_ADDRESS = "0xe8852d270294cc9a84fe73d5a434ae85a1c34444";
const CHAIN: BirdeyeChain = "bsc"; // BSC chain for this token
const OUTPUT_DIR = join(__dirname, "../fixtures/birdeye");

async function fetchBirdeyeFixtures() {
  const client = new BirdEyeClient();
  
  console.log(`Fetching Birdeye fixtures for token: ${TOKEN_ADDRESS} on chain: ${CHAIN}`);
  
  try {
    // Methods that take tokenAddress and chain
    const tokenMethods = [
      { name: "getTokenPrice", fn: () => client.getTokenPrice(TOKEN_ADDRESS, CHAIN) },
      { name: "getTopHolders", fn: () => client.getTopHolders(TOKEN_ADDRESS, 20, CHAIN) },
      { name: "getCreationData", fn: () => client.getCreationData(TOKEN_ADDRESS, CHAIN) },
      { name: "getTokenSecurity", fn: () => client.getTokenSecurity(TOKEN_ADDRESS, CHAIN) },
      { name: "getTokenMetadata", fn: () => client.getTokenMetadata(TOKEN_ADDRESS, CHAIN) },
      { name: "getTokenOverview", fn: () => client.getTokenOverview(TOKEN_ADDRESS, ['1h'], CHAIN) },
      { name: "getMarkets", fn: () => client.getMarkets(TOKEN_ADDRESS, { chain: CHAIN, limit: 10 }) },
    ];

    // Methods that don't take tokenAddress
    const generalMethods = [
      { name: "getTrendingTokens", fn: () => client.getTrendingTokens(10, 0, 'liquidity', CHAIN) },
      { name: "getTop100TrendingTokensByMarketCap", fn: () => client.getTop100TrendingTokensByMarketCap(CHAIN) },
      { name: "getTop100TrendingTokensByRank", fn: () => client.getTop100TrendingTokensByRank(CHAIN) },
    ];

    // Methods that need special parameters
    const specialMethods = [
      { 
        name: "getMultiplePrices", 
        fn: () => client.getMultiplePrices([TOKEN_ADDRESS], CHAIN) 
      },
      { 
        name: "getTokenPriceWithApiKey", 
        fn: () => client.getTokenPriceWithApiKey(TOKEN_ADDRESS, process.env.BIRD_EYE_API_KEY!, CHAIN) 
      },
      { 
        name: "getOhlcData", 
        fn: () => {
          const now = Math.floor(Date.now() / 1000);
          const oneHourAgo = now - 3600;
          return client.getOhlcData(TOKEN_ADDRESS, now, oneHourAgo, '1h', CHAIN);
        }
      },
      { 
        name: "getAllTimeHighForTokenAfterDate", 
        fn: () => {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return client.getAllTimeHighForTokenAfterDate(TOKEN_ADDRESS, oneDayAgo, new Date(), '1h', CHAIN);
        }
      },
      { 
        name: "getLargestMarketCapTokens", 
        fn: () => client.getLargestMarketCapTokens(10, 500, CHAIN) 
      },
      { 
        name: "getTradesBetweenDates", 
        fn: () => {
          const now = Math.floor(Date.now() / 1000);
          const oneHourAgo = now - 3600;
          return client.getTradesBetweenDates(TOKEN_ADDRESS, oneHourAgo, now, { chain: CHAIN });
        }
      },
      { 
        name: "getAllTradesBetweenDates", 
        fn: () => {
          const now = Math.floor(Date.now() / 1000);
          const oneHourAgo = now - 3600;
          return client.getAllTradesBetweenDates(TOKEN_ADDRESS, oneHourAgo, now, { chain: CHAIN });
        }
      },
      { 
        name: "getTradesSeekByTime", 
        fn: () => client.getTradesSeekByTime(TOKEN_ADDRESS, { chain: CHAIN }) 
      },
      { 
        name: "getWalletPnl", 
        fn: () => client.getWalletPnl("0x5c952063c7fc8610ffdb798152d69f0b9550762b", [TOKEN_ADDRESS], CHAIN) 
      },
      { 
        name: "getHistoricalPriceData", 
        fn: () => {
          const now = Date.now();
          const oneHourAgo = now - 60 * 60 * 1000;
          return client.getHistoricalPriceData(TOKEN_ADDRESS, oneHourAgo, now, '5m', CHAIN);
        }
      },
      { 
        name: "search", 
        fn: () => client.search("RUGSURVIVE", { chain: CHAIN, limit: 10 }) 
      },
    ];

    // Fetch all methods
    const allMethods = [...tokenMethods, ...generalMethods, ...specialMethods];

    for (const method of allMethods) {
      try {
        console.log(`Fetching ${method.name}...`);
        const data = await method.fn();
        
        // Handle null responses
        if (data === null) {
          console.log(`  ${method.name} returned null, skipping...`);
          continue;
        }

        // Write to file
        const filename = `${method.name}-${TOKEN_ADDRESS}.json`;
        const filepath = join(OUTPUT_DIR, filename);
        writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`  ✓ Saved to ${filename}`);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`  ✗ Error fetching ${method.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log("\n✅ Finished fetching Birdeye fixtures!");
  } catch (error) {
    console.error("Error fetching fixtures:", error);
  }
}

// Run the script
fetchBirdeyeFixtures().catch(console.error);
