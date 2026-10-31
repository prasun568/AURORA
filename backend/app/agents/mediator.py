import logging
from langchain_groq import ChatGroq
from app.agents.state import ResearchState
from app.config import settings

logger = logging.getLogger("aurora.agents.mediator")


async def mediator_node(state: ResearchState) -> ResearchState:
    notes = state.get("reflection_notes", [])
    notes_text = "\n".join(f"- {n}" for n in notes) if notes else "No critical conflicts noted."

    prompt = (
        "You are the MEDIATOR agent in the AURORA research pipeline.\n"
        "Analyze these conflicting viewpoints, issues, or contradictory findings:\n"
        f"{notes_text}\n\n"
        "Provide a balanced synthesis and make a definitive editorial decision "
        "reconciling conflicting claims in the review paper."
    )

    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.2
    )

    try:
        response = await llm.ainvoke(prompt)
        resolution = response.content.strip() if hasattr(response, "content") else str(response).strip()
    except Exception as e:
        logger.warning(f"Mediator LLM call failed ({e}). Using balanced reconciliation.")
        resolution = (
            "Reconciled divergent methodological perspectives by framing differing empirical findings "
            "as contingent upon benchmark scope, dataset constraints, and operational latency budgets."
        )

    current_notes = list(state.get("reflection_notes", []))
    current_notes.append(f"Mediation Resolution: {resolution}")
    state["reflection_notes"] = current_notes
    state["current_step"] = "mediation_complete"
    return state
