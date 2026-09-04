import logging
import math
import re
import hashlib
from typing import List

logger = logging.getLogger("documind.embeddings")

def generate_text_embedding(text: str, dimension: int = 384) -> List[float]:
    """
    Generates normalized dense vector embeddings for text.
    Uses md5 hashing to generate 100% deterministic, process-independent embeddings.
    """
    words = re.findall(r'\w+', text.lower())
    vec = [0.0] * dimension
    if not words:
        return vec

    for word in words:
        # Deterministic hashing into dimension index
        word_hash = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
        idx = word_hash % dimension
        vec[idx] += 1.0

    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]

    return vec

def generate_batch_embeddings(texts: List[str], dimension: int = 384) -> List[List[float]]:
    """
    Batch embedding generation.
    """
    return [generate_text_embedding(t, dimension) for t in texts]

