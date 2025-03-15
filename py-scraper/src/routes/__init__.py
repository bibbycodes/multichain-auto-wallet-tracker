"""
API Routes Package

Contains FastAPI route modules for different endpoints.
"""

from .proxy import router as proxy_router
from .gmgn import router as gmgn_router
from .rugcheck import router as rugcheck_router
from .goplus import router as goplus_router
__all__ = ['proxy_router', 'gmgn_router', 'rugcheck_router', 'goplus_router'] 