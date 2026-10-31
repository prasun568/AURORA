import re
from typing import Dict
from app.agents.state import ResearchState


async def formatter_node(state: ResearchState) -> ResearchState:
    text = state.get("polished_draft") or state.get("draft") or ""
    citation_map: Dict[str, int] = {}
    counter = 1

    def _replace_citation_marker(match: re.Match) -> str:
        nonlocal counter
        key = match.group(1).strip()
        if key not in citation_map:
            citation_map[key] = counter
            counter += 1
        return f"[{citation_map[key]}]"

    # Replace {cite:xxx} with numbered [1], [2]...
    formatted_text = re.sub(r'\{cite:([^}]+)\}', _replace_citation_marker, text)
    state["polished_draft"] = formatted_text

    # Store export placeholders (TODO in M4)
    state["docx_bytes"] = None
    state["pdf_bytes"] = None
    state["latex_str"] = None

    state["current_step"] = "formatting_complete"
    state["progress"] = 100
    return state
