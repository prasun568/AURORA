import logging
from typing import Any, Dict, List
from sentence_transformers import SentenceTransformer, util
from app.agents.state import ResearchState

logger = logging.getLogger("aurora.agents.screener")

# Load SBERT model at module level
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")


async def screener_node(state: ResearchState) -> ResearchState:
    raw_papers: List[Dict[str, Any]] = state.get("search_results") or state.get("papers") or []

    # 1. Deduplicate by DOI
    seen_dois = set()
    deduped_papers: List[Dict[str, Any]] = []
    duplicates_removed = 0
    for paper in raw_papers:
        doi = paper.get("doi")
        if doi:
            clean_doi = str(doi).strip().lower()
            if clean_doi in seen_dois:
                duplicates_removed += 1
                continue
            seen_dois.add(clean_doi)
        deduped_papers.append(paper)

    # 2. Filter: date_start <= year <= date_end
    date_start = state.get("date_start")
    date_end = state.get("date_end")
    start_year = None
    end_year = None
    if date_start is not None:
        try:
            start_year = int(str(date_start)[:4])
        except (ValueError, TypeError):
            start_year = None
    if date_end is not None:
        try:
            end_year = int(str(date_end)[:4])
        except (ValueError, TypeError):
            end_year = None

    date_filtered: List[Dict[str, Any]] = []
    date_excluded = 0
    for paper in deduped_papers:
        year = paper.get("year")
        if year is not None:
            try:
                y = int(year)
                if start_year is not None and y < start_year:
                    date_excluded += 1
                    continue
                if end_year is not None and y > end_year:
                    date_excluded += 1
                    continue
            except (ValueError, TypeError):
                pass
        date_filtered.append(paper)

    # 3. Encode state["topic"] with SBERT
    topic = state.get("topic", "")
    topic_emb = sbert_model.encode(topic, convert_to_tensor=True)

    # 4. For each paper, encode abstract, compute cosine_similarity
    abstracts = [
        paper.get("abstract") or paper.get("title") or ""
        for paper in date_filtered
    ]

    cosine_scores: List[float] = []
    if abstracts:
        abstract_embs = sbert_model.encode(abstracts, convert_to_tensor=True)
        sim_tensor = util.cos_sim(topic_emb, abstract_embs)
        cosine_scores = sim_tensor[0].tolist() if hasattr(sim_tensor[0], "tolist") else list(sim_tensor[0])

    # 5. Keep papers with similarity > 0.4
    relevant_papers: List[Dict[str, Any]] = []
    low_relevance_excluded = 0
    for paper, score in zip(date_filtered, cosine_scores):
        paper_with_score = dict(paper)
        paper_with_score["relevance_score"] = float(score)
        if score > 0.4:
            relevant_papers.append(paper_with_score)
        else:
            low_relevance_excluded += 1

    # 6. Sort by relevance, keep top state["max_papers"]
    relevant_papers.sort(key=lambda p: p.get("relevance_score", 0.0), reverse=True)

    max_papers = state.get("max_papers") or 20
    try:
        max_papers = int(max_papers)
    except (ValueError, TypeError):
        max_papers = 20

    final_papers = relevant_papers[:max_papers]

    # Store PRISMA counts in state["search_strategy"]["prisma"]
    if "search_strategy" not in state or not isinstance(state["search_strategy"], dict):
        state["search_strategy"] = {}

    state["search_strategy"]["prisma"] = {
        "records_identified": len(raw_papers),
        "duplicates_removed": duplicates_removed,
        "records_screened": len(deduped_papers),
        "date_filtered_excluded": date_excluded,
        "reports_assessed_for_eligibility": len(date_filtered),
        "low_relevance_excluded": low_relevance_excluded,
        "studies_included": len(final_papers)
    }

    state["papers"] = final_papers
    state["current_step"] = "screening_complete"
    state["progress"] = 40
    return state
