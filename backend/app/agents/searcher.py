import asyncio
import logging
import xml.etree.ElementTree as ET
from typing import Any, Dict, List, Optional
import httpx
from tavily import TavilyClient
from app.agents.state import ResearchState
from app.config import settings

logger = logging.getLogger("aurora.agents.searcher")


def _parse_arxiv_response(xml_text: str) -> List[Dict[str, Any]]:
    papers = []
    try:
        root = ET.fromstring(xml_text)
        ns = {
            "atom": "http://www.w3.org/2005/Atom",
            "arxiv": "http://arxiv.org/schemas/atom"
        }
        for entry in root.findall("atom:entry", ns):
            title_elem = entry.find("atom:title", ns)
            title = title_elem.text.strip().replace("\n", " ") if title_elem is not None and title_elem.text else ""

            summary_elem = entry.find("atom:summary", ns)
            abstract = summary_elem.text.strip().replace("\n", " ") if summary_elem is not None and summary_elem.text else ""

            published_elem = entry.find("atom:published", ns)
            year = None
            if published_elem is not None and published_elem.text:
                try:
                    year = int(published_elem.text[:4])
                except (ValueError, TypeError):
                    year = None

            authors = []
            for author_elem in entry.findall("atom:author", ns):
                name_elem = author_elem.find("atom:name", ns)
                if name_elem is not None and name_elem.text:
                    authors.append(name_elem.text.strip())

            id_elem = entry.find("atom:id", ns)
            url = id_elem.text.strip() if id_elem is not None and id_elem.text else ""

            doi_elem = entry.find("arxiv:doi", ns)
            doi = doi_elem.text.strip() if doi_elem is not None and doi_elem.text else None
            if not doi and "/abs/" in url:
                doi = f"10.48550/arXiv.{url.split('/abs/')[-1].strip()}"

            if title:
                papers.append({
                    "title": title,
                    "authors": authors,
                    "year": year,
                    "doi": doi,
                    "abstract": abstract,
                    "url": url,
                    "source": "arxiv"
                })
    except Exception as e:
        logger.warning(f"Error parsing arXiv XML: {e}")
    return papers


def _search_tavily_sync(tavily_client: Optional[TavilyClient], subtopic: str) -> List[Dict[str, Any]]:
    if not tavily_client:
        return []
    try:
        res = tavily_client.search(query=subtopic, search_depth="advanced", max_results=10)
        items = res.get("results", []) if isinstance(res, dict) else []
        papers = []
        for item in items:
            title = item.get("title", "").strip()
            abstract = item.get("content", "").strip()
            url = item.get("url", "")
            if title:
                papers.append({
                    "title": title,
                    "authors": [],
                    "year": None,
                    "doi": None,
                    "abstract": abstract,
                    "url": url,
                    "source": "tavily"
                })
        return papers
    except Exception as e:
        logger.warning(f"Tavily search failed for '{subtopic}': {e}")
        return []


async def _search_subtopic(
    subtopic: str,
    tavily_client: Optional[TavilyClient],
    client: httpx.AsyncClient
) -> List[Dict[str, Any]]:
    async def fetch_tavily() -> List[Dict[str, Any]]:
        try:
            return await asyncio.to_thread(_search_tavily_sync, tavily_client, subtopic)
        except Exception:
            return []

    async def fetch_arxiv() -> List[Dict[str, Any]]:
        try:
            resp = await client.get(
                "http://export.arxiv.org/api/query",
                params={"search_query": f"all:{subtopic}", "max_results": 10}
            )
            if resp.status_code == 200:
                return _parse_arxiv_response(resp.text)
        except Exception as e:
            logger.warning(f"arXiv request failed for '{subtopic}': {e}")
        return []

    t_res, a_res = await asyncio.gather(fetch_tavily(), fetch_arxiv(), return_exceptions=True)
    results = []
    if isinstance(t_res, list):
        results.extend(t_res)
    if isinstance(a_res, list):
        results.extend(a_res)
    return results


async def searcher_node(state: ResearchState) -> ResearchState:
    subtopics = state.get("subtopics", [])
    if not subtopics:
        subtopics = [state.get("topic", "")]

    tavily_client = None
    if settings.tavily_api_key:
        try:
            tavily_client = TavilyClient(api_key=settings.tavily_api_key)
        except Exception as e:
            logger.warning(f"Could not instantiate TavilyClient: {e}")

    all_results: List[Dict[str, Any]] = []
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            search_tasks = [_search_subtopic(subtopic, tavily_client, client) for subtopic in subtopics]
            grouped_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            for res in grouped_results:
                if isinstance(res, list):
                    all_results.extend(res)
    except Exception as e:
        logger.warning(f"searcher_node encountered an error: {e}")

    max_papers = state.get("max_papers") or 20
    try:
        max_papers = int(max_papers)
    except (ValueError, TypeError):
        max_papers = 20

    state["search_results"] = all_results
    state["papers"] = all_results[:max_papers]
    state["current_step"] = "search_complete"
    state["progress"] = 25
    return state
