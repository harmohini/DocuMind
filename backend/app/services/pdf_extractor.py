import io
import logging
from typing import List, Dict, Any

logger = logging.getLogger("documind.pdf_extractor")

def extract_text_by_pages_from_bytes(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extracts text page by page from PDF binary content.
    Returns a list of dicts: [{"page": 1, "text": "Page content..."}, ...]
    """
    pages_data = []
    try:
        from pypdf import PdfReader
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            clean_text = " ".join(text.split())
            if clean_text:
                pages_data.append({
                    "page": i + 1,
                    "text": clean_text
                })
    except Exception as e:
        logger.error(f"Error reading PDF bytes: {str(e)}")
        # Fallback text extraction if PDF reading encounters formatting issues
        try:
            raw_text = file_bytes.decode('utf-8', errors='ignore')
            clean = " ".join(raw_text.split())
            if clean:
                pages_data.append({"page": 1, "text": clean})
        except Exception:
            pass

    if not pages_data:
        pages_data.append({"page": 1, "text": "Empty or non-extractable document text."})

    return pages_data
