export interface MoralisWebhook {
  confirmed:         boolean;
  chainId:           string;
  abi:               ABIItem[];
  streamId:          string;
  tag:               string;
  retries:           number;
  block:             Block;
  logs:              any[];
  txs:               Tx[];
  txsInternal:       any[];
  erc20Transfers:    any[];
  erc20Approvals:    any[];
  nftTokenApprovals: any[];
  nftApprovals:      NftApprovals;
  nftTransfers:      any[];
  nativeBalances:    any[];
}

export interface ABIItem {
  anonymous: boolean;
  inputs:    Input[];
  name:      string;
  type:      string;
}

export interface Input {
  indexed:      boolean;
  internalType: string;
  name:         string;
  type:         string;
}

export interface Block {
  number:    string;
  hash:      string;
  timestamp: string;
}

export interface NftApprovals {
  ERC721:  any[];
  ERC1155: any[];
}

export interface Tx {
  hash:                     string;
  gas:                      string;
  gasPrice:                 string;
  nonce:                    string;
  input:                    string;
  transactionIndex:         string;
  fromAddress:              string;
  toAddress:                string;
  value:                    string;
  type:                     string;
  v:                        string;
  r:                        string;
  s:                        string;
  receiptCumulativeGasUsed: string;
  receiptGasUsed:           string;
  receiptContractAddress:   null;
  receiptRoot:              null;
  receiptStatus:            string;
  triggered_by:             string[];
}
