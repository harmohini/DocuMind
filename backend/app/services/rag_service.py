import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.vector_store import VectorStoreService
from app.services.document_processor import DocumentProcessorService
from app.prompts.rag import RAG_SYSTEM_PROMPT, RAG_USER_PROMPT

logger = logging.getLogger("documind.rag_service")

class RAGService:
    @classmethod
    async def query_rag(cls, prompt: str, user_id: Optional[str] = None, document_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes grounded RAG pipeline isolated by user_id:
        1. Query vector store for user_id matching context chunks
        2. Format context with page metadata
        3. Call configurable LLM provider (or grounded fallback heuristic)
        4. Return response text with exact source citations
        """
        # 1. Similarity Search in Vector Store for current user's documents
        matched_chunks = VectorStoreService.similarity_search(query=prompt, user_id=user_id, document_id=document_id, top_k=6)

        logger.info(f"RAG QUESTION: '{prompt}' | user_id='{user_id}' | document_id='{document_id}'")
        logger.info(f"RETRIEVED CHUNKS COUNT: {len(matched_chunks)}")

        citations = []
        context_str = ""

        if matched_chunks:
            context_pieces = []
            for i, chunk in enumerate(matched_chunks):
                doc_name = chunk.get("document_name", "Uploaded Document")
                page_num = chunk.get("page", 1)
                chk_idx = chunk.get("chunk_index", i)
                text_snippet = chunk.get("text", "")
                
                logger.info(f"  Chunk {i+1}: doc='{doc_name}' | page={page_num} | chunk={chk_idx} | preview='{text_snippet[:90]}...'")
                
                context_pieces.append(f"[Document: {doc_name} | Page: {page_num} | Chunk: {chk_idx}]\n{text_snippet}")
                
                citations.append({
                    "documentId": chunk.get("document_id", document_id or "doc-1"),
                    "documentName": doc_name,
                    "page": page_num,
                    "section": f"Page {page_num}",
                    "snippet": text_snippet[:180] + ("..." if len(text_snippet) > 180 else "")
                })
            context_str = "\n\n".join(context_pieces)
        else:
            if document_id:
                doc = DocumentProcessorService.get_document_by_id(document_id, user_id=user_id)
                if doc and doc.get("extracted_text"):
                    extracted = doc["extracted_text"][:2000]
                    context_str = f"[Document: {doc['name']} | Page: 1]\n{extracted}"
                    citations.append({
                        "documentId": document_id,
                        "documentName": doc["name"],
                        "page": 1,
                        "section": "Page 1",
                        "snippet": extracted[:180]
                    })

        # 2. LLM Provider Execution
        llm_response_text = None
        
        if settings.is_llm_configured():
            try:
                import httpx
                headers = {
                    "Authorization": f"Bearer {settings.LLM_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": RAG_SYSTEM_PROMPT},
                        {"role": "user", "content": RAG_USER_PROMPT.format(context=context_str if context_str else "No matching context found.", question=prompt)}
                    ],
                    "temperature": 0.1
                }
                endpoint = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(endpoint, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        llm_response_text = data["choices"][0]["message"]["content"]
                    else:
                        logger.error(f"LLM API returned HTTP {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"LLM API Call Exception: {str(e)}")

        # 3. Grounded Response fallback (strictly NO fake generic answers)
        if not llm_response_text:
            if not context_str or "Empty or non-extractable" in context_str:
                llm_response_text = "I couldn't find this information in the uploaded documents."
            else:
                import re
                query_keywords = [
                    w.lower() for w in re.findall(r'\w+', prompt) 
                    if len(w) > 2 and w.lower() not in {
                        "what", "is", "the", "of", "in", "to", "a", "and", "for", "on", 
                        "who", "are", "how", "many", "tell", "me", "about", "which", "where", "can"
                    }
                ]
                context_lower = context_str.lower()
                has_keyword_match = any(w in context_lower for w in query_keywords)
                
                if query_keywords and not has_keyword_match:
                    llm_response_text = "I couldn't find this information in the uploaded documents."
                else:
                    llm_response_text = f"Based on the uploaded document text:\n\n{context_str[:600]}"

        return {
            "id": f"msg-{int(datetime.now().timestamp() * 1000)}",
            "sender": "ai",
            "text": llm_response_text,
            "timestamp": datetime.now().strftime("%I:%M %p"),
            "citations": citations
        }
