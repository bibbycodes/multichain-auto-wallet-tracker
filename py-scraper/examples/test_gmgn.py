from src.services.apis.gmgn.gmgn_client import GmgnClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test addresses
BSC_TOKEN_ADDRESS = "0x5c85d6c6825ab4032337f11ee92a72df936b46f6"  # BSC USDT
BSC_WALLET_ADDRESS = "0x6abe9fe208ff4b9850361654eb80541f8b12262a"  # Binance Hot Wallet
SOL_TOKEN_ADDRESS = "J3TqbUgHurQGNxWtT88UQPcMNVmrL875pToQZdrkpump"  # USDC
SOL_WALLET_ADDRESS = "5DptcH57MrUjz8qEWTWdjkh7PoeMsD1jTS1vsbToqZic"  # Large SOL holder

def main():
    try:
        client = GmgnClient()
        
        # Test getting trending tokens
        logger.info("Testing get_trending_tokens...")
        trending = client.get_trending_tokens('bsc', '1h')
        logger.info(f"Found {len(trending.rank)} trending tokens")
        
        # Test getting top traders
        logger.info(f"Testing get_top_traders...")
        top_traders = client.get_top_traders(BSC_TOKEN_ADDRESS, 'bsc')
        logger.info(f"Found {len(top_traders)} top traders")
        
        # Test getting token security info
        logger.info(f"Testing get_token_security_and_launchpad...")
        security_info = client.get_token_security_and_launchpad(BSC_TOKEN_ADDRESS, 'bsc')
        logger.info(f"Got security info: {security_info}")
        
        # Test getting top buyers
        logger.info(f"Testing get_top_buyers...")
        top_buyers = client.get_top_buyers(BSC_TOKEN_ADDRESS, 'bsc')
        logger.info(f"Found {len(top_buyers['holders'])} top buyers")
        
        # Test getting top holders
        logger.info(f"Testing get_top_holders...")
        top_holders = client.get_top_holders(BSC_TOKEN_ADDRESS, 'bsc')
        logger.info(f"Found {len(top_holders)} top holders")
        
        # Test wallet-specific endpoints
        logger.info(f"Testing wallet endpoints...")
        
        # Test getting smart money wallet data
        smart_money = client.get_smart_money_wallet_data(BSC_WALLET_ADDRESS, 'bsc')
        logger.info(f"Got smart money data")
        
        # Test getting wallet holdings
        holdings = client.get_wallet_holdings(BSC_WALLET_ADDRESS, 'bsc')
        logger.info(f"Got wallet holdings")
        
        # Test Solana endpoints
        logger.info("Testing Solana endpoints...")
        sol_trending = client.get_trending_tokens('sol', '1h')
        logger.info(f"Found {len(sol_trending.rank)} Solana trending tokens")
        
        sol_holdings = client.get_wallet_holdings(SOL_WALLET_ADDRESS, 'sol')
        logger.info(f"Got Solana wallet holdings")
        
        logger.info("All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during testing: {str(e)}")
        raise

if __name__ == "__main__":
    main()