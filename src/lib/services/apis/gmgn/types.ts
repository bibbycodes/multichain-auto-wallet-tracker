export interface GmgnResponse<T> {
    code: number;
    msg: string;
    data: T;
}

export interface SmartMoneyWalletData {
    twitter_bind: boolean;
    twitter_fans_num: number;
    twitter_username: string | null;
    twitter_name: string | null;
    ens: string | null;
    avatar: string | null;
    name: string | null;
    eth_balance: string;
    sol_balance: string;
    trx_balance: string;
    bnb_balance: string;
    balance: string;
    total_value: number;
    unrealized_profit: number;
    unrealized_pnl: number;
    realized_profit: number;
    pnl: number;
    pnl_1d: number;
    pnl_7d: number;
    pnl_30d: number;
    realized_profit_1d: number;
    realized_profit_7d: number;
    realized_profit_30d: number;
    winrate: number;
    all_pnl: number;
    total_profit: number;
    total_profit_pnl: number;
    buy_1d: number;
    sell_1d: number;
    buy_30d: number;
    sell_30d: number;
    buy_7d: number;
    sell_7d: number;
    buy: number;
    sell: number;
    history_bought_cost: number;
    token_avg_cost: number;
    token_sold_avg_profit: number;
    token_num: number;
    profit_num: number;
    pnl_lt_minus_dot5_num: number;
    pnl_minus_dot5_0x_num: number;
    pnl_lt_2x_num: number;
    pnl_2x_5x_num: number;
    pnl_gt_5x_num: number;
    last_active_timestamp: number;
    tags: string[];
    tag_rank: Record<string, number | null>;
    followers_count: number;
    is_contract: boolean;
    updated_at: number;
    refresh_requested_at: number | null;
    avg_holding_peroid: number;
    risk: {
        token_active: string;
        token_honeypot: string;
        token_honeypot_ratio: number;
        no_buy_hold: string;
        no_buy_hold_ratio: number;
        sell_pass_buy: string;
        sell_pass_buy_ratio: number;
        fast_tx: string;
        fast_tx_ratio: number;
    };
}

export interface NativeTransfer {
    name: string;
    from_address: string;
    timestamp: number;
}

export interface TagRank {
    [key: string]: number | null;
}

export interface TopTrader {
    address: string;
    account_address: string;
    addr_type: number;
    amount_cur: number;
    usd_value: number;
    cost_cur: number;
    sell_amount_cur: number;
    sell_amount_percentage: number;
    sell_volume_cur: number;
    buy_volume_cur: number;
    buy_amount_cur: number;
    netflow_usd: number;
    netflow_amount: number;
    buy_tx_count_cur: number;
    sell_tx_count_cur: number;
    wallet_tag_v2: string;
    eth_balance: string;
    sol_balance: string;
    trx_balance: string;
    balance: string;
    profit: number;
    realized_profit: number;
    profit_change: number;
    amount_percentage: number;
    unrealized_profit: number;
    unrealized_pnl: number;
    avg_cost: number;
    avg_sold: number;
    tags: string[];
    maker_token_tags: string[];
    name: string | null;
    avatar: string | null;
    twitter_username: string | null;
    twitter_name: string | null;
    tag_rank: TagRank;
    last_active_timestamp: number;
    created_at: number;
    accu_amount: number;
    accu_cost: number;
    cost: number;
    total_cost: number;
    transfer_in: boolean;
    is_new: boolean;
    native_transfer: NativeTransfer;
    is_suspicious: boolean;
    start_holding_at: number;
    end_holding_at: number | null;
} 

export interface TokenLockDetail {
    percent: string;
    pool: string;
    is_blackhole: boolean;
}

export interface TokenLockSummary {
    is_locked: boolean;
    lock_detail: TokenLockDetail[];
    lock_tags: null | string[];
    lock_percent: string;
    left_lock_percent: string;
}

export interface TokenSecurity {
    address: string;
    is_show_alert: boolean;
    top_10_holder_rate: string;
    burn_ratio: string;
    burn_status: string;
    dev_token_burn_amount: string;
    dev_token_burn_ratio: string;
    is_open_source: boolean;
    open_source: number;
    is_blacklist: boolean;
    blacklist: number;
    is_honeypot: boolean;
    honeypot: number;
    is_renounced: boolean;
    renounced: number;
    can_sell: number;
    can_not_sell: number;
    buy_tax: string;
    sell_tax: string;
    average_tax: string;
    high_tax: string;
    flags: string[];
    lockInfo: null | any;
    lock_summary: TokenLockSummary;
    hide_risk: boolean;
}

export interface TokenLaunchpad {
    address: string;
    launchpad: string;
    launchpad_status: number;
    launchpad_progress: string;
    description: string;
}

export interface TokenSecurityAndLaunchpad {
    address: string;
    security: TokenSecurity;
    launchpad: TokenLaunchpad;
}

export interface TokenInfo {
    address: string;
    token_address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo: string;
    price_change_6h: string;
    is_show_alert: boolean;
    is_honeypot: boolean;
}

export interface TokenHolding {
    token: TokenInfo;
    balance: string;
    usd_value: string;
    realized_profit_30d: string;
    realized_profit: string;
    realized_pnl: string;
    realized_pnl_30d: string;
    unrealized_profit: string;
    unrealized_pnl: string;
    total_profit: string;
    total_profit_pnl: string;
    avg_cost: string;
    avg_sold: string;
    buy_30d: number;
    sell_30d: number;
    sells: number;
    price: string;
    cost: string;
    position_percent: string;
    last_active_timestamp: number;
    history_sold_income: string;
    history_bought_cost: string;
    start_holding_at: string | null;
    end_holding_at: string | null;
    liquidity: string | null;
    total_supply: string;
    wallet_token_tags: string[] | null;
}

