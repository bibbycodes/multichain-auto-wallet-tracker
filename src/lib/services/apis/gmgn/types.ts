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
interface NativeTransfer {
    name: string;
    from_address: string;
    timestamp: number;
}

interface TagRank {
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