from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
import sys
from pathlib import Path
from src.services.apis.gmgn.gmgn_client import GmgnClient

# Add src directory to Python path
src_dir = str(Path(__file__).resolve().parent.parent)
if src_dir not in sys.path:
    sys.path.append(src_dir)


router = APIRouter(prefix="/gmgn", tags=["gmgn"])
gmgn_client = GmgnClient()

@router.get("/smart-money/{chain}/{wallet_address}")
async def get_smart_money_wallet_data(chain: str, wallet_address: str):
    """Get smart money wallet data for a specific address."""
    try:
        return gmgn_client.get_smart_money_wallet_data(wallet_address, chain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-traders/{chain}/{token_address}")
async def get_top_traders(chain: str, token_address: str):
    """Get top traders for a specific token."""
    try:
        return gmgn_client.get_top_traders(token_address, chain)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/token-security/{chain}/{token_address}")
async def get_token_security(chain: str, token_address: str):
    """Get token security and launchpad information."""
    try:
        return gmgn_client.get_token_security_and_launchpad(token_address, chain)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wallet-holdings/{chain}/{wallet_address}")
async def get_wallet_holdings(chain: str, wallet_address: str):
    """Get wallet holdings for a specific address."""
    try:
        return gmgn_client.get_wallet_holdings(wallet_address, chain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending/{chain}")
async def get_trending_tokens(chain: str, timeframe: Optional[str] = "1h"):
    """Get trending tokens with optional timeframe (1h or 24h)."""
    try:
        return gmgn_client.get_trending_tokens(chain, timeframe)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-buyers/{chain}/{token_address}")
async def get_top_buyers(chain: str, token_address: str):
    """Get top buyers for a specific token."""
    try:
        return gmgn_client.get_top_buyers(token_address, chain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-holders/{chain}/{token_address}")
async def get_top_holders(chain: str, token_address: str):
    """Get top holders for a specific token."""
    try:
        return gmgn_client.get_top_holders(token_address, chain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 