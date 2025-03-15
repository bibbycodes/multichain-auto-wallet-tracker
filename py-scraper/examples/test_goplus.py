from src.services.apis.goplus.client import GoPlusClient

def main():
    client = GoPlusClient()
    
    # Test EVM token security (using USDT on Ethereum)
    eth_usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    evm_result = client.get_evm_token_security(1, eth_usdt)
    print("EVM Token Security Result:")
    print(evm_result)
    print("\n" + "-"*50 + "\n")

    # Test Solana token security (using USDC on Solana)
    sol_usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    solana_result = client.get_solana_token_security(sol_usdc)
    print("Solana Token Security Result:")
    print(solana_result)

if __name__ == "__main__":
    main() 