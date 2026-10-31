import logging
from langchain_groq import ChatGroq
from app.agents.state import ResearchState
from app.config import settings
from app.utils.burstiness import check_burstiness, find_banned_words

logger = logging.getLogger("aurora.agents.polish")


async def polish_node(state: ResearchState) -> ResearchState:
    if state.get("writing_style") == "academic":
        state["polished_draft"] = state.get("draft", "")
        state["current_step"] = "polish_skipped"
        state["progress"] = 80
        return state

    draft = state.get("draft", "")
    prompt = (
        "You are an academic editor. Rewrite to improve readability.\n"
        "STRICT RULES:\n"
        "1. Vary sentence length (mix 8-12 word and 25-35 word sentences)\n"
        "2. Remove these words: delve, tapestry, landscape, crucial, \n"
        "   pivotal, intricate, realm, testament, navigate, underscore,\n"
        "   furthermore, moreover, multifaceted, paradigm, leverage, \n"
        "   seamless, it is important to note, in conclusion\n"
        "3. Allow contractions where natural\n"
        "4. Add hedged stance: 'The evidence suggests', 'This is contested'\n"
        "5. Vary paragraph openings\n"
        "6. KEEP ALL {cite:xxx} MARKERS UNCHANGED\n"
        "7. KEEP ALL FACTUAL CLAIMS UNCHANGED\n"
        f"Draft: {draft}"
    )

    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.2
    )

    try:
        response = await llm.ainvoke(prompt)
        polished_text = response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        logger.warning(f"Polish LLM invocation failed ({e}). Keeping original draft.")
        polished_text = draft

    state["polished_draft"] = polished_text
    burst_res = check_burstiness(polished_text)
    state["burstiness"] = burst_res.get("score", 0.0)
    state["banned_words_found"] = find_banned_words(polished_text)
    state["current_step"] = "polish_complete"
    state["progress"] = 80
    return state
