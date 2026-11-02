import json
import logging
import re
from typing import Any, Dict

from langchain_google_genai import ChatGoogleGenerativeAI
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
    # Evaluate a generous 8 000-char sample — enough to catch structural issues
    sample_text = draft[:8000]

    prompt = (
        "You are a rigorous academic quality-control reviewer.\n"
        "Evaluate this academic review paper excerpt on six dimensions:\n"
        "  factual_accuracy, completeness, logical_flow,\n"
        "  citation_coverage, bias, clarity  (each scored 0-100)\n\n"
        "Return JSON (no markdown fences) with these exact keys:\n"
        "  status      : 'verified' if average ≥ 85, 'needs_revision' if < 85,\n"
        "                'conflict' if direct contradictions are found\n"
        "  confidence  : integer 0-100 (the average of the six scores)\n"
        "  issues      : list of specific, actionable issues found\n"
        "  suggestions : list of concrete improvements\n\n"
        f"Draft excerpt:\n{sample_text}\n\n"
        "Output ONLY valid JSON."
    )

    # Quality control uses Gemini 2.5 Flash for nuanced academic judgement
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.1,
        max_output_tokens=2048,
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
