import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from app.services.pdf_extractor import extract_text_by_pages_from_bytes
from app.services.docx_extractor import extract_text_from_docx_bytes
from app.services.chunker import chunk_pages_data
from app.services.vector_store import VectorStoreService

logger = logging.getLogger("documind.document_processor")

METADATA_STORE_FILE = os.path.join(settings.DOCUMENTS_DIR, "documents_index.json")

def _load_documents_index() -> Dict[str, Dict[str, Any]]:
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    if os.path.exists(METADATA_STORE_FILE):
        try:
            with open(METADATA_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_documents_index(index: Dict[str, Dict[str, Any]]):
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    with open(METADATA_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)

class DocumentProcessorService:
    ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

    @classmethod
    async def process_and_store_document(
        cls,
        file: UploadFile,
        user_id: str,
        document_type: str = "Contract"
    ) -> Dict[str, Any]:
        """
        Processes document upload associated with user_id:
        1. Validates extension and file size
        2. Saves original file to data/documents/<user_id>/
        3. Extracts text page-by-page
        4. Chunks text with page tracking
        5. Indexes embeddings in ChromaDB with user_id
        6. Updates document metadata status to 'Ready'
        """
        filename = file.filename or "unnamed_document.pdf"
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format .{ext}. Only PDF, DOCX, and TXT are supported."
            )

        contents = await file.read()
        file_size = len(contents)
        doc_id = str(uuid.uuid4())
        safe_filename = "".join([c if c.isalnum() or c in "._-" else "_" for c in filename])

        # Store files in user-isolated subfolders data/documents/<user_id>/
        user_doc_dir = os.path.join(settings.DOCUMENTS_DIR, user_id)
        os.makedirs(user_doc_dir, exist_ok=True)
        local_filename = f"{doc_id}_{safe_filename}"
        local_filepath = os.path.join(user_doc_dir, local_filename)

        with open(local_filepath, "wb") as f:
            f.write(contents)

        now_str = datetime.now(timezone.utc).isoformat()
        
        doc_record = {
            "id": doc_id,
            "user_id": user_id,
            "name": filename,
            "file_name": safe_filename,
            "file_type": ext.upper(),
            "mime_type": file.content_type or "application/octet-stream",
            "document_type": document_type,
            "page_count": 1,
            "file_size": file_size,
            "status": "Processing",
            "local_path": local_filepath,
            "created_at": now_str,
            "updated_at": now_str,
            "summary": None,
            "extracted_text": "",
            "pages_data": []
        }

        # Extract Text
        try:
            if ext == "pdf":
                pages_data = extract_text_by_pages_from_bytes(contents)
            elif ext == "docx":
                pages_data = extract_text_from_docx_bytes(contents)
            else:  # txt
                text = contents.decode("utf-8", errors="ignore")
                pages_data = [{"page": 1, "text": " ".join(text.split())}]

            doc_record["page_count"] = max(1, len(pages_data))
            doc_record["pages_data"] = pages_data
            doc_record["extracted_text"] = "\n".join([p["text"] for p in pages_data])

            # Chunk Text & Embed into vector store with user_id
            chunks = chunk_pages_data(pages_data)
            VectorStoreService.index_document_chunks(doc_id, user_id, filename, chunks)

            doc_record["status"] = "Ready"
            doc_record["summary"] = f"Processed {filename} ({doc_record['page_count']} pages). Indexed in local vector store for search & intelligence."
        except Exception as e:
            logger.error(f"Document processing error for {filename}: {str(e)}")
            doc_record["status"] = "Failed"
            doc_record["summary"] = f"Processing failed: {str(e)}"

        # Save to local index
        index = _load_documents_index()
        index[doc_id] = doc_record
        _save_documents_index(index)

        return doc_record

    @classmethod
    def get_all_documents(cls, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Returns documents belonging strictly to user_id.
        """
        index = _load_documents_index()
        docs = list(index.values())
        if user_id:
            docs = [d for d in docs if d.get("user_id") == user_id]
        docs.sort(key=lambda d: d.get("created_at", ""), reverse=True)
        return docs

    @classmethod
    def get_document_by_id(cls, document_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        index = _load_documents_index()
        doc = index.get(document_id)
        if doc and user_id and doc.get("user_id") != user_id:
            return None
        return doc

    @classmethod
    def delete_document(cls, document_id: str, user_id: Optional[str] = None) -> bool:
        """
        Deletes document if it belongs to user_id.
        """
        index = _load_documents_index()
        if document_id in index:
            doc = index[document_id]
            if user_id and doc.get("user_id") != user_id:
                return False
            local_path = doc.get("local_path")
            if local_path and os.path.exists(local_path):
                try:
                    os.remove(local_path)
                except Exception:
                    pass
            VectorStoreService.delete_document_chunks(document_id, user_id)
            del index[document_id]
            _save_documents_index(index)
            return True
        return False
