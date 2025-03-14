import time
from src.twitter import TwitterScraper

def main():
    try:
        # Twitter session cookies
        cookies = {
            "kdt": "qKXddCvKVWV7bgyZKba4ZekwYDeOuAbLiyV475yM",
            "twid": "u=1200581087283556353",
            "ct0": "ff720b4f27719f9720b5b6e4b8e58a5d96035650194f30aefc4f442599f3aa3bcfacef73581632492f471b4b559c29fed73c8809a89309aaebbe593ccae2d01eab8651c0004efae99cdc274476474f19",
            "auth_token": "10e1a1d4fce534da75df075fb58d1a20a8aa132c"
        }
        
        # Initialize scraper with cookies
        scraper = TwitterScraper("session")
        username = "DefiDigestDaily"  # Updated to use the authenticated account's username
        
        # Get user information
        user_info = scraper.get_user_info(username)
        scraper.save_to_json(user_info, "user_info.json")
        print(f"User info collected")
        
        # Sleep for 2 seconds before next operation
        time.sleep(2)
        
        # Get user's followers
        followers = scraper.get_followers(username, pages=1)
        scraper.save_to_json(followers, "followers.json")
        print(f"Found {len(followers)} followers")
        
        # Sleep for 2 seconds before next operation
        time.sleep(2)
        
        # Get user's following
        following = scraper.get_following(username, pages=1)
        scraper.save_to_json(following, "following.json")
        print(f"Found {len(following)} following")
        
        # Sleep for 2 seconds before next operation
        time.sleep(2)
        
        # Get tweets from a user
        user_tweets = scraper.get_user_tweets(username, pages=1)
        scraper.save_to_json(user_tweets, "tweets.json")
        print(f"Found {len(user_tweets)} tweets")
        
        # Sleep for 2 seconds before next operation
        time.sleep(2)
        
        # Search for tweets
        search_results = scraper.search_tweets("defi OR crypto", pages=1)  # Updated search query
        scraper.save_to_json(search_results, "search_results.json")
        print(f"Found {len(search_results)} tweets matching search")
        
    except Exception as e:
        print("An error occurred:")
        print(f"Error message: {str(e)}")
        print("\nFull stack trace:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 