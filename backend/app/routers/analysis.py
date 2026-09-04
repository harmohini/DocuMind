from fastapi import APIRouter, Header, HTTPException, status
from app.schemas.analysis import AnalysisResponse, ExecutiveSummaryResponse
from app.services.document_analyst import DocumentAnalystService

router = APIRouter(prefix="/api/v1/documents", tags=["Document Analyst Agent"])

@router.post("/{document_id}/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_document(document_id: str, x_user_id: str = Header("default_user")):
    """
    POST /api/v1/documents/{document_id}/analyze
    Triggers multi-step Document Analyst Agent analysis returning structured risk, clause, obligation, and deadline cards.
    """
    try:
        analysis_result = await DocumentAnalystService.analyze_document(document_id=document_id)
        return analysis_result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/{document_id}/executive-summary", response_model=ExecutiveSummaryResponse, status_code=status.HTTP_200_OK)
async def generate_executive_summary(document_id: str, x_user_id: str = Header("default_user")):
    """
    POST /api/v1/documents/{document_id}/executive-summary
    Generates unified Executive Summary report combining doc overview, risks, obligations, deadlines, and recommendations.
    """
    try:
        exec_summary_result = await DocumentAnalystService.generate_executive_summary(document_id=document_id)
        return exec_summary_result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
