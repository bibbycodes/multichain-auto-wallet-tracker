from typing import TypeVar, Generic, List, Dict, Any, Optional, Union, Literal
from dataclasses import dataclass
from enum import Enum

T = TypeVar('T')

@dataclass
class GmgnResponse(Generic[T]):
    code: int
    msg: Optional[str]
    data: Optional[T]

@dataclass
class SmartMoneyWalletData:
    # Add fields based on the API response
    pass

@dataclass
class TopTrader:
    # Add fields based on the API response
    pass

@dataclass
class TokenSecurityAndLaunchpad:
    # Add fields based on the API response
    pass

@dataclass
class WalletHoldings:
    # Add fields based on the API response
    pass

@dataclass
class TrendingToken:
    id: str
    chain: str
    address: str
    symbol: str
    logo: str
    price: float
    price_change_percent: float
    swaps: int
    volume: float
    liquidity: float
    market_cap: float

@dataclass
class SolanaTrendingToken(TrendingToken):
    renounced_mint: bool
    total_supply: float
    top_10_holder_rate: float

@dataclass
class TrendingTokensResponse:
    rank: List[Union[TrendingToken, SolanaTrendingToken]]

@dataclass
class TopBuyerStatusNow:
    price: float
    market_cap: float
    holders: int

@dataclass
class TopBuyerInfo:
    address: str
    buy_amount: float
    buy_time: str
    profit: float
    profit_rate: float

@dataclass
class TopBuyersHolders:
    address: str
    balance: float
    balance_rate: float
    tx_count: int

@dataclass
class TopBuyersResponse:
    status_now: TopBuyerStatusNow
    top_buyers: List[TopBuyerInfo]
    holders: List[TopBuyersHolders]

@dataclass
class TopHolder:
    address: str
    balance: float
    balance_rate: float
    tx_count: int 