# Twitter Scraper

A Python module for scraping Twitter data including user information, followers, following, tweets, and search results.

## Project Structure

```
py-scraper/
├── src/
│   ├── __init__.py
│   ├── scraper/
│   │   ├── __init__.py
│   │   └── twitter_scraper.py
│   └── utils/
│       ├── __init__.py
│       └── serializers.py
├── sessions/
├── main.py
├── requirements.txt
└── README.md
```

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with your Twitter credentials:
```
TWITTER_USERNAME=your_username_here
TWITTER_PASSWORD=your_password_here
```

## Usage

Run the main script to collect Twitter data:

```bash
python main.py
```

The script will:
1. Collect user information
2. Get followers list
3. Get following list
4. Get user tweets
5. Perform tweet searches

All data is saved to JSON files in the current directory.

### Using the TwitterScraper class

```python
from src.scraper import TwitterScraper

# Initialize the scraper
scraper = TwitterScraper()

# Get user information
user_info = scraper.get_user_info("username")

# Get followers (20 per page)
followers = scraper.get_followers("username", pages=1)

# Get following (20 per page)
following = scraper.get_following("username", pages=1)

# Get user tweets (20 per page)
tweets = scraper.get_user_tweets("username", pages=1)

# Search tweets (20 per page)
search_results = scraper.search_tweets("search query", pages=1)

# Save data to JSON
scraper.save_to_json(data, "output.json")
```

## Rate Limiting

The script includes 2-second delays between operations to avoid rate limiting. For large-scale scraping, consider increasing these delays.

## Error Handling

The script includes comprehensive error handling and will display full stack traces if any errors occur during execution.

## Session Management

Sessions are stored in the `sessions/` directory. The scraper will attempt to reuse existing sessions when possible and create new ones when needed. 