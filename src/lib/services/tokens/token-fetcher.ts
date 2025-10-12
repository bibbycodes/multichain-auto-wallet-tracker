import { BirdEyeService } from "../apis/birdeye/birdeye-service";
import { ChainBaseService } from "../apis/chain-base/chain-base-service";
import { CoingeckoService } from "../apis/coingecko/coingecko-service";
import { GmGnService } from "../apis/gmgn/gmgn-service";
export class TokenFetcher {
  constructor(
    private gmgnService: GmGnService,
    private chainBaseService: ChainBaseService,
    private coinGeckoService: CoingeckoService,
    private birdEyeService: BirdEyeService
  ) {}

  async fetchTokens() {
    const tokens = await this.gmgnService.getTokens()
  }
}

