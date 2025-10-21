import { GmGnTokenSecurityAndLaunchpad } from "python-proxy-scraper-client";
import { SolanaTokenSecurityInfo, TokenSecurityInfo } from "../apis/goplus/types";
import { ChainId } from "shared/chains";

export interface GetTokenSecurityParams {
    tokenAddress: string;
    chainId: ChainId;
    goPlusTokenSecurity?: TokenSecurityInfo | SolanaTokenSecurityInfo;
    gmgnTokenSecurity?: GmGnTokenSecurityAndLaunchpad;
}