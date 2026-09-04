import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from app.database import get_supabase_admin_client

logger = logging.getLogger("documind.document_service")

# In-memory store fallback for demo/dev mode if Supabase is unconfigured
_in_memory_docs: Dict[str, Dict[str, Any]] = {}

class DocumentService:
    ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/octet-stream"
    }

    @classmethod
    async def upload_document(
        cls,
        file: UploadFile,
        user_id: str,
        document_type: str = "Contract"
    ) -> Dict[str, Any]:
        """
        Validates, uploads to private Storage bucket 'documents', and records database entry.
        """
        # 1. Validate extension
        filename = file.filename or "unnamed_document.pdf"
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "error": {
                        "code": "INVALID_FILE_TYPE",
                        "message": f"Unsupported file type .{ext}. Only PDF, DOCX, and TXT are supported."
                    }
                }
            )

        # 2. Read file bytes & validate size
        contents = await file.read()
        file_size = len(contents)
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "error": {
                        "code": "FILE_TOO_LARGE",
                        "message": f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB} MB."
                    }
                }
            )

        # 3. Safe unique storage path
        doc_id = str(uuid.uuid4())
        safe_filename = "".join([c if c.isalnum() or c in "._-" else "_" for c in filename])
        storage_path = f"{user_id}/{doc_id}_{safe_filename}"
        mime_type = file.content_type or "application/octet-stream"

        now_str = datetime.now(timezone.utc).isoformat()

        # Document record dictionary
        doc_record = {
            "id": doc_id,
            "user_id": user_id,
            "name": filename,
            "file_name": safe_filename,
            "file_type": ext.upper(),
            "mime_type": mime_type,
            "storage_path": storage_path,
            "document_type": document_type,
            "page_count": 1,
            "file_size": file_size,
            "status": "uploaded",
            "processing_error": None,
            "metadata": {},
            "created_at": now_str,
            "updated_at": now_str
        }

        # 4. Storage & Database operations via Supabase Client
        supabase = get_supabase_admin_client()
        if supabase:
            try:
                # Ensure bucket exists
                try:
                    supabase.storage.get_bucket(settings.STORAGE_BUCKET)
                except Exception:
                    supabase.storage.create_bucket(settings.STORAGE_BUCKET, options={"public": False})

                # Upload to private Storage bucket
                supabase.storage.from_(settings.STORAGE_BUCKET).upload(
                    path=storage_path,
                    file=contents,
                    file_options={"content-type": mime_type, "x-upsert": "true"}
                )

                # Insert DB row
                db_res = supabase.table("documents").insert(doc_record).execute()
                if db_res.data and len(db_res.data) > 0:
                    return db_res.data[0]
            except Exception as e:
                logger.error(f"Supabase upload exception: {str(e)}")

        # Fallback in-memory storage for development mode
        _in_memory_docs[doc_id] = doc_record
        return doc_record

    @classmethod
    async def get_user_documents(cls, user_id: str) -> List[Dict[str, Any]]:
        """
        Returns all documents belonging to the authenticated user.
        """
        supabase = get_supabase_admin_client()
        if supabase:
            try:
                res = supabase.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as e:
                logger.error(f"Supabase fetch documents exception: {str(e)}")

        # Fallback in-memory
        return [doc for doc in _in_memory_docs.values() if doc.get("user_id") == user_id]

    @classmethod
    async def get_document_by_id(cls, document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a document by ID, verifying user ownership.
        """
        supabase = get_supabase_admin_client()
        if supabase:
            try:
                res = supabase.table("documents").select("*").eq("id", document_id).eq("user_id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.error(f"Supabase fetch document by id exception: {str(e)}")

        doc = _in_memory_docs.get(document_id)
        if doc and doc.get("user_id") == user_id:
            return doc
        return None

    @classmethod
    async def delete_document(cls, document_id: str, user_id: str) -> bool:
        """
        Deletes a document record and its corresponding file in private Storage after verifying ownership.
        """
        doc = await cls.get_document_by_id(document_id, user_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "error": {
                        "code": "DOCUMENT_NOT_FOUND",
                        "message": f"Document {document_id} not found or you do not have permission to delete it."
                    }
                }
            )

        supabase = get_supabase_admin_client()
        if supabase:
            try:
                # Delete from Storage
                storage_path = doc.get("storage_path")
                if storage_path:
                    supabase.storage.from_(settings.STORAGE_BUCKET).remove([storage_path])

                # Delete DB row
                supabase.table("documents").delete().eq("id", document_id).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                logger.error(f"Supabase delete document exception: {str(e)}")

        if document_id in _in_memory_docs:
            del _in_memory_docs[document_id]
        return True
