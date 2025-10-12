import { SocialMedia } from "../../../models/socials/types";

export interface WalletAnalysis {
  address: string;
  totalDollarValue: number;
  pnl: number;
  winRate: number;
  tokenRelations?: WalletTokenRelations;
  socialMedia?: SocialMedia;
}

export enum WalletTokenRelationType {
  TOP_HOLDER = "TOP_HOLDER",
  EARLY_BUYER = "EARLY_BUYER",
  TOP_TRADER = "TOP_TRADER",
  RUG_PULLER = "RUG_PULLER",
}

export type WalletTokenRelations = {
  [key in WalletTokenRelationType]: string[];
};
