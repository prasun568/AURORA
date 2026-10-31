import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # API Keys
    groq_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    tavily_api_key: Optional[str] = None

    # Database & Storage
    database_url: str = "postgresql://aurora:aurora123@localhost:5432/aurora"
    redis_url: str = "redis://localhost:6379"
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password123"
    qdrant_url: str = "http://localhost:6333"

    # Security & Auth
    secret_key: str = "aurora-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    debug: bool = True

    # Model Defaults
    groq_model: str = "llama-3.3-70b-versatile"
    gemini_model: str = "gemini-1.5-flash"
    sbert_model: str = "all-MiniLM-L6-v2"

    # Uppercase aliases for compatibility
    @property
    def GROQ_API_KEY(self) -> Optional[str]:
        return self.groq_api_key

    @property
    def GEMINI_API_KEY(self) -> Optional[str]:
        return self.gemini_api_key

    @property
    def TAVILY_API_KEY(self) -> Optional[str]:
        return self.tavily_api_key

    @property
    def DATABASE_URL(self) -> str:
        return self.database_url

    @property
    def REDIS_URL(self) -> str:
        return self.redis_url

    @property
    def NEO4J_URI(self) -> str:
        return self.neo4j_uri

    @property
    def NEO4J_USER(self) -> str:
        return self.neo4j_user

    @property
    def NEO4J_PASSWORD(self) -> str:
        return self.neo4j_password

    @property
    def QDRANT_URL(self) -> str:
        return self.qdrant_url

    @property
    def SECRET_KEY(self) -> str:
        return self.secret_key

    @property
    def JWT_ALGORITHM(self) -> str:
        return self.jwt_algorithm

    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return self.access_token_expire_minutes

    @property
    def DEBUG(self) -> bool:
        return self.debug

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
