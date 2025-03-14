from typing import Any, Optional
from curl_cffi import requests as curl_requests
from enum import Enum
import os
from dataclasses import dataclass
import re
import logging
import traceback
from dotenv import load_dotenv
from fake_useragent import UserAgent

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SessionType(Enum):
    STICKY = "sticky"
    ROTATING = "rotating"

class ProxySourceType(Enum):
    RESIDENTIAL = "residential"
    MOBILE = "mobile"
    DATA_CENTER = "datacenter"

class GatewayCountry(Enum):
    FRANCE = "france"
    UNITED_STATES = "united_states"
    SINGAPORE = "singapore"

@dataclass
class ProxyUrlOptions:
    country: str = "US"
    ip_source_type: ProxySourceType = ProxySourceType.RESIDENTIAL
    session_type: SessionType = SessionType.STICKY
    lifetime: int = 3
    gateway: GatewayCountry = GatewayCountry.FRANCE

class GeonodeFetcher:
    def __init__(
        self,
        username: Optional[str] = None,
        password: Optional[str] = None,
        proxy_options: Optional[ProxyUrlOptions] = None,
        browser_type: Optional[str] = None
    ):
        try:
            self.username = username or os.getenv("GEO_NODE_API_USERNAME")
            self.password = password or os.getenv("GEO_NODE_API_PASSWORD")
            self.proxy_options = proxy_options or ProxyUrlOptions()
            
            if not self.username or not self.password:
                raise ValueError("GEO_NODE_API_USERNAME and GEO_NODE_API_PASSWORD environment variables must be set")
            
            logger.debug(f"Initializing GeonodeFetcher with username: {self.username}")
            logger.debug(f"Proxy options: {self.proxy_options}")
            
            # Create a session with curl_cffi
            # Map browser type to curl_cffi impersonation
            browser_map = {
                "chrome": "chrome110",
                "firefox": "firefox110",
                "safari": "safari15_3",
                "edge": "edge110",
                "opera": "opera96",
                "curl": "curl/8.4.0"
            }
            
            # Set up browser impersonation
            ua = UserAgent()
            if browser_type:
                # Use specific browser type if provided
                user_agent = getattr(ua, browser_type)
                impersonation = browser_map.get(browser_type, "chrome110")
            else:
                # Use random modern browser
                user_agent = ua.chrome
                impersonation = "chrome110"
            
            # Create session with browser impersonation
            self.session = curl_requests.Session(impersonate=impersonation)
            logger.debug(f"Created curl_cffi session with impersonation: {impersonation}")
            
            # Set browser headers
            self.session.headers.update({
                "User-Agent": user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1"
            })
            
            logger.debug(f"Successfully created curl_cffi session with browser headers for {browser_type or 'random'}")
            logger.debug(f"User-Agent: {user_agent}")
            logger.debug(f"Browser impersonation: {impersonation}")
        except Exception as e:
            logger.error(f"Error initializing GeonodeFetcher: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    def get_proxy_url(self, options: Optional[ProxyUrlOptions] = None) -> str:
        try:
            opts = options or self.proxy_options
            proxy_url = (
                f"http://{self.get_username(opts)}:{self.password}@"
                f"{self.get_gateway_ip(opts.gateway)}:{self.get_port(opts.session_type)}"
            )
            logger.debug(f"Generated proxy URL: {proxy_url}")
            return proxy_url
        except Exception as e:
            logger.error(f"Error generating proxy URL: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    def get_username(self, options: ProxyUrlOptions) -> str:
        return (
            f"{self.username}-{self.get_ip_source_type(options.ip_source_type)}-"
            f"{self.get_country(options.country)}-{self.get_lifetime(options.lifetime)}"
        )

    def get_gateway_ip(self, country: GatewayCountry) -> str:
        gateway_ips = {
            GatewayCountry.FRANCE: "92.204.164.15",
            GatewayCountry.UNITED_STATES: "192.155.103.209",
            GatewayCountry.SINGAPORE: "172.104.161.166"
        }
        return gateway_ips.get(country, "92.204.164.15")

    def get_port(self, session_type: SessionType) -> int:
        return 9000 if session_type == SessionType.STICKY else 10000

    def get_lifetime(self, minutes: int) -> str:
        return f"lifetime-{minutes}"

    def get_country(self, country: str) -> str:
        # Simple ISO 3166-1 alpha-2 country code validation
        if not re.match(r'^[A-Z]{2}$', country):
            raise ValueError(f"Invalid ISO 3166-1 country code: {country}. Must be 2 uppercase letters.")
        return f"country-{country.lower()}"

    def get_ip_source_type(self, source_type: ProxySourceType) -> str:
        type_mapping = {
            ProxySourceType.RESIDENTIAL: "type-residential",
            ProxySourceType.MOBILE: "type-mobile",
            ProxySourceType.DATA_CENTER: "type-datacenter"
        }
        return type_mapping.get(source_type, "type-residential")

    def _make_request(
        self,
        method: str,
        url: str,
        **kwargs: Any
    ) -> curl_requests.Response:
        try:
            logger.debug(f"Making {method} request to {url}")
            
            # Handle proxy options
            proxy_options = kwargs.pop('proxy_options', None)
            if proxy_options:
                # Update proxy URL with new options
                proxy_url = self.get_proxy_url(ProxyUrlOptions(**proxy_options))
            else:
                # Use default proxy URL
                proxy_url = self.get_proxy_url()
            
            # Set up proxy
            self.session.proxies = {
                "http": proxy_url,
                "https": proxy_url
            }
            logger.debug(f"Set up proxy: {proxy_url}")
            
            # Update headers with any additional headers provided
            if "headers" in kwargs:
                self.session.headers.update(kwargs["headers"])
                del kwargs["headers"]
            
            logger.debug(f"Request headers: {self.session.headers}")
            
            # Make the request
            response = self.session.request(
                method=method,
                url=url,
                timeout=30,
                **kwargs
            )
            response.raise_for_status()
            logger.debug(f"Request successful with status code: {response.status_code}")
            return response
        except Exception as e:
            logger.error(f"Error making request through Geonode proxy to {url}: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    def get(self, url: str, **kwargs: Any) -> curl_requests.Response:
        return self._make_request("GET", url, **kwargs)

    def post(self, url: str, **kwargs: Any) -> curl_requests.Response:
        return self._make_request("POST", url, **kwargs)

    def put(self, url: str, **kwargs: Any) -> curl_requests.Response:
        return self._make_request("PUT", url, **kwargs)

    def delete(self, url: str, **kwargs: Any) -> curl_requests.Response:
        return self._make_request("DELETE", url, **kwargs)

    def get_proxy_options(self) -> ProxyUrlOptions:
        return self.proxy_options