from fastapi import FastAPI
import uvicorn
import logging
from dotenv import load_dotenv
from src.routes import proxy_router, gmgn_router, rugcheck_router, goplus_router

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Set specific log levels for noisy libraries
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)
logging.getLogger('hpack').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Scraper API",
    description="API for Twitter scraping, GMGN data, proxy requests, and token analysis",
    version="1.0.0"
)

# Include routers
app.include_router(proxy_router)
app.include_router(gmgn_router)
app.include_router(rugcheck_router)
app.include_router(goplus_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 