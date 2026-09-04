from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """
    Main API health check endpoint.
    """
    return {
        "status": "ok",
        "service": "DocuMind API"
    }
