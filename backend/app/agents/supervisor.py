import logging
from typing import Any, Dict
from langgraph.graph import END, StateGraph
from app.agents.analyzer import analyzer_node
from app.agents.citation_validator import citation_validator_node
from app.agents.formatter import formatter_node
from app.agents.mediator import mediator_node
from app.agents.planner import planner_node
from app.agents.polish import polish_node
from app.agents.quality_control import quality_control_node
from app.agents.reader import reader_node
from app.agents.screener import screener_node
from app.agents.searcher import searcher_node
from app.agents.state import ResearchState
from app.agents.writer import writer_node
from app.api.websocket import broadcast_update

logger = logging.getLogger("aurora.agents.supervisor")

PHASE_PROGRESS_MAP = {
    "planning": 5,
    "searching": 25,
    "screening": 40,
    "reading": 55,
    "analyzing": 65,
    "writing": 75,
    "polishing": 80,
    "verifying": 88,
    "quality_control": 92,
    "formatting": 100
}


def route_after_qc(state: ResearchState) -> str:
    status = state.get("verification_status", "verified")
    if status == "verified":
        return "accept"
    if status == "conflict":
        return "conflict"
    return "revise"


class SupervisorAgent:
    def __init__(self):
        self.graph = self._build_graph()
        self.app = self.graph.compile()

    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(ResearchState)

        # Add all 11 nodes
        workflow.add_node("planner", planner_node)
        workflow.add_node("searcher", searcher_node)
        workflow.add_node("screener", screener_node)
        workflow.add_node("reader", reader_node)
        workflow.add_node("analyzer", analyzer_node)
        workflow.add_node("writer", writer_node)
        workflow.add_node("polish", polish_node)
        workflow.add_node("citation_validator", citation_validator_node)
        workflow.add_node("quality_control", quality_control_node)
        workflow.add_node("mediator", mediator_node)
        workflow.add_node("formatter", formatter_node)

        # Entry point and linear pipeline edges
        workflow.set_entry_point("planner")
        workflow.add_edge("planner", "searcher")
        workflow.add_edge("searcher", "screener")
        workflow.add_edge("screener", "reader")
        workflow.add_edge("reader", "analyzer")
        workflow.add_edge("analyzer", "writer")
        workflow.add_edge("writer", "polish")
        workflow.add_edge("polish", "citation_validator")
        workflow.add_edge("citation_validator", "quality_control")

        # Conditional reflection and QC edges
        workflow.add_conditional_edges(
            "quality_control",
            route_after_qc,
            {
                "accept": "formatter",
                "revise": "writer",
                "conflict": "mediator"
            }
        )
        workflow.add_edge("mediator", "writer")
        workflow.add_edge("formatter", END)

        return workflow

    async def run(self, task_id: str, request: Any) -> ResearchState:
        # Build initial ResearchState from request
        if isinstance(request, dict):
            req_dict = request
        elif hasattr(request, "model_dump"):
            req_dict = request.model_dump()
        elif hasattr(request, "dict"):
            req_dict = request.dict()
        else:
            req_dict = vars(request) if hasattr(request, "__dict__") else {}

        initial_state: ResearchState = {
            "task_id": task_id,
            "topic": req_dict.get("topic", "Systematic Review Topic"),
            "review_type": req_dict.get("review_type", "systematic"),
            "citation_style": req_dict.get("citation_style") or "IEEE",
            "template": req_dict.get("template") or "IEEE Conference",
            # "academic" is the default — polish is skipped unless another style is requested
            "writing_style": req_dict.get("writing_style") or "academic",
            "date_start": req_dict.get("date_start") or req_dict.get("date_range_start"),
            "date_end": req_dict.get("date_end") or req_dict.get("date_range_end"),
            "max_papers": int(req_dict.get("max_papers") or 20),
            "subtopics": [],
            "search_strategy": {},
            "search_results": [],
            "papers": [],
            "paper_summaries": [],
            "themes": [],
            "gaps": [],
            "agreements": [],
            "disagreements": [],
            "draft": "",
            "polished_draft": "",
            "citations": [],
            "bibtex": "",
            "burstiness": 0.0,
            "banned_words_found": [],
            "confidence": 0.0,
            "verification_status": "pending",
            "reflection_notes": [],
            "current_step": "initialized",
            "progress": 0.0,
            "errors": []
        }

        final_state = initial_state
        async for event in self.app.astream(initial_state):
            for node_name, node_state in event.items():
                final_state = node_state
                step = node_state.get("current_step", "")
                progress = node_state.get("progress", 0)

                # Update fast memory registry for polling
                try:
                    from app.api.routes import update_task_progress
                    update_task_progress(task_id, step, progress, node_name)
                except Exception as ex:
                    logger.debug(f"Could not update task registry for {task_id}: {ex}")

                try:
                    await broadcast_update(task_id, {
                        "type": "progress",
                        "step": step,
                        "progress": progress,
                        "data": {
                            "subtopics": node_state.get("subtopics", []),
                            "papers_found": len(node_state.get("search_results", [])),
                            "citations_verified": sum(1 for c in node_state.get("citations", []) if c.get("verified")),
                            "burstiness": node_state.get("burstiness", 0)
                        }
                    })
                except Exception as e:
                    logger.warning(f"Failed to broadcast WebSocket update for node {node_name}: {e}")

        return final_state


supervisor_agent = SupervisorAgent()


async def run_aurora_orchestrator(task_id: str, request_data: Any) -> ResearchState:
    return await supervisor_agent.run(task_id, request_data)
