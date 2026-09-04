import io
import logging
from typing import List, Dict, Any

logger = logging.getLogger("documind.docx_extractor")

def extract_text_from_docx_bytes(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extracts text from DOCX binary content.
    Returns page-structured data list.
    """
    pages_data = []
    try:
        import docx
        doc_file = io.BytesIO(file_bytes)
        doc = docx.Document(doc_file)
        
        full_text = []
        for p in doc.paragraphs:
            if p.text.strip():
                full_text.append(p.text.strip())
                
        text = "\n".join(full_text)
        clean_text = " ".join(text.split())
        
        # Approximate 500 words per page for DOCX pagination
        words = clean_text.split()
        words_per_page = 400
        total_pages = max(1, (len(words) + words_per_page - 1) // words_per_page)
        
        for p_num in range(1, total_pages + 1):
            start_idx = (p_num - 1) * words_per_page
            end_idx = p_num * words_per_page
            page_text = " ".join(words[start_idx:end_idx])
            pages_data.append({
                "page": p_num,
                "text": page_text
            })
    except Exception as e:
        logger.error(f"Error reading DOCX bytes: {str(e)}")
        raw_text = file_bytes.decode('utf-8', errors='ignore')
        clean = " ".join(raw_text.split())
        pages_data.append({"page": 1, "text": clean or "Document text content."})

    return pages_data
