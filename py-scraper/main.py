import time
from src.twitter import TwitterScraper

def main():
    try:
        scraper = TwitterScraper()
        username = "whalebuybot"
        
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
        search_results = scraper.search_tweets("9gyfbPVwwZx4y1hotNSLcqXCQNpNqqz6ZRvo8yTLpump", pages=1)
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