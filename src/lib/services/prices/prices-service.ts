import { ChainId } from "../../../shared/chains";
import { AutoTrackerToken } from "../../models/token";
import { BirdEyeFetcherService } from "../apis/birdeye/birdeye-service";
import { PricesAndMarketCapsMap } from "./types";

export class PricesService {
    constructor(
        private readonly birdeyeService: BirdEyeFetcherService = new BirdEyeFetcherService(),
    ) {
    }

    async getManyPricesAndMarketCaps(tokens: AutoTrackerToken[], chainId: ChainId): Promise<PricesAndMarketCapsMap> {
        if (tokens.length === 0) {
            return {};
        }
        const prices = await this.birdeyeService.getManyPrices(tokens.map(t => t.address), chainId);
        return tokens.reduce((acc, token) => {
            const price = prices[token.address];
            if (price) {
                acc[token.address] = {
                    price,
                    marketCap: token.calculateMarketCap(price),
                };
            }
            return acc;
        }, {} as PricesAndMarketCapsMap);
    }
}