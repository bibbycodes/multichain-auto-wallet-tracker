from typing import TypeVar, Dict, Any, List, Union
from ....proxy_fetchers.geonode import GeonodeClient
from ....proxy_fetchers.geonode.utils import get_random_proxy_options

class GmgnClient:
    def __init__(self):
        """Initialize the GMGN client with Geonode proxy support."""
        self.geonode_client = GeonodeClient()
        self.base_url = 'https://gmgn.ai'

    def get_headers(self):
        """Get headers for GMGN API requests."""
        return {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-GB,en;q=0.6",
            "if-none-match": 'W/"68b-+4WA2VXunNsedeRRXp7Su0PpYWs"',
            "priority": "u=1, i",
            "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Brave";v="132"',
            "sec-ch-ua-arch": '"arm"',
            "sec-ch-ua-bitness": '"64"',
            "sec-ch-ua-full-version-list": '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.0.0", "Brave";v="132.0.0.0"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": '""',
            "sec-ch-ua-platform": '"macOS"',
            "sec-ch-ua-platform-version": '"14.6.1"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
        }

    def make_request(self, url: str, referer: str):
        """Make a request to the GMGN API using Geonode proxy."""
        response = self.geonode_client.get(
            url,
            headers={**self.get_headers(), 'referer': referer},
            proxy_options=get_random_proxy_options()
        )

        gmgn_response = response.json()
        if gmgn_response['code'] != 0 or not gmgn_response.get('data'):
            raise ValueError(gmgn_response.get('msg') or 'Invalid response from GMGN')

        return gmgn_response['data']

    def get_smart_money_wallet_data(self, wallet_address: str, chain: str):
        """Get smart money wallet data."""
        url = f"{self.base_url}/defi/quotation/v1/smartmoney/{chain}/walletNew/{wallet_address}?period=7d"
        referer = f"{self.base_url}/{chain}/address/{wallet_address}"
        return self.make_request(url, referer)

    def get_top_traders(self, token_address: str, chain: str):
        """Get top traders for a token."""
        url = f"{self.base_url}/defi/quotation/v1/tokens/top_traders/{chain}/{token_address}"
        referer = f"{self.base_url}/{chain}/token/{token_address}"
        return self.make_request(url, referer)

    def get_token_security_and_launchpad(self, token_address: str, chain: str):
        """Get token security and launchpad information."""
        url = f"{self.base_url}/api/v1/mutil_window_token_security_launchpad/{chain}/{token_address}"
        referer = f"{self.base_url}/{chain}/token/{token_address}"
        return self.make_request(url, referer)

    def get_wallet_holdings(self, wallet_address: str, chain: str):
        """Get wallet holdings."""
        url = f"{self.base_url}/api/v1/wallet_holdings/{chain}/{wallet_address}"
        referer = f"{self.base_url}/{chain}/address/{wallet_address}"
        return self.make_request(url, referer)

    def get_trending_tokens(self, chain: str, timeframe: str = '1h'):
        """Get trending tokens."""
        if timeframe not in ['1h', '24h']:
            raise ValueError("Timeframe must be either '1h' or '24h'")

        url = f"{self.base_url}/defi/quotation/v1/rank/{chain}/swaps/{timeframe}"
        referer = f"{self.base_url}/{chain}/trending"
        return self.make_request(url, referer)

    def get_top_buyers(self, token_address: str, chain: str):
        """Get top buyers for a token."""
        url = f"{self.base_url}/defi/quotation/v1/tokens/top_buyers/{chain}/{token_address}"
        referer = f"{self.base_url}/{chain}/token/{token_address}"
        return self.make_request(url, referer)

    def get_top_holders(self, token_address: str, chain: str):
        """Get top holders for a token."""
        url = f"{self.base_url}/defi/quotation/v1/tokens/top_holders/{chain}/{token_address}"
        referer = f"{self.base_url}/{chain}/token/{token_address}"
        return self.make_request(url, referer) 