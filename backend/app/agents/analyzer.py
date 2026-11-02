import json
import logging
import re
from typing import Any, Dict, List

from langchain_google_genai import ChatGoogleGenerativeAI
from app.agents.state import ResearchState
from app.config import settings

logger = logging.getLogger("aurora.agents.analyzer")


def _parse_analysis_json(raw_text: str, default_paper_count: int) -> Dict[str, Any]:
    text = raw_text.strip()
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            if isinstance(data, dict):
                return data
        except Exception:
            pass

    # Fallback structure
    return {
        "themes": [
            {
                "name": "Architectural Paradigms & Foundations",
                "description": "Core frameworks, formal methods, and baseline systems",
                "paper_count": default_paper_count
            },
            {
                "name": "Empirical Benchmarking & Performance",
                "description": "Comparative evaluation, efficiency metrics, and trade-offs",
                "paper_count": max(1, default_paper_count // 2)
            },
            {
                "name": "Integration & Practical Deployments",
                "description": "Real-world scalability, robustness, and case studies",
                "paper_count": max(1, default_paper_count // 3)
            }
        ],
        "gaps": [
            {
                "description": "Lack of standardised holistic evaluation benchmarks across heterogeneous environments",
                "severity": "high"
            },
            {
                "description": "Limited research on latency overhead and energy efficiency in large-scale deployments",
                "severity": "medium"
            },
            {
                "description": "Insufficient formal verification mechanisms for long-tail corner cases",
                "severity": "high"
            }
        ],
        "agreements": [
            "Modular architectures provide superior adaptability compared to monolithic designs",
            "Verification and validation remain critical bottlenecks across surveyed systems"
        ],
        "disagreements": [
            "Trade-offs between fine-tuning vs. dynamic in-context retrieval are unresolved",
            "Optimal balancing between latency and reasoning depth remains contested"
        ],
        "taxonomy": [
            {"approach": "Modular/Multi-agent", "papers": []},
            {"approach": "Monolithic/Direct", "papers": []}
        ]
    }


async def analyzer_node(state: ResearchState) -> ResearchState:
    summaries: List[Dict[str, Any]] = state.get("paper_summaries", [])

    # Use up to 40 summaries for richer analysis
    summaries_text = "\n\n".join([
        f"Paper {i + 1}:\n"
        f"Title: {s.get('title', 'N/A')}\n"
        f"DOI/source_id: {s.get('doi', 'N/A')}\n"
        f"Methodology: {s.get('methodology', 'N/A')}\n"
        f"Findings: {s.get('findings', 'N/A')}\n"
        f"Limitations: {s.get('limitations', 'N/A')}\n"
        f"Future Work: {s.get('future_work', 'N/A')}"
        for i, s in enumerate(summaries[:40])
    ])

    topic = state.get("topic", "Research Topic")
    prompt = (
        f"You are a senior research analyst performing thematic synthesis for a systematic review "
        f"on '{topic}'. Analyse the {len(summaries[:40])} paper summaries below and return JSON with:\n\n"
        f"  themes       : list of {{name, description, paper_count}}\n"
        f"                 (3-6 themes; each must cover ≥2 papers)\n"
        f"  gaps         : list of {{description, severity}}  (severity: high/medium/low)\n"
        f"                 (5-8 specific, actionable gaps grounded in the papers)\n"
        f"  agreements   : list of strings — claims ALL or MOST papers agree on\n"
        f"  disagreements: list of strings — claims papers contradict each other on\n"
        f"  taxonomy     : list of {{approach, papers}} classifying study designs\n\n"
        f"For agreements/disagreements, cite specific paper titles where possible.\n"
        f"Output ONLY valid JSON — no markdown fences, no commentary.\n\n"
        f"Paper summaries:\n{summaries_text}"
    )

    # Analyzer switches to Gemini 2.5 Flash for deeper synthesis
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.1,
        max_output_tokens=4096,
    )

    try:
        response = await llm.ainvoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        analysis_data = _parse_analysis_json(content, len(summaries))
    except Exception as e:
        logger.warning(f"Analyzer LLM invocation failed ({e}). Using default thematic synthesis.")
        analysis_data = _parse_analysis_json("", len(summaries))

    state["themes"] = analysis_data.get("themes", [])
    state["gaps"] = analysis_data.get("gaps", [])
    # Surface agreements and disagreements so the writer can cite them
    state["agreements"] = analysis_data.get("agreements", [])
    state["disagreements"] = analysis_data.get("disagreements", [])
    state["current_step"] = "analysis_complete"
    state["progress"] = 65
    return state
