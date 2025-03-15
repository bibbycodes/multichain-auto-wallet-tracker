from fastapi import APIRouter, HTTPException
from src.services.apis.rugcheck import RugCheckClient

router = APIRouter(prefix="/rugcheck", tags=["rugcheck"])
client = RugCheckClient()

@router.get("/tokens/{token_address}/report")
def get_token_report(token_address: str):
    """Get detailed report for a Solana token"""
    try:
        return client.get_token_report(token_address)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 