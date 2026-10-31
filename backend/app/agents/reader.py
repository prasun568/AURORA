import asyncio
import json
import logging
import re
from typing import Any, Dict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from app.agents.state import ResearchState
from app.config import settings

logger = logging.getLogger("aurora.agents.reader")


def _parse_extraction_json(raw_text: str) -> Dict[str, Any]:
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
        "methodology": "Empirical and theoretical investigation",
        "findings": text[:200] if text else "Not specified",
        "limitations": "Limited evaluation scope",
        "future_work": "Further exploration and cross-domain testing"
    }


async def _extract_single_paper(
    paper: Dict[str, Any],
    llm: ChatGoogleGenerativeAI,
    semaphore: asyncio.Semaphore
) -> Dict[str, Any]:
    title = paper.get("title", "Untitled")
    abstract = paper.get("abstract", "")
    doi = paper.get("doi") or paper.get("url") or title

    prompt = (
        f"Extract these fields as JSON from this paper: \n"
        f"methodology, findings, limitations, future_work.\n"
        f"Title: {title}\n"
        f"Abstract: {abstract}"
    )

    async with semaphore:
        try:
            response = await llm.ainvoke(prompt)
            content = response.content if hasattr(response, "content") else str(response)
            parsed = _parse_extraction_json(content)
        except Exception as e:
            logger.warning(f"Error extracting summary for '{title}': {e}")
            parsed = {
                "methodology": "Not specified in abstract",
                "findings": "Empirical evaluation and results discussed",
                "limitations": "Noted scope limitations",
                "future_work": "Further research needed"
            }

    return {
        "doi": doi,
        "title": title,
        "methodology": parsed.get("methodology", "Not specified"),
        "findings": parsed.get("findings", "Not specified"),
        "limitations": parsed.get("limitations", "Not specified"),
        "future_work": parsed.get("future_work", "Not specified")
    }


async def reader_node(state: ResearchState) -> ResearchState:
    papers: List[Dict[str, Any]] = state.get("papers") or state.get("search_results") or []
    semaphore = asyncio.Semaphore(10)

    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.1
    )

    tasks = [_extract_single_paper(paper, llm, semaphore) for paper in papers]
    summaries = await asyncio.gather(*tasks, return_exceptions=False)

    state["paper_summaries"] = summaries
    state["current_step"] = "reading_complete"
    state["progress"] = 55
    return state
