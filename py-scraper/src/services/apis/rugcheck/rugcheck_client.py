from typing import Dict
from src.proxy_fetchers.geonode.geonode_fetcher import GeonodeFetcher
from src.proxy_fetchers.geonode.utils import get_random_proxy_options

class RugCheckClient:
    def __init__(self):
        self.base_url = "https://api.rugcheck.xyz/v1"
        self.geonode_client = GeonodeFetcher()

    def _get_headers(self) -> Dict[str, str]:
        return {
            "accept": "application/json",
            "content-type": "application/json"
        }

    def get_token_report(self, token_address: str) -> Dict:
        """
        Get detailed report for a Solana token
        
        Args:
            token_address: The Solana token address/mint to get report for
            
        Returns:
            dict: Token report data including risks, holders, markets etc.
            
        Raises:
            Exception: If the request fails or returns invalid data
        """
        url = f"{self.base_url}/tokens/{token_address}/report"
        
        response = self.geonode_client.get(
            url,
            headers=self._get_headers(),
            proxy_options=get_random_proxy_options()
        )

        if not response.ok:
            raise Exception(f"Request failed with status {response.status_code}")

        return response.json() 