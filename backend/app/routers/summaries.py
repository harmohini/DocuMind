from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from app.schemas.analysis import SummarizeRequest, SummarizeResponse
from app.services.summarizer import SummarizerService

router = APIRouter(prefix="/api/v1/documents", tags=["Summaries"])

@router.post("/{document_id}/summarize", response_model=SummarizeResponse, status_code=status.HTTP_200_OK)
async def summarize_document(
    document_id: str,
    request: Optional[SummarizeRequest] = None,
    x_user_id: str = Header("default_user")
):
    """
    POST /api/v1/documents/{document_id}/summarize
    Generates structured prompt summarization tailored by document type (Contract, Policy, Report).
    """
    doc_type = request.documentType if request else None
    try:
        summary_result = await SummarizerService.summarize_document(document_id=document_id, document_type=doc_type)
        return summary_result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
