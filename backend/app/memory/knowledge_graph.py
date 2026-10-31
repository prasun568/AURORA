import logging
import re
from typing import Optional
from neo4j import AsyncGraphDatabase
from app.config import settings

logger = logging.getLogger("aurora.memory.knowledge_graph")


class KnowledgeGraph:
    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None
    ):
        target_uri = uri or settings.neo4j_uri
        target_user = user or settings.neo4j_user
        target_password = password or settings.neo4j_password

        self.driver = AsyncGraphDatabase.driver(
            target_uri,
            auth=(target_user, target_password)
        )

    async def add_concept(self, name: str, domain: str):
        try:
            async with self.driver.session() as session:
                await session.run(
                    "MERGE (c:Concept {name: $name}) "
                    "ON CREATE SET c.domain = $domain, c.created_at = timestamp()",
                    name=name, domain=domain
                )
        except Exception as e:
            logger.warning(f"Error adding concept '{name}' to KnowledgeGraph: {e}")

    async def add_paper(self, title: str, doi: str, year: Optional[int] = None):
        try:
            async with self.driver.session() as session:
                await session.run(
                    "MERGE (p:Paper {doi: $doi}) "
                    "ON CREATE SET p.title = $title, p.year = $year, p.created_at = timestamp()",
                    title=title, doi=doi, year=year
                )
        except Exception as e:
            logger.warning(f"Error adding paper '{title}' to KnowledgeGraph: {e}")

    async def add_relationship(self, c1: str, c2: str, rel: str):
        # Sanitize rel to valid Cypher relationship type
        clean_rel = re.sub(r"[^A-Za-z0-9_]", "_", rel).upper() or "RELATES_TO"
        query = (
            f"MATCH (a {{name: $c1}}), (b {{name: $c2}}) "
            f"MERGE (a)-[r:{clean_rel}]->(b) "
            f"RETURN r"
        )
        try:
            async with self.driver.session() as session:
                await session.run(query, c1=c1, c2=c2)
        except Exception as e:
            logger.warning(f"Error adding relationship between '{c1}' and '{c2}': {e}")

    async def close(self):
        try:
            await self.driver.close()
        except Exception as e:
            logger.warning(f"Error closing KnowledgeGraph driver: {e}")


knowledge_graph = KnowledgeGraph()
