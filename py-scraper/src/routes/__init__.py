"""
API Routes Package

Contains FastAPI route modules for different endpoints.
"""

from .proxy import router as proxy_router
from .gmgn_router import router as gmgn_router

__all__ = ['proxy_router', 'gmgn_router'] 