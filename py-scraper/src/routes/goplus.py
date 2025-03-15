from fastapi import APIRouter, HTTPException
from src.services.apis.goplus.client import GoPlusClient

router = APIRouter(
    prefix="/goplus",
    tags=["goplus"],
    responses={404: {"description": "Not found"}},
)

goplus_client = GoPlusClient()

@router.get("/evm/{chain_id}/tokens/{token_address}/security")
async def get_evm_token_security(chain_id: int, token_address: str):
    """
    Get security information for an EVM token
    
    Args:
        chain_id: The chain ID (e.g., 1 for Ethereum)
        token_address: The token contract address
        
    Returns:
        Token security information from GoPlus Labs API
    """
    try:
        result = goplus_client.get_evm_token_security(chain_id, token_address)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No security information found for token {token_address} on chain {chain_id}"
            )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching EVM token security info: {str(e)}"
        )

@router.get("/solana/tokens/{token_address}/security")
async def get_solana_token_security(token_address: str):
    """
    Get security information for a Solana token
    
    Args:
        token_address: The token mint address
        
    Returns:
        Token security information from GoPlus Labs API
    """
    try:
        result = goplus_client.get_solana_token_security(token_address)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No security information found for Solana token {token_address}"
            )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching Solana token security info: {str(e)}"
        )

@router.get("/address/{address}/security")
async def get_address_security(address: str):
    """
    Get security information for a wallet address
    
    Args:
        address: The wallet address to check
        
    Returns:
        Address security information from GoPlus Labs API
    """
    try:
        result = goplus_client.get_address_security(address)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching address security info: {str(e)}"
        )

@router.get("/rugpull/{chain_id}/tokens/{token_address}")
async def get_rugpull_detection(chain_id: int, token_address: str):
    """
    Get rugpull detection information for a specific chain and token
    
    Args:
        chain_id: The chain ID (e.g., 1 for Ethereum)
        token_address: The token contract address to check
        
    Returns:
        Rugpull detection information from GoPlus Labs API
    """
    try:
        result = goplus_client.get_rugpull_detection(chain_id, token_address)
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No rugpull detection information found for token {token_address} on chain {chain_id}"
            )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching rugpull detection info: {str(e)}"
        ) 