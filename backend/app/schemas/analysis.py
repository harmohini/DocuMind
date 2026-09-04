from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SummarizeRequest(BaseModel):
    documentType: Optional[str] = "Contract"

class SummarizeResponse(BaseModel):
    success: bool = True
    documentId: str
    documentType: str
    summaryData: Dict[str, Any]

class AnalysisResponse(BaseModel):
    success: bool = True
    documentId: str
    documentType: str
    analysisData: Dict[str, Any]

class ExecutiveSummaryResponse(BaseModel):
    success: bool = True
    documentId: str
    executiveSummary: Dict[str, Any]
