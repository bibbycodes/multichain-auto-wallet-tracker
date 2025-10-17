import { ChainId } from "../../../shared/chains";

export interface ParsedBscscanAddressUrlData {
    address: string;
    chainId: ChainId;
}

export interface ParsedBscscanTokenUrlData {
    tokenAddress: string;
    chainId: ChainId;
}

