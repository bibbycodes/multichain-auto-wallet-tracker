from .types import Chain, ChainId

def chain_id_to_chain(chain_id: ChainId) -> str:
    """Convert a chain ID to its corresponding chain name."""
    chain_map = {
        ChainId.BSC: Chain.BSC,
        ChainId.SOLANA: Chain.SOLANA
    }
    
    if chain_id not in chain_map:
        raise ValueError(f"Unsupported chain ID: {chain_id}")
    
    return chain_map[chain_id].value 