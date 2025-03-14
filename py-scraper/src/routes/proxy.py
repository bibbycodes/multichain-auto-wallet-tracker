from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import traceback
from src.proxy_fetchers.geonode import GeonodeClient, ProxyUrlOptions, SessionType, ProxySourceType, GatewayCountry

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/proxy", tags=["proxy"])

class RequestParams(BaseModel):
    url: str
    method: str = "GET"
    headers: Optional[Dict[str, str]] = None
    data: Optional[Dict[str, Any]] = None
    proxy_options: Optional[Dict[str, Any]] = None
    browser_type: Optional[str] = None

@router.post("")
async def proxy_request(params: RequestParams):
    """
    Make a proxied request through Geonode
    """
    try:        
        # Convert proxy options to ProxyUrlOptions if provided
        proxy_options = None
        if params.proxy_options:
            try:
                proxy_options = ProxyUrlOptions(
                    country=params.proxy_options.get("country", "US"),
                    ip_source_type=ProxySourceType(params.proxy_options.get("ip_source_type", "residential")),
                    session_type=SessionType(params.proxy_options.get("session_type", "sticky")),
                    lifetime=params.proxy_options.get("lifetime", 3),
                    gateway=GatewayCountry(params.proxy_options.get("gateway", "france"))
                )
                logger.info(f"Created proxy options: {proxy_options}")
            except Exception as e:
                logger.error(f"Error creating proxy options: {str(e)}")
                logger.error(traceback.format_exc())
                raise HTTPException(status_code=400, detail=f"Invalid proxy options: {str(e)}")

        # Initialize fetcher with proxy options and browser type
        try:
            fetcher = GeonodeClient(proxy_options=proxy_options, browser_type=params.browser_type)
            logger.info("Successfully initialized GeonodeClient")
        except Exception as e:
            logger.error(f"Error initializing GeonodeClient: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Failed to initialize fetcher: {str(e)}")
        
        # Get the appropriate method
        method = params.method.upper()
        try:
            request_method = getattr(fetcher, method.lower())
            logger.info(f"Got request method: {method.lower()}")
        except AttributeError as e:
            logger.error(f"Invalid HTTP method: {method}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=400, detail=f"Invalid HTTP method: {method}")
        
        # Make the request
        try:
            logger.info(f"Making {method} request to {params.url}")
            response = request_method(
                params.url,
                headers=params.headers,
                json=params.data if method in ["POST", "PUT"] else None
            )
            logger.info(f"Request successful with status code: {response.status_code}")
        except Exception as e:
            logger.error(f"Error making request: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")
        
        # Try to parse JSON response
        try:
            content = response.json()
            logger.info("Successfully parsed JSON response")
        except:
            content = response.text
            logger.info("Using text response instead of JSON")
            
        return {
            "status_code": response.status_code,
            "headers": dict(response.headers), 
            "content": content
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}") 