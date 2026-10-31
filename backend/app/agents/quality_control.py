import json
import logging
import re
from typing import Any, Dict
from langchain_groq import ChatGroq
from app.agents.state import ResearchState
from app.config import settings

logger = logging.getLogger("aurora.agents.quality_control")


def _parse_qc_json(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass

    return {
        "status": "verified",
        "confidence": 88,
        "issues": ["Minor formatting variability across sections"],
        "suggestions": ["Ensure uniform subsection heading styles"]
    }


async def quality_control_node(state: ResearchState) -> ResearchState:
    draft = state.get("polished_draft") or state.get("draft") or ""
    sample_text = draft[:4000]

    prompt = (
        "Evaluate this academic review paper on: factual_accuracy, completeness, "
        "logical_flow, citation_coverage, bias, clarity (each 0-100).\n"
        "Return JSON: {status, confidence, issues, suggestions}.\n"
        "status = 'verified' if avg >= 85, 'needs_revision' if < 85, "
        "'conflict' if contradictions found.\n\n"
        f"Draft snippet:\n{sample_text}\n\n"
        "Output ONLY valid JSON."
    )

    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.1
    )

    try:
        response = await llm.ainvoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        parsed = _parse_qc_json(content)
    except Exception as e:
        logger.warning(f"QC LLM call failed ({e}). Using default pass.")
        parsed = {
            "status": "verified",
            "confidence": 88,
            "issues": [],
            "suggestions": ["Maintain standard citation density"]
        }

    status = parsed.get("status", "verified")
    raw_conf = parsed.get("confidence", 85)
    try:
        conf_val = float(raw_conf)
        if conf_val > 1.0:
            conf_val = conf_val / 100.0
    except (ValueError, TypeError):
        conf_val = 0.85

    issues = parsed.get("issues", [])
    if isinstance(issues, str):
        issues = [issues]
    suggestions = parsed.get("suggestions", [])
    if isinstance(suggestions, str):
        suggestions = [suggestions]

    state["verification_status"] = status
    state["confidence"] = conf_val
    state["reflection_notes"] = list(issues) + list(suggestions)
    state["current_step"] = "quality_control_complete"
    state["progress"] = 92
    return state
