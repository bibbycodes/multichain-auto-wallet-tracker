from typing import Dict
from src.proxy_fetchers.geonode.geonode_fetcher import GeonodeFetcher
from src.proxy_fetchers.geonode.utils import get_random_proxy_options

class GoPlusClient:
    def __init__(self):
        self.base_url = "https://api.gopluslabs.io/api/v1"
        self.geonode_client = GeonodeFetcher()

    def _get_headers(self) -> Dict[str, str]:
        return {
            "accept": "application/json",
            "content-type": "application/json"
        }

    def get_evm_token_security(self, chain_id: int, token_address: str):
        """
        Get token security information for a specific token address on a given chain
        
        Args:
            chain_id: The chain ID of the token (e.g., 1 for Ethereum)
            token_address: The token contract address
            
        Returns:
            TokenSecurityInfo object containing detailed security information
        """
        url = f"{self.base_url}/token_security/{chain_id}?contract_addresses={token_address}"
        response = self.geonode_client.get(
            url,
            headers=self._get_headers(),
            proxy_options=get_random_proxy_options()
        )
        try:
            security_response = response.json() or {}
            result = security_response.get("result", {})
            return result.get(token_address.lower(), {})
        except (ValueError, AttributeError):
            return {}

    def get_solana_token_security(self, token_address: str):
        """
        Get token security information for a Solana token address
        
        Args:
            token_address: The token mint address
            
        Returns:
            SolanaTokenSecurityInfo object containing detailed security information
        """
        url = f"{self.base_url}/token_security/solana?contract_addresses={token_address}"
        response = self.geonode_client.get(
            url,
            headers=self._get_headers(),
            proxy_options=get_random_proxy_options()
        )
        try:
            security_response = response.json() or {}
            result = security_response.get("result", {})
            return result.get(token_address, {})
        except (ValueError, AttributeError):
            return {}

    def get_address_security(self, address: str):
        """
        Get security information for a specific address
        
        Args:
            address: The wallet address to check
            
        Returns:
            AddressSecurityInfo object containing detailed security information
        """
        url = f"{self.base_url}/address_security/{address}"
        response = self.geonode_client.get(
            url,
            headers=self._get_headers(),
            proxy_options=get_random_proxy_options()
        )
        try:
            security_response = response.json() or {}
            return security_response.get("result", {})
        except (ValueError, AttributeError):
            return {}

    def get_rugpull_detection(self, chain_id: int, contract_addresses: str):
        """
        Get rugpull detection information for a specific chain and contract
        
        Args:
            chain_id: The chain ID (e.g., 1 for Ethereum)
            contract_addresses: The token contract address to check
            
        Returns:
            RugpullDetectionInfo object containing rugpull risk information
        """
        url = f"{self.base_url}/rugpull_detecting/{chain_id}?contract_addresses={contract_addresses}"
        response = self.geonode_client.get(
            url,
            headers=self._get_headers(),
            proxy_options=get_random_proxy_options()
        )
        try:
            detection_response = response.json() or {}
            return detection_response.get("result", {})
        except (ValueError, AttributeError):
            return {} 