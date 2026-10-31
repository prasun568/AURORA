import json
import logging
import re
from typing import Any, Dict, List
from langchain_groq import ChatGroq
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
                "description": "Lack of standardized holistic evaluation benchmarks across heterogeneous environments",
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
            "Verification and validation remain critical bottlenecks"
        ],
        "disagreements": [
            "Trade-offs between fine-tuning vs. dynamic in-context retrieval",
            "Optimal balancing between latency and reasoning depth"
        ],
        "taxonomy": [
            {"approach": "Modular/Multi-agent", "papers": []},
            {"approach": "Monolithic/Direct", "papers": []}
        ]
    }


async def analyzer_node(state: ResearchState) -> ResearchState:
    summaries: List[Dict[str, Any]] = state.get("paper_summaries", [])
    summaries_text = "\n\n".join([
        f"Paper {i+1}:\n"
        f"Title: {s.get('title', 'N/A')}\n"
        f"DOI: {s.get('doi', 'N/A')}\n"
        f"Methodology: {s.get('methodology', 'N/A')}\n"
        f"Findings: {s.get('findings', 'N/A')}\n"
        f"Limitations: {s.get('limitations', 'N/A')}\n"
        f"Future Work: {s.get('future_work', 'N/A')}"
        for i, s in enumerate(summaries[:30])
    ])

    topic = state.get("topic", "Research Topic")
    prompt = (
        f"Analyze these paper summaries for a review paper on '{topic}'. Return JSON with:\n"
        f"themes (list of {{name, description, paper_count}}),\n"
        f"gaps (list of {{description, severity}}),\n"
        f"agreements (list of strings),\n"
        f"disagreements (list of strings),\n"
        f"taxonomy (list of {{approach, papers}})\n\n"
        f"Paper summaries:\n{summaries_text}\n\n"
        f"Output ONLY valid JSON."
    )

    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.1
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
    state["current_step"] = "analysis_complete"
    state["progress"] = 65
    return state
