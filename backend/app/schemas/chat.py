from typing import Optional, List
from pydantic import BaseModel

class CitationSource(BaseModel):
    documentId: str
    documentName: str
    page: int
    section: Optional[str] = "General"
    snippet: str

class ChatQueryRequest(BaseModel):
    prompt: str
    documentId: Optional[str] = None

class ChatQueryResponse(BaseModel):
    id: str
    sender: str = "ai"
    text: str
    timestamp: str
    citations: Optional[List[CitationSource]] = []
