from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, status
from app.services.document_processor import DocumentProcessorService

router = APIRouter(prefix="/api/v1/documents", tags=["Documents"])

@router.get("", status_code=status.HTTP_200_OK)
async def list_documents(x_user_id: str = Header("default_user")):
    """
    GET /api/v1/documents
    Retrieves all locally stored enterprise documents belonging to current local user ID.
    """
    docs = DocumentProcessorService.get_all_documents(user_id=x_user_id)
    return {
        "success": True,
        "data": docs
    }

@router.get("/{document_id}", status_code=status.HTTP_200_OK)
async def get_document(document_id: str, x_user_id: str = Header("default_user")):
    """
    GET /api/v1/documents/{document_id}
    Retrieves metadata and page data for a single document belonging to user_id.
    """
    doc = DocumentProcessorService.get_document_by_id(document_id, user_id=x_user_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    return {
        "success": True,
        "data": doc
    }

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = Form("Contract"),
    x_user_id: str = Header("default_user")
):
    """
    POST /api/v1/documents/upload
    Ingests PDF, DOCX, or TXT file into data/documents/<user_id>/, extracts text, and indexes in ChromaDB with user_id.
    """
    doc_type = document_type or "Contract"
    created_doc = await DocumentProcessorService.process_and_store_document(
        file=file,
        user_id=x_user_id,
        document_type=doc_type
    )

    return {
        "success": True,
        "data": created_doc
    }

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(document_id: str, x_user_id: str = Header("default_user")):
    """
    DELETE /api/v1/documents/{document_id}
    Deletes local document file and removes embeddings from ChromaDB for user_id.
    """
    success = DocumentProcessorService.delete_document(document_id, user_id=x_user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found or permission denied."
        )
    return {
        "success": True,
        "data": {
            "id": document_id,
            "deleted": True
        }
    }