export interface WalletHoldings {
    holdings: TokenHolding[];
    next: string;
}

export interface TokenLockInfo {
    isLock: boolean;
    lockTag: string[];
    lockPercent: number;
    leftLockPercent: number;
}

export interface TrendingToken {
    id: number;
    chain: string;
    address: string;
    symbol: string;
    logo: string;
    price: string;
    price_change_percent: number;
    price_change_percent1m: number;
    price_change_percent5m: number;
    price_change_percent1h: number;
    swaps: number;
    volume: number;
    liquidity: number;
    market_cap: number;
    hot_level: number;
    call_number: number;
    smart_buy_24h: number;
    smart_sell_24h: number;
    pool_creation_timestamp: number;
    open_timestamp: number;
    holder_count: number;
    biggest_pool_address: string;
    total_supply: string;
    creation_timestamp: number;
    swaps_1h: number;
    price_1m: string;
    price_5m: string;
    price_1h: string;
    is_show_alert: boolean;
    buy_tax: string;
    sell_tax: string;
    is_honeypot: number;
    is_open_source: number;
    renounced: number;
    lockInfo: TokenLockInfo;
    top_10_holder_rate: string;
    twitter_username: string | null;
    website: string | null;
    telegram: string | null;
    buys: number;
    sells: number;
    initial_liquidity: number;
    creator_token_status: string;
    creator_close: boolean;
    rat_trader_amount_rate: number;
    launchpad: string;
    pool_type: number;
    pool_type_str: string;
    cto_flag: number;
    bluechip_owner_percentage: number;
    smart_degen_count: number;
    renowned_count: number;
}

export interface SolanaTrendingToken {
    id: number;
    chain: string;
    address: string;
    symbol: string;
    logo: string;
    price: number;
    price_change_percent: number;
    swaps: number;
    volume: number;
    liquidity: number;
    market_cap: number;
    hot_level: number;
    pool_creation_timestamp: number;
    holder_count: number;
    twitter_username: string | null;
    website: string | null;
    telegram: string | null;
    total_supply: number;
    open_timestamp: number;
    price_change_percent1m: number;
    price_change_percent5m: number;
    price_change_percent1h: number;
    buys: number;
    sells: number;
    initial_liquidity: number | null;
    is_show_alert: boolean;
    top_10_holder_rate: number;
    renounced_mint: number;
    renounced_freeze_account: number;
    burn_ratio: string;
    burn_status: string;
    launchpad: string;
    dev_token_burn_amount: string | null;
    dev_token_burn_ratio: string | null;
    dexscr_ad: number;
    dexscr_update_link: number;
    cto_flag: number;
    twitter_change_flag: number;
    creator_token_status: string;
    creator_close: boolean;
    launchpad_status: number;
    rat_trader_amount_rate: number;
    bluechip_owner_percentage: number;
    smart_degen_count: number;
    renowned_count: number;
    is_wash_trading: boolean;
}

export interface TrendingTokensResponse {
    rank: (TrendingToken | SolanaTrendingToken)[];
}

export interface TopBuyerStatusNow {
    hold: number;
    bought_more: number;
    sold_part: number;
    sold: number;
    transfered: number;
    bought_rate: string;
    holding_rate: string;
    smart_pos: any[];
    smart_count_hold: number | null;
    smart_count_bought_more: number | null;
    smart_count_sold_part: number | null;
    smart_count_sold: number | null;
    smart_count_transfered: number | null;
    top_10_holder_rate: number;
}

export interface TopBuyerInfo {
    status?: string;
    wallet_address: string;
    tags: string[];
    maker_token_tags: string[];
}

export interface TopBuyersHolders {
    chain: string;
    holder_count: number;
    statusNow: TopBuyerStatusNow;
    sold_diff: number;
    sold_part_diff: number;
    hold_diff: number;
    bought_more: number;
    holderInfo: TopBuyerInfo[];
}

export interface TopBuyersResponse {
    holders: TopBuyersHolders;
}

export interface TopHolder {
    address: string;
    account_address: string;
    addr_type: number;
    amount_cur: number;
    usd_value: number;
    cost_cur: number;
    sell_amount_cur: number;
    sell_amount_percentage: number;
    sell_volume_cur: number;
    buy_volume_cur: number;
    buy_amount_cur: number;
    netflow_usd: number;
    netflow_amount: number;
    buy_tx_count_cur: number;
    sell_tx_count_cur: number;
    wallet_tag_v2: string;
    eth_balance: string;
    sol_balance: string;
    trx_balance: string;
    balance: string;
    profit: number;
    realized_profit: number;
    unrealized_profit: number;
    profit_change: number | null;
    amount_percentage: number;
    avg_cost: number | null;
    avg_sold: number | null;
    tags: string[];
    maker_token_tags: string[];
    name: string | null;
    twitter_name: string | null;
    tag_rank: Record<string, number | null>;
    last_active_timestamp: number;
    accu_amount: number;
    accu_cost: number;
    cost: number;
    total_cost: number;
    transfer_in: boolean;
    is_new: boolean;
    native_transfer: {
        name: string | null;
        from_address: string | null;
        timestamp: number;
    };
    is_suspicious: boolean;
}