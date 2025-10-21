import { GmGnService } from "../../src/lib/services/apis/gmgn/gmgn-service";
import { ChainId } from "../../src/shared/chains";
import { writeFileSync } from "fs";
import { join } from "path";

// Use the same token address and chain as existing fixtures
const TOKEN_ADDRESS = "0xe6df05ce8c8301223373cf5b969afcb1498c5528";
const CHAIN_ID: ChainId = "56"; // BSC chain for this token
const WALLET_ADDRESS = "0x5c952063c7fc8610ffdb798152d69f0b9550762b"; // From existing fixtures
const OUTPUT_DIR = join(__dirname, "../fixtures/gmgn");

async function fetchGmgnFixtures() {
  const service = new GmGnService();
  
  console.log(`Fetching GMGN fixtures for token: ${TOKEN_ADDRESS} on chain: ${CHAIN_ID}`);
  
  try {
    // Methods that take tokenAddress and chainId
    const tokenMethods = [
      { name: "getTokenSecurityAndLaunchpad", fn: () => service.getTokenSecurityAndLaunchpad(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "getPartialSecurityValues", fn: () => service.getPartialSecurityValues(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "getTopTraders", fn: () => service.getTopTraders(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "getHolders", fn: () => service.getHolders(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "getMultiWindowTokenInfo", fn: () => service.getMultiWindowTokenInfo(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "getTokenAndSocialsByTokenAddressAndChainId", fn: () => service.getTokenAndSocialsByTokenAddressAndChainId(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "fetchTokenWithMarketCap", fn: () => service.fetchTokenWithMarketCap(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "fetchTokenData", fn: () => service.fetchTokenData(TOKEN_ADDRESS, CHAIN_ID) },
      { name: "getTokenSocials", fn: () => service.getTokenSocials(TOKEN_ADDRESS, CHAIN_ID) },
    ];

    // Methods that take only tokenAddress
    const tokenOnlyMethods = [
      { name: "getTokenAndSocialsByTokenAddress", fn: () => service.getTokenAndSocialsByTokenAddress(TOKEN_ADDRESS) },
      { name: "getTokenAndChainId", fn: () => service.getTokenAndChainId(TOKEN_ADDRESS) },
    ];

    // Methods that take chainId only
    const chainOnlyMethods = [
      { name: "getTrendingTokens", fn: () => service.getTrendingTokens(CHAIN_ID, '1h') },
    ];

    // Methods that take walletAddress and chainId
    const walletMethods = [
      { name: "getWalletData", fn: () => service.getWalletData(WALLET_ADDRESS, CHAIN_ID) },
      { name: "getWalletHoldings", fn: () => service.getWalletHoldings(WALLET_ADDRESS, CHAIN_ID) },
    ];

    // Fetch all methods
    const allMethods = [...tokenMethods, ...tokenOnlyMethods, ...chainOnlyMethods, ...walletMethods];

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
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`  ✗ Error fetching ${method.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log("\n✅ Finished fetching GMGN fixtures!");
  } catch (error) {
    console.error("Error fetching fixtures:", error);
  }
}

// Run the script
fetchGmgnFixtures().catch(console.error);
