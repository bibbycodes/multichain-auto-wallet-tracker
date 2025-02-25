import {ChainId} from "../../shared/chains";

export interface Wallet {
  address: string;
  chainId: ChainId;
}

export enum WalletType {
  institution = 'institution',
  normal = 'normal',
  protocol = 'protocol',
  contract = 'contract',
  bot = 'bot',
}

export interface Balance {
  chainId: ChainId;
  tokenAddress: string;
  balance: number;
  isNativeToken: boolean;
}

export interface WalletEvaluation {
  isWhale: boolean;
  associatedWithRugs: boolean;
  associatedWithHoneyPots: boolean;
  associatedWithScams: boolean;
  isDev: boolean;
}

export interface TokenSafetyEvaluation {
  liquidityBurned: boolean;
  mintable: boolean;
  freezable: boolean;
  buyTax: number;
  sellTax: number;
  maliciousCreator: boolean;
  antiWhale: boolean;
  sellable: boolean;
  buyable: boolean;
  creatorAddress: string;
  creatorPercentage: number;
  hiddenOwner: boolean;
  hasWhitelist: boolean;
  hasBlacklist: boolean;
  ownerCanModifyBalances: boolean;
  pausable: boolean;
  isOnTrustList: boolean;
}


// Wallet check pipeline
// 1) Multichain balance
// 2) Wallet evaluation, is this wallet associated with scams
// 3) Does the wallet trade
// 4) is institution
