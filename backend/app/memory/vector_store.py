import logging
import uuid
from typing import Any, Dict, List, Optional
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger("aurora.memory.vector_store")
COLLECTION_NAME = "aurora_papers"


class VectorStore:
    def __init__(self, url: Optional[str] = None):
        # Load SBERT
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Connect QdrantClient with graceful in-memory fallback
        target_url = url or settings.qdrant_url
        try:
            self.client = QdrantClient(url=target_url, timeout=3.0)
            # Test connectivity
            self.client.get_collections()
        except Exception as e:
            logger.warning(f"Could not connect to Qdrant at {target_url} ({e}). Falling back to in-memory QdrantClient.")
            self.client = QdrantClient(":memory:")

        # Ensure collection exists
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == COLLECTION_NAME for c in collections)
            if not exists:
                self.client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
                )
                logger.info(f"Created Qdrant collection '{COLLECTION_NAME}'.")
        except Exception as e:
            logger.warning(f"Error ensuring Qdrant collection '{COLLECTION_NAME}': {e}")

    def add_paper(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        paper_id = str(uuid.uuid4())
        vector = self.model.encode(text).tolist()
        payload = dict(metadata or {})
        payload["text"] = text

        try:
            self.client.upsert(
                collection_name=COLLECTION_NAME,
                points=[
                    models.PointStruct(id=paper_id, vector=vector, payload=payload)
                ]
            )
        except Exception as e:
            logger.error(f"Failed to upsert paper to vector store: {e}")

        return paper_id

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_vector = self.model.encode(query).tolist()
        try:
            if hasattr(self.client, "search"):
                hits = self.client.search(
                    collection_name=COLLECTION_NAME,
                    query_vector=query_vector,
                    limit=top_k
                )
            else:
                res = self.client.query_points(
                    collection_name=COLLECTION_NAME,
                    query=query_vector,
                    limit=top_k
                )
                hits = res.points

            results = []
            for hit in hits:
                results.append({
                    "id": str(hit.id),
                    "score": float(hit.score),
                    "payload": hit.payload or {}
                })
            return results
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")
            return []


vector_store = VectorStore()
