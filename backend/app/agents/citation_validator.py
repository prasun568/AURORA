import re
from typing import Any, Dict, List
from app.agents.state import ResearchState
from app.vericite.verifier import VeriCiteEngine


def extract_sentence(text: str, marker: str) -> str:
    target = f"{{cite:{marker}}}"
    if target not in text:
        return marker
    sentences = re.split(r'(?<=[.!?])\s+', text)
    for s in sentences:
        if target in s:
            return s.replace(target, "").strip()
    return marker


async def citation_validator_node(state: ResearchState) -> ResearchState:
    draft = state.get("polished_draft") or state.get("draft") or ""
    markers = re.findall(r'\{cite:([^}]+)\}', draft)
    engine = VeriCiteEngine()
    verified: List[Dict[str, Any]] = []
    checked_markers: List[str] = []

    papers = state.get("papers") or state.get("search_results") or []

    for marker in markers:
        source = next((
            p for p in papers
            if str(p.get("doi", "")) == marker
            or str(p.get("id", "")) == marker
            or marker in str(p.get("url", ""))
        ), None)

        if not source:
            continue

        claim = extract_sentence(draft, marker)
        result = await engine.verify_claim(
            claim,
            doi=source.get("doi"),
            title_hint=source.get("title"),
            paper=source
        )
        verified.append(result)
        checked_markers.append(marker)

    # Remove REJECTED markers from draft
    clean_draft = draft
    for marker, v in zip(checked_markers, verified):
        if v.get("status") == "REJECTED":
            clean_draft = clean_draft.replace(f"{{cite:{marker}}}", "")

    # Clean double spaces
    clean_draft = re.sub(r' +', ' ', clean_draft)

    state["polished_draft"] = clean_draft
    state["citations"] = verified
    state["bibtex"] = "\n".join(v.get("bibtex", "") for v in verified if v.get("verified"))
    state["verification_status"] = "verified"
    state["confidence"] = sum(1 for v in verified if v.get("verified")) / max(len(verified), 1)
    state["current_step"] = "citation_verification_complete"
    state["progress"] = 88
    return state
