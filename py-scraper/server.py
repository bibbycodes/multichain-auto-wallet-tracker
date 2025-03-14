from fastapi import FastAPI
import uvicorn
import logging
from dotenv import load_dotenv
from src.routes import proxy_router, twitter_router

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Scraper API",
    description="API for Twitter scraping and proxy requests",
    version="1.0.0"
)

# Include routers
app.include_router(proxy_router)
app.include_router(twitter_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug") 