from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse
from app.services.rag_service import RAGService

router = APIRouter(tags=["RAG Chat"])

@router.post("/api/v1/documents/{document_id}/chat", response_model=ChatQueryResponse, status_code=status.HTTP_200_OK)
async def chat_with_document(
    document_id: str,
    request: ChatQueryRequest,
    x_user_id: str = Header("default_user")
):
    """
    POST /api/v1/documents/{document_id}/chat
    Performs grounded RAG Q&A over a specific document belonging to user_id with source citations.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question prompt cannot be empty.")

    rag_response = await RAGService.query_rag(prompt=request.prompt, user_id=x_user_id, document_id=document_id)
    return rag_response

@router.post("/api/v1/chat", response_model=ChatQueryResponse, status_code=status.HTTP_200_OK)
async def chat_global(
    request: ChatQueryRequest,
    x_user_id: str = Header("default_user")
):
    """
    POST /api/v1/chat
    Performs grounded RAG Q&A across all enterprise documents belonging to user_id with page citations.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question prompt cannot be empty.")

    doc_id = request.documentId
    rag_response = await RAGService.query_rag(prompt=request.prompt, user_id=x_user_id, document_id=doc_id)
    return rag_response
