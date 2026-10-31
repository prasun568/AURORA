from typing import Any, Dict, List, Optional, Union
from typing_extensions import TypedDict


class ResearchState(TypedDict, total=False):
    # Core Task Parameters
    task_id: str
    topic: str
    review_type: str
    citation_style: str
    template: str
    writing_style: str
    date_start: Optional[Union[str, int]]
    date_end: Optional[Union[str, int]]
    max_papers: int

    # Planning & Search Strategy
    subtopics: List[str]
    search_strategy: Dict[str, Any]

    # Search & Literature Mining
    search_results: List[Dict[str, Any]]
    papers: List[Dict[str, Any]]

    # Analysis & Synthesis
    paper_summaries: List[Dict[str, Any]]
    themes: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]

    # Drafting & Content Generation
    draft: Optional[str]
    polished_draft: Optional[str]

    # Citations & Bibliography
    citations: List[Dict[str, Any]]
    bibtex: Optional[str]

    # Quality, Burstiness & Stylometrics
    burstiness: float
    banned_words_found: List[str]

    # Verification & Reflection
    confidence: float
    verification_status: str
    reflection_notes: List[str]

    # Orchestration State Tracking
    current_step: str
    progress: float
    errors: List[str]
