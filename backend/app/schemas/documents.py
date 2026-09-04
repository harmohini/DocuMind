from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: str
    user_id: Optional[str] = "default_user"
    name: str
    file_name: str
    file_type: str
    mime_type: str
    document_type: str
    page_count: Optional[int] = 1
    file_size: Optional[int] = 0
    status: str  # Uploading, Processing, Ready, Failed
    created_at: str
    updated_at: str
    summary: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentListResponse(BaseModel):
    success: bool = True
    data: List[DocumentResponse]
