import logging

from langchain_groq import ChatGroq
from app.agents.state import ResearchState
from app.config import settings
from app.utils.burstiness import check_burstiness, find_banned_words

logger = logging.getLogger("aurora.agents.polish")

# If the polished output is more than 15% shorter than the original,
# treat the LLM as having hallucinated/truncated and keep the draft.
MIN_LENGTH_RATIO = 0.85


async def polish_node(state: ResearchState) -> ResearchState:
    writing_style = state.get("writing_style", "academic")
    draft = state.get("draft", "")

    # -----------------------------------------------------------------------
    # "academic" is the default style: skip polishing entirely.
    # Polishing only activates when the user explicitly requests another style
    # (e.g. "plain", "journalistic", "informal").
    # -----------------------------------------------------------------------
    if writing_style == "academic" or not writing_style:
        logger.info("Writing style is 'academic' — skipping polish pass.")
        state["polished_draft"] = draft
        state["burstiness"] = check_burstiness(draft).get("score", 0.0)
        state["banned_words_found"] = find_banned_words(draft)
        state["current_step"] = "polish_skipped"
        state["progress"] = 80
        return state

    # -----------------------------------------------------------------------
    # Non-academic style: run the polish pass (Groq — fast, cheap).
    # -----------------------------------------------------------------------
    prompt = (
        f"You are an academic editor adapting a review paper to a '{writing_style}' register.\n"
        "STRICT RULES:\n"
        "1. Vary sentence length (mix 8–12 word and 25–35 word sentences).\n"
        "2. Remove these words: delve, tapestry, landscape, crucial,\n"
        "   pivotal, intricate, realm, testament, navigate, underscore,\n"
        "   furthermore, moreover, multifaceted, paradigm, leverage,\n"
        "   seamless, it is important to note, in conclusion.\n"
        "3. Allow contractions where natural.\n"
        "4. Add hedged stance: 'The evidence suggests', 'This is contested'.\n"
        "5. Vary paragraph openings.\n"
        "6. KEEP ALL {cite:xxx} MARKERS UNCHANGED — do NOT move or remove them.\n"
        "7. KEEP ALL FACTUAL CLAIMS UNCHANGED.\n"
        "8. Return the COMPLETE rewritten document — do NOT truncate.\n"
        f"Draft:\n{draft}"
    )

    # Polish uses Groq (fast, low-cost for stylistic rewriting)
    llm = ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=0.2
    )

    polished_text = draft  # default fallback

    try:
        response = await llm.ainvoke(prompt)
        candidate = response.content if hasattr(response, "content") else str(response)

        # Guard: reject if polished text is >15% shorter than original
        original_len = len(draft)
        polished_len = len(candidate)
        if original_len > 0 and polished_len < original_len * MIN_LENGTH_RATIO:
            logger.warning(
                f"Polished draft is {polished_len / original_len:.0%} of original "
                f"(threshold {MIN_LENGTH_RATIO:.0%}) — discarding polished output, "
                f"keeping original draft."
            )
        else:
            polished_text = candidate

    except Exception as e:
        logger.warning(f"Polish LLM invocation failed ({e}). Keeping original draft.")

    state["polished_draft"] = polished_text
    burst_res = check_burstiness(polished_text)
    state["burstiness"] = burst_res.get("score", 0.0)
    state["banned_words_found"] = find_banned_words(polished_text)
    state["current_step"] = "polish_complete"
    state["progress"] = 80
    return state
