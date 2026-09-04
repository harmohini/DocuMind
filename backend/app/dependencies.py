import logging
from typing import Dict, Any
from fastapi import Header, HTTPException, status
from app.database import get_supabase_anon_client, get_supabase_admin_client

logger = logging.getLogger("documind.auth")

async def get_current_user(authorization: str = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency that validates the real Supabase Bearer JWT token from the Authorization header.
    Returns authenticated user information dictionary containing user_id and email.
    Rejects missing, invalid, or expired tokens with HTTP 401.
    Do NOT trust user_id values supplied directly in request bodies.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "MISSING_AUTHORIZATION_HEADER",
                    "message": "Authorization header is required. Format: 'Bearer <access_token>'."
                }
            }
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_HEADER_FORMAT",
                    "message": "Invalid Authorization header format. Expected 'Bearer <access_token>'."
                }
            }
        )

    token = parts[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": {
                    "code": "EMPTY_TOKEN",
                    "message": "Bearer access token is empty."
                }
            }
        )

    # Validate token against Supabase Auth
    supabase = get_supabase_anon_client() or get_supabase_admin_client()
    if supabase:
        try:
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                u = user_response.user
                return {
                    "id": u.id,
                    "email": u.email or "",
                    "metadata": u.user_metadata or {}
                }
        except Exception as e:
            logger.warning(f"Supabase token validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_OR_EXPIRED_TOKEN",
                        "message": f"Authentication token verification failed: {str(e)}"
                    }
                }
            )

    # Reject request if Supabase client is unconfigured or token is invalid
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "success": False,
            "error": {
                "code": "AUTHENTICATION_FAILED",
                "message": "Supabase authentication client is unconfigured or access token is invalid."
            }
        }
    )
