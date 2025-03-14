from typing import Dict, Any, List
import random
from enum import Enum
from .geonode_fetcher import SessionType, ProxySourceType, GatewayCountry

supported_countries = ["US", "GB", "DE", "FR", "CA", "AU", "JP"]

def get_random_enum_value(enum_class: type[Enum]) -> str:
    return random.choice(list(enum_class)).value

def get_random_proxy_options() -> Dict[str, Any]:
    return {
        "country": random.choice(supported_countries),
        "ip_source_type": get_random_enum_value(ProxySourceType),
        "session_type": get_random_enum_value(SessionType),
        "lifetime": random.randint(1, 10),
        "gateway": get_random_enum_value(GatewayCountry)
    }