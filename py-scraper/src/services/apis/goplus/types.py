from typing import Dict, Optional, TypedDict

class TokenSecurityInfo(TypedDict, total=False):
    is_open_source: int
    is_proxy: int
    is_mintable: int
    owner_change_balance: int
    hidden_owner: int
    selfdestruct: int
    external_call: int
    can_take_back_ownership: int
    owner_address: str
    creator_address: str
    creator_balance: str
    owner_balance: str
    total_supply: str
    holder_count: int
    is_honeypot: int
    buy_tax: int
    sell_tax: int
    cannot_buy: int
    cannot_sell_all: int
    slippage_modifiable: int
    is_anti_whale: int
    trust_list: int
    dex: list
    holder_count_total: int
    lp_holder_count: int
    lp_total_supply: str
    lp_holders: list
    owner_percent: float
    creator_percent: float
    is_true_token: int
    is_airdrop_scam: int
    is_anti_whale_modifiable: int
    trading_cooldown: int
    personal_slippage_modifiable: int
    is_blacklisted: int
    is_whitelisted: int
    is_in_dex: int
    is_true_nft: int
    other_potential_risks: str
    contract_source_code: str
    is_wrapped_token: int

class TokenSecurityResponse(TypedDict):
    code: int
    message: str
    result: Dict[str, TokenSecurityInfo]

class SolanaTokenSecurityInfo(TypedDict, total=False):
    mint: str
    token_authority: Optional[str]
    freeze_authority: Optional[str]
    decimals: int
    supply: str
    is_mint_fixed: bool
    owner_address: str
    owner_balance: str
    creator_address: str
    creator_balance: str
    holder_count: int
    holder_count_total: int
    is_true_token: int
    trust_list: int
    dex: list
    owner_percent: float
    creator_percent: float
    is_airdrop_scam: int
    other_potential_risks: str

class SolanaTokenSecurityResponse(TypedDict):
    code: int
    message: str
    result: Dict[str, SolanaTokenSecurityInfo] 