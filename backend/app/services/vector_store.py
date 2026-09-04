import os
import json
import logging
import math
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.embeddings import generate_batch_embeddings, generate_text_embedding

logger = logging.getLogger("documind.vector_store")

VECTOR_STORE_FILE = os.path.join(settings.CHROMA_PATH, "vector_index.json")

def _load_vector_store() -> List[Dict[str, Any]]:
    os.makedirs(settings.CHROMA_PATH, exist_ok=True)
    if os.path.exists(VECTOR_STORE_FILE):
        try:
            with open(VECTOR_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def _save_vector_store(store: List[Dict[str, Any]]):
    os.makedirs(settings.CHROMA_PATH, exist_ok=True)
    with open(VECTOR_STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2)

def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 > 0 and norm2 > 0:
        return dot / (norm1 * norm2)
    return 0.0

class VectorStoreService:
    @classmethod
    def index_document_chunks(cls, document_id: str, user_id: str, document_name: str, chunks: List[Dict[str, Any]]) -> bool:
        """
        Indexes text chunks into local vector store with user_id, document embeddings, and page metadata.
        """
        if not chunks:
            return False

        store = _load_vector_store()
        # Remove existing chunks for this document
        store = [item for item in store if item.get("document_id") != document_id]

        texts = [c["text"] for c in chunks]
        embeddings = generate_batch_embeddings(texts)

        for c, emb in zip(chunks, embeddings):
            store.append({
                "id": f"{document_id}_chk_{c['chunk_index']}",
                "user_id": user_id,
                "document_id": document_id,
                "document_name": document_name,
                "chunk_index": c.get("chunk_index", 0),
                "page": c.get("page", 1),
                "text": c["text"],
                "embedding": emb
            })

        _save_vector_store(store)
        logger.info(f"Indexed {len(chunks)} chunks for user {user_id} and document {document_id}")
        return True

    @classmethod
    def similarity_search(cls, query: str, user_id: Optional[str] = None, document_id: Optional[str] = None, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Performs vector similarity search strictly within the current user's document chunks.
        """
        store = _load_vector_store()
        if not store:
            return []

        # Filter by user_id
        if user_id:
            store = [item for item in store if item.get("user_id") == user_id]

        # Filter by document_id if provided
        if document_id:
            store = [item for item in store if item.get("document_id") == document_id]

        if not store:
            return []

        query_vec = generate_text_embedding(query)
        scored_items = []

        for item in store:
            emb = item.get("embedding", [])
            score = _cosine_similarity(query_vec, emb)
            scored_items.append((score, item))

        scored_items.sort(key=lambda x: x[0], reverse=True)
        top_matches = [item for score, item in scored_items[:top_k]]
        return top_matches

    @classmethod
    def delete_document_chunks(cls, document_id: str, user_id: Optional[str] = None) -> bool:
        """
        Deletes vector embeddings for a document belonging to user_id.
        """
        store = _load_vector_store()
        if user_id:
            updated_store = [item for item in store if not (item.get("document_id") == document_id and item.get("user_id") == user_id)]
        else:
            updated_store = [item for item in store if item.get("document_id") != document_id]

        _save_vector_store(updated_store)
        return True
