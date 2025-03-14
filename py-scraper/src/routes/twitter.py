from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import traceback
from src.twitter import TwitterScraper

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Twitter scraper
twitter_scraper = TwitterScraper()

router = APIRouter(prefix="/twitter", tags=["twitter"])

class TwitterParams(BaseModel):
    username: str
    pages: Optional[int] = 1

class TwitterSearchParams(BaseModel):
    query: str
    pages: Optional[int] = 1

@router.get("/user/{username}")
async def get_user_info(username: str) -> Dict[str, Any]:
    """Get detailed information about a Twitter user"""
    try:
        logger.debug(f"Fetching user info for: {username}")
        user_info = twitter_scraper.get_user_info(username)
        return {"status": "success", "data": user_info}
    except Exception as e:
        logger.error(f"Error fetching user info: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/followers")
async def get_followers(params: TwitterParams) -> Dict[str, Any]:
    """Get followers of a Twitter user"""
    try:
        logger.debug(f"Fetching followers for: {params.username} (pages: {params.pages})")
        followers = twitter_scraper.get_followers(params.username, pages=params.pages)
        return {
            "status": "success",
            "data": followers,
            "count": len(followers)
        }
    except Exception as e:
        logger.error(f"Error fetching followers: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/following")
async def get_following(params: TwitterParams) -> Dict[str, Any]:
    """Get users that a Twitter user is following"""
    try:
        logger.debug(f"Fetching following for: {params.username} (pages: {params.pages})")
        following = twitter_scraper.get_following(params.username, pages=params.pages)
        return {
            "status": "success",
            "data": following,
            "count": len(following)
        }
    except Exception as e:
        logger.error(f"Error fetching following: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tweets")
async def get_user_tweets(params: TwitterParams) -> Dict[str, Any]:
    """Get tweets from a specific user"""
    try:
        logger.debug(f"Fetching tweets for: {params.username} (pages: {params.pages})")
        tweets = twitter_scraper.get_user_tweets(params.username, pages=params.pages)
        return {
            "status": "success",
            "data": tweets,
            "count": len(tweets)
        }
    except Exception as e:
        logger.error(f"Error fetching tweets: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_tweets(params: TwitterSearchParams) -> Dict[str, Any]:
    """Search for tweets matching a query"""
    try:
        logger.debug(f"Searching tweets with query: {params.query} (pages: {params.pages})")
        tweets = twitter_scraper.search_tweets(params.query, pages=params.pages)
        return {
            "status": "success",
            "data": tweets,
            "count": len(tweets)
        }
    except Exception as e:
        logger.error(f"Error searching tweets: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) 