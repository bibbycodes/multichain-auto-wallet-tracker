import { ChainId } from "../../../../shared/chains";
import { CHAIN_ID_TO_GECKO_TERMINAL_CHAIN_ID, GECKO_TERMINAL_CHAIN_ID_TO_CHAIN_ID, GeckoTerminalChain } from "./gecko-terminal-chain-map";
import { GeckoTerminalTokenDetails, Pool } from "python-proxy-scraper-client";
import { SocialMedia } from "../../../models/socials/types";

export class GeckoTerminalMapper {
    static chainIdToGeckoTerminalChainId(chainId: ChainId): GeckoTerminalChain {
        return CHAIN_ID_TO_GECKO_TERMINAL_CHAIN_ID[chainId]
    }

    static geckoTerminalChainIdToChainId(geckoTerminalChainId: GeckoTerminalChain): ChainId {
        return GECKO_TERMINAL_CHAIN_ID_TO_CHAIN_ID[geckoTerminalChainId]
    }

    // Data extraction methods
    static extractPrice(tokenDetails: GeckoTerminalTokenDetails): number | null {
        const price = parseFloat(tokenDetails.attributes.price_usd);
        return isNaN(price) ? null : price;
    }

    static extractMarketCap(tokenDetails: GeckoTerminalTokenDetails): number | null {
        const marketCap = parseFloat(tokenDetails.attributes.market_cap_usd);
        return isNaN(marketCap) ? null : marketCap;
    }

    static extractLiquidity(tokenDetails: GeckoTerminalTokenDetails): number | null {
        const liquidity = parseFloat(tokenDetails.attributes.total_reserve_in_usd);
        return isNaN(liquidity) ? null : liquidity;
    }

    static extractSupply(tokenDetails: GeckoTerminalTokenDetails): number | null {
        const supply = parseFloat(tokenDetails.attributes.total_supply);
        return isNaN(supply) ? null : supply;
    }

    static extractDecimals(tokenDetails: GeckoTerminalTokenDetails): number | null {
        return tokenDetails.attributes.decimals;
    }

    static extractName(tokenDetails: GeckoTerminalTokenDetails): string | null {
        return tokenDetails.attributes.name || null;
    }

    static extractSymbol(tokenDetails: GeckoTerminalTokenDetails): string | null {
        return tokenDetails.attributes.symbol || null;
    }

    static extractLogoUrl(tokenDetails: GeckoTerminalTokenDetails): string | null {
        // GeckoTerminal doesn't provide logo URL in token details
        return null;
    }

    static extractDescription(tokenDetails: GeckoTerminalTokenDetails): string | null {
        // GeckoTerminal doesn't provide description in token details
        return null;
    }

    static extractSocials(tokenDetails: GeckoTerminalTokenDetails): SocialMedia | null {
        // GeckoTerminal doesn't provide socials in token details
        return null;
    }

    static extractCreatedBy(tokenDetails: GeckoTerminalTokenDetails): string | null {
        // GeckoTerminal doesn't provide creator information
        return null;
    }

    static extractPairAddress(tokenPools: Pool[]): string | null {
        if (tokenPools.length === 0) {
            return null;
        }

        if (tokenPools.length === 1) {
            return tokenPools[0].id;
        }

        // Find the pool with the highest 24-hour volume
        let highestVolumePool = tokenPools[0];
        let highestVolume = 0;

        for (const pool of tokenPools) {
            const volume24h = parseFloat(pool.attributes.volume_usd.h24);
            if (!isNaN(volume24h) && volume24h > highestVolume) {
                highestVolume = volume24h;
                highestVolumePool = pool;
            }
        }

        return highestVolumePool.id;
    }
}