import logging
from typing import Optional
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger("documind.database")

_supabase_admin_client: Optional[Client] = None
_supabase_anon_client: Optional[Client] = None

def get_supabase_admin_client() -> Optional[Client]:
    """
    Returns a singleton Supabase admin client initialized with the SERVICE_ROLE_KEY.
    Used for backend database mutations and private Storage bucket management.
    """
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

    if not url or "your-supabase" in url:
        logger.warning("Supabase URL is unconfigured. Database & Storage operations will run in mock mode until valid credentials are set in backend/.env.")
        return None

    try:
        _supabase_admin_client = create_client(url, key)
        return _supabase_admin_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        return None

def get_supabase_anon_client() -> Optional[Client]:
    """
    Returns a Supabase client initialized with the ANON_KEY for token verification.
    """
    global _supabase_anon_client
    if _supabase_anon_client is not None:
        return _supabase_anon_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_ANON_KEY

    if not url or "your-supabase" in url:
        return None

    try:
        _supabase_anon_client = create_client(url, key)
        return _supabase_anon_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase anon client: {str(e)}")
        return None
