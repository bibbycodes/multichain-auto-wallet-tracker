from tweety import Twitter
from typing import List, Optional, Dict, Any, Union
import os
from dotenv import load_dotenv
import json
import time
import traceback
import shutil
from ..utils.serializers import serialize_datetime, get_all_attributes

# Load environment variables
load_dotenv()

class TwitterScraper:
    def __init__(self, session_name: str = "twitter_scraper", auth_token: Optional[str] = None, cookies: Optional[Union[str, Dict[str, str]]] = None):
        """
        Initialize TwitterScraper
        
        Args:
            session_name (str): Name for the Twitter session. Defaults to "twitter_scraper"
            auth_token (Optional[str]): Twitter auth token for authentication
            cookies (Optional[Union[str, Dict[str, str]]]): Twitter cookies as string or dictionary
        """
        # Create sessions directory if it doesn't exist
        self.sessions_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sessions")
        os.makedirs(self.sessions_dir, exist_ok=True)
        
        # Set up session path and name
        self.session_name = str(session_name)
        self.session_path = os.path.join(self.sessions_dir, self.session_name)
        
        # Try to initialize with existing session first
        try:
            # Initialize Twitter client
            self.app = Twitter(self.session_name)
            
            if auth_token:
                print("Attempting to authenticate using auth token...")
                self.app.load_auth_token(auth_token)
            elif cookies:
                print("Attempting to authenticate using cookies...")
                self.app.load_cookies(cookies)
            else:
                # Try to connect with existing session
                print("Attempting to connect with existing session...")
                self.app.connect()
            
            # Validate session
            if not isinstance(self.app.session, dict):
                raise ValueError(f"Invalid session type: {type(self.app.session)}")
            
            # Test connection by fetching home timeline
            self.app.get_home_timeline(1)
            print("Successfully authenticated with Twitter")
            
        except Exception as e:
            print(f"Authentication failed: {str(e)}")
            print("Full error details:")
            traceback.print_exc()
            
            # Clean up invalid session
            if os.path.exists(self.session_path):
                try:
                    shutil.rmtree(self.session_path)
                    print(f"Cleaned up invalid session at {self.session_path}")
                except Exception as cleanup_error:
                    print(f"Warning: Could not clean up session: {cleanup_error}")
            
            # If no auth methods provided, try username/password
            if not auth_token and not cookies:
                print("No auth token or cookies provided, attempting username/password login...")
                try:
                    self.app = Twitter(self.session_name)
                    self._login()
                except Exception as login_error:
                    print(f"Username/password login failed: {str(login_error)}")
                    raise
            else:
                raise RuntimeError("Authentication failed and no fallback credentials available")

    def _login(self):
        """Login to Twitter using credentials from environment variables"""
        username = os.getenv("TWITTER_USERNAME")
        password = os.getenv("TWITTER_PASSWORD")
        
        if not username or not password:
            raise ValueError("Twitter credentials not found in environment variables")
        
        try:
            print(f"Attempting to login with username: {username}")
            
            # Try to get the current session state before login
            try:
                current_session = self.app.session
                print(f"Current session state: {type(current_session)}")
                if isinstance(current_session, dict):
                    print("Session keys:", list(current_session.keys()))
                else:
                    print(f"Warning: Session is not a dictionary: {type(current_session)}")
            except Exception as e:
                print(f"Could not inspect session: {e}")

            # Login with username and password
            self.app.start(str(username), str(password))
            
            # Validate the new session
            try:
                new_session = self.app.session
                print(f"New session state: {type(new_session)}")
                if isinstance(new_session, dict):
                    print("New session keys:", list(new_session.keys()))
                else:
                    raise ValueError(f"Invalid session type after login: {type(new_session)}")
            except Exception as e:
                print(f"Could not inspect new session: {e}")
                raise
                
            print("Successfully logged in to Twitter")
        except Exception as e:
            print("Login failed with error:", str(e))
            print("Full error details:")
            traceback.print_exc()
            raise RuntimeError(f"Failed to login: {str(e)}")

    def get_user_info(self, username: str) -> Dict[str, Any]:
        """
        Get detailed information about a Twitter user
        
        Args:
            username (str): Twitter username without '@'
            
        Returns:
            Dict[str, Any]: Complete user information
        """
        try:
            user = self.app.get_user_info(username)
            return get_all_attributes(user)
        except Exception as e:
            print(f"Error fetching user info for {username}: {str(e)}")
            return {}

    def get_followers(self, username: str, pages: int = 1) -> List[Dict[str, Any]]:
        """
        Get followers of a Twitter user
        
        Args:
            username (str): Twitter username without '@'
            pages (int): Number of pages to scrape (20 followers per page)
            
        Returns:
            List[Dict[str, Any]]: Complete list of follower information
        """
        try:
            all_followers = []
            followers = self.app.get_followers(username, pages=pages)
            
            for follower in followers:
                follower_data = get_all_attributes(follower)
                all_followers.append(follower_data)
            
            return all_followers
        except Exception as e:
            print(f"Error fetching followers for {username}: {str(e)}")
            return []

    def get_following(self, username: str, pages: int = 1) -> List[Dict[str, Any]]:
        """
        Get users that a Twitter user is following
        
        Args:
            username (str): Twitter username without '@'
            pages (int): Number of pages to scrape (20 following per page)
            
        Returns:
            List[Dict[str, Any]]: Complete list of following user information
        """
        try:
            all_following = []
            following = self.app.get_following(username, pages=pages)
            
            for user in following:
                following_data = get_all_attributes(user)
                all_following.append(following_data)
            
            return all_following
        except Exception as e:
            print(f"Error fetching following for {username}: {str(e)}")
            return []
    
    def get_user_tweets(self, username: str, pages: int = 1) -> List[dict]:
        """
        Get tweets from a specific user
        
        Args:
            username (str): Twitter username without '@'
            pages (int): Number of pages to scrape (20 tweets per page)
            
        Returns:
            List[dict]: Complete list of tweets with all available data
        """
        try:
            all_tweets = []
            tweets = self.app.get_tweets(username, pages=pages)
            
            for tweet in tweets:
                tweet_data = get_all_attributes(tweet)
                all_tweets.append(tweet_data)
            
            return all_tweets
        except Exception as e:
            print(f"Error fetching tweets for user {username}: {str(e)}")
            return []
    
    def search_tweets(self, query: str, pages: int = 1) -> List[dict]:
        """
        Search for tweets matching a query
        
        Args:
            query (str): Search query
            pages (int): Number of pages to scrape
            
        Returns:
            List[dict]: Complete list of matching tweets with all available data
        """
        try:
            all_tweets = []
            tweets = self.app.search(query, pages=pages)
            
            for tweet in tweets:
                tweet_data = get_all_attributes(tweet)
                all_tweets.append(tweet_data)
            
            return all_tweets
        except Exception as e:
            print(f"Error searching tweets for query '{query}': {str(e)}")
            return []

    def save_to_json(self, data: Any, filename: str):
        """
        Save data to a JSON file
        
        Args:
            data: Data to save
            filename: Name of the file to save to
        """
        # Ensure the data directory exists
        data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "output")
        os.makedirs(data_dir, exist_ok=True)
        
        # Create full file path
        filepath = os.path.join(data_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=serialize_datetime)
            print(f"Data saved to {filepath}")
        except Exception as e:
            print(f"Error saving data to {filepath}: {str(e)}") 