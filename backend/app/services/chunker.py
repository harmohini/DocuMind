import logging
from typing import List, Dict, Any

logger = logging.getLogger("documind.chunker")

def chunk_pages_data(pages_data: List[Dict[str, Any]], chunk_size_words: int = 250, overlap_words: int = 50) -> List[Dict[str, Any]]:
    """
    Splits page-structured text into overlapping chunks, tracking source page numbers.
    Returns: [{"chunk_index": 0, "page": 1, "text": "..."}, ...]
    """
    chunks = []
    chunk_index = 0

    for page_info in pages_data:
        page_num = page_info.get("page", 1)
        text = page_info.get("text", "")
        words = text.split()

        if not words:
            continue

        if len(words) <= chunk_size_words:
            chunks.append({
                "chunk_index": chunk_index,
                "page": page_num,
                "text": text
            })
            chunk_index += 1
        else:
            start = 0
            while start < len(words):
                end = start + chunk_size_words
                chunk_words = words[start:end]
                chunk_text = " ".join(chunk_words)
                
                chunks.append({
                    "chunk_index": chunk_index,
                    "page": page_num,
                    "text": chunk_text
                })
                chunk_index += 1
                start += (chunk_size_words - overlap_words)

    return chunks
