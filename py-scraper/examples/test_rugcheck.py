import json
from src.services.apis.rugcheck import RugCheckClient

def main():
    # Initialize the client
    client = RugCheckClient()
    
    # Example Solana token address (Ceazer token)
    token_address = "8KDMkrHUjDG5dwjs2CrnNQy65DkZS7v186YQKMAxZD97"
    
    try:
        # Get token report
        report = client.get_token_report(token_address)
        
        # Print key information
        print("\nToken Information:")
        print(f"Name: {report['tokenMeta']['name']}")
        print(f"Symbol: {report['tokenMeta']['symbol']}")
        print(f"Total Supply: {report['token']['supply']}")
        print(f"Decimals: {report['token']['decimals']}")
        print(f"Total Holders: {report['totalHolders']}")
        print(f"Current Price: {report['price']}")
        print(f"Total Market Liquidity: ${report['totalMarketLiquidity']}")
        
        print("\nTop 5 Holders:")
        for holder in report['topHolders'][:5]:
            print(f"Address: {holder['owner']}")
            print(f"Amount: {holder['uiAmount']} ({holder['pct']}%)")
            print("---")
        
        print("\nRisk Assessment:")
        print(f"Score: {report['score']}")
        print(f"Normalized Score: {report['score_normalised']}")
        print(f"Is Rugged: {report['rugged']}")
        
        if report['risks']:
            print("\nRisk Factors:")
            for risk in report['risks']:
                print(f"- {risk['name']}: {risk['description']} (Score: {risk['score']})")
        
        # Save full response to file for reference
        with open('rugcheck_response.json', 'w') as f:
            json.dump(report, f, indent=2)
            print("\nFull response saved to rugcheck_response.json")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 