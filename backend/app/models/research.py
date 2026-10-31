from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# Auth Models
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=6)
    preferred_citation_style: Optional[str] = "IEEE"
    preferred_template: Optional[str] = "IEEE Conference"


class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    preferred_citation_style: Optional[str] = "IEEE"
    preferred_template: Optional[str] = "IEEE Conference"
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Review Paper Models
class ReviewStartRequest(BaseModel):
    topic: str = Field(..., min_length=5, description="Research topic or question")
    review_type: str = Field(
        default="systematic",
        description="systematic | narrative | scoping | meta-analysis | critical | state-of-the-art | bibliometric"
    )
    citation_style: str = Field(default="IEEE", description="IEEE | APA | MLA | Chicago | Harvard | Vancouver | BibTeX")
    template: str = Field(default="IEEE Conference", description="IEEE Conference | IEEE Journal | APA | ACM | Springer | Elsevier | Custom")
    custom_template_path: Optional[str] = None
    ai_format_description: Optional[str] = None
    date_range_start: Optional[int] = Field(default=2018, ge=1900, le=2030)
    date_range_end: Optional[int] = Field(default=2025, ge=1900, le=2030)
    max_papers: int = Field(default=50, ge=10, le=200)


class PaperItem(BaseModel):
    id: str
    task_id: Optional[str] = None
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    doi: Optional[str] = None
    abstract: Optional[str] = None
    source: str = "arXiv"
    relevance_score: float = 0.0
    included: bool = True
    url: Optional[str] = None


class CitationItem(BaseModel):
    key: str
    title: str
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    doi: Optional[str] = None
    journal: Optional[str] = None
    url: Optional[str] = None
    verification_status: str = "VERIFIED"  # VERIFIED | PARTIAL | REJECTED
    similarity_score: float = 0.95
    evidence_snippet: Optional[str] = None
    bibtex: Optional[str] = None


class ReasoningNode(BaseModel):
    agent: str
    phase: str
    timestamp: str
    action: str
    decision: str
    confidence: float
    details: Optional[Dict[str, Any]] = None


class TaskStatusResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    topic: str
    review_type: str
    citation_style: str
    template: str
    status: str  # pending | planning | searching | screening | reading | analyzing | writing | verifying | formatting | completed | failed
    current_phase: str
    progress: int  # 0-100
    created_at: datetime
    completed_at: Optional[datetime] = None


class ReviewResultResponse(BaseModel):
    id: str
    task_id: str
    topic: str
    review_type: str
    content_markdown: str
    content_latex: Optional[str] = None
    bibtex: Optional[str] = None
    citations: List[CitationItem] = Field(default_factory=list)
    prisma_diagram: Optional[Dict[str, Any]] = None
    confidence: float = 0.92
    reasoning_path: List[ReasoningNode] = Field(default_factory=list)
    completed_at: Optional[datetime] = None


class FeedbackSubmit(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class TemplateInfo(BaseModel):
    id: str
    name: str
    description: str
    is_custom: bool = False
    columns: int = 1


class CitationStyleInfo(BaseModel):
    id: str
    name: str
    family: str
