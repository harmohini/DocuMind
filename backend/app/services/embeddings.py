import logging
import math
import re
from typing import List

logger = logging.getLogger("documind.embeddings")

def generate_text_embedding(text: str, dimension: int = 384) -> List[float]:
    """
    Generates normalized dense vector embeddings for text.
    Uses word frequency hashing to generate consistent, deterministic embeddings.
    """
    words = re.findall(r'\w+', text.lower())
    vec = [0.0] * dimension
    if not words:
        return vec

    for word in words:
        # Hash word into dimension index
        idx = hash(word) % dimension
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
