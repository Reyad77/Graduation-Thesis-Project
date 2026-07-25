"""
Rate limiting using slowapi + in-memory storage.

Protects sensitive auth endpoints from brute-force attacks.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Global limiter instance — used as a dependency in endpoints
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
