import json
import logging
import re
from typing import List
from langchain_groq import ChatGroq
from app.agents.state import ResearchState
from app.config import settings

logger = logging.getLogger("aurora.agents.planner")


def _parse_subtopics(raw_content: str) -> List[str]:
    text = raw_content.strip()
    # Try direct JSON parsing
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except Exception:
        pass

    # Try regex extraction of JSON array
    json_match = re.search(r"\[.*\]", text, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except Exception:
            pass

    # Fallback to line-split on error
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        s = line.strip().lstrip("0123456789.-*•[]\",' ")
        if s:
            cleaned.append(s)
    return cleaned if cleaned else ["Overview", "Methodologies", "Applications", "Challenges"]


async def planner_node(state: ResearchState) -> ResearchState:
    review_type = state.get("review_type", "systematic")
    topic = state.get("topic", "")
    prompt = (
        f"Break this topic into 3-6 subtopics for a {review_type} "
        f"review paper: {topic}. Output ONLY a JSON array of strings."
    )

    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0
    )

    try:
        response = await llm.ainvoke(prompt)
        raw_text = response.content if hasattr(response, "content") else str(response)
        subtopics = _parse_subtopics(raw_text)
    except Exception as e:
        logger.warning(f"Planner LLM call failed ({e}); using fallback decomposition.")
        subtopics = [
            f"{topic} foundations and overview",
            f"{topic} methodologies and approaches",
            f"{topic} applications and evaluation",
            f"{topic} challenges and future directions"
        ]

    state["subtopics"] = subtopics
    state["search_strategy"] = {
        "keywords": subtopics,
        "databases": ["arxiv", "pubmed", "tavily"],
        "date_range": f"{state.get('date_start')}-{state.get('date_end')}"
    }
    state["current_step"] = "planning_complete"
    state["progress"] = 5
    return state
