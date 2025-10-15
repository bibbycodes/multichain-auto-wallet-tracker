
import { BirdEyeFetcherService } from "../apis/birdeye/birdeye-service";
import { ChainBaseService } from "../apis/chain-base/chain-base-service";
import { GmGnService } from "../apis/gmgn/gmgn-service";
export class TokenFetcher {
  constructor(
    private gmgnService: GmGnService,
    private chainBaseService: ChainBaseService,
    private birdEyeService: BirdEyeFetcherService
  ) {}
}

