export interface TokenSecurityResponse {
    code: number;
    message: string;
    result: {
        [tokenAddress: string]: TokenSecurityInfo;
    };
}

export interface TokenSecurityInfo {
    token_name: string;
    token_symbol: string;
    total_supply: string;
    owner_address: string;
    owner_balance: string;
    owner_change_balance: string;
    owner_percent: string;
    personal_slippage_modifiable: string;
    selfdestruct: string;
    sell_tax: string;
    slippage_modifiable: string;
    trading_cooldown: string;
    transfer_pausable: string;
    trust_list: string;
    lp_total_supply: string;
    holder_list: Array<{
        address: string;
        tag: string;
        value: string;
        is_contract: number;
        balance: string;
        percent: string;
        NFT_list?: Array<{
            value: string;
            NFT_id: string;
            amount: string;
            in_effect: string;
            NFT_percentage: string;
        }>;
        is_locked: number;
    }>;
}

export interface SolanaTokenSecurityResponse {
    code: number;
    message: string;
    result: {
        [tokenAddress: string]: SolanaTokenSecurityInfo;
    };
}

interface AuthorityStatus {
    authority: Array<{
        address?: string;
        malicious_address?: number;
    }>;
    status: string;
}

interface DexTimeframe {
    price_max: string;
    price_min: string;
    volume: string;
}

interface DexInfo {
    day: DexTimeframe;
    dex_name: string;
    fee_rate: string;
    id: string;
    lp_amount: string | null;
    month: DexTimeframe;
    open_time: string;
    price: string;
    tvl: string;
    type: string;
    week: DexTimeframe;
}

interface Holder {
    account: string;
    balance: string;
    is_locked: number;
    locked_detail: any[];
    percent: string;
    tag: string;
    token_account: string;
}

interface Metadata {
    description: string;
    name: string;
    symbol: string;
    uri: string;
}

export interface SolanaTokenSecurityInfo {
    balance_mutable_authority: AuthorityStatus;
    closable: AuthorityStatus;
    creators: any[];
    default_account_state: string;
    default_account_state_upgradable: AuthorityStatus;
    dex: DexInfo[];
    freezable: AuthorityStatus;
    holder_count: string;
    holders: Holder[];
    lp_holders: any[];
    metadata: Metadata;
    metadata_mutable: {
        metadata_upgrade_authority: Array<{
            address: string;
            malicious_address: number;
        }>;
        status: string;
    };
    mintable: AuthorityStatus;
    non_transferable: string;
    total_supply: string;
    transfer_fee: Record<string, never>;
    transfer_fee_upgradable: AuthorityStatus;
    transfer_hook: any[];
    transfer_hook_upgradable: AuthorityStatus;
    trusted_token: number;
} 