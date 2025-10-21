import { TrackedWalletType } from "@prisma/client";
import { ChainId } from "shared/chains";

export interface TrackedWalletData {
    id?: string;
    address: string;
    walletId?: string;
    chainId: ChainId;
    createdAt?: Date;
    updatedAt?: Date;
    types: TrackedWalletType[];
}

export interface WalletData {
    id?: string;
    address: string;
    chainId: ChainId;
    createdAt?: Date;
    updatedAt?: Date;
}