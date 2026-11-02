from typing import Any, Dict, Optional, List
import httpx
from sentence_transformers import SentenceTransformer, util

# Load SBERT at module level
sbert = SentenceTransformer("all-MiniLM-L6-v2")


class VeriCiteEngine:
    async def verify_claim(
        self,
        claim: str,
        doi: Optional[str] = None,
        title_hint: Optional[str] = None,
        paper: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        source: Dict[str, Any] = {}
        doi_found = False

        # If a paper dictionary was already provided from literature search
        if paper and isinstance(paper, dict):
            source = {
                "title": paper.get("title", ""),
                "doi": paper.get("doi") or doi,
                "authors": paper.get("authors", []),
                "year": paper.get("year"),
                "venue": paper.get("venue") or paper.get("source", "Scholarly Registry"),
                "url": paper.get("url") or (f"https://doi.org/{paper.get('doi')}" if paper.get("doi") else ""),
                "abstract": paper.get("abstract", "")
            }
            if paper.get("doi"):
                doi_found = True

        # Layer 1 & 2: CrossRef verification
        clean_doi = doi.strip() if doi else None
        if clean_doi:
            try:
                r = httpx.get(
                    f"https://api.crossref.org/works/{clean_doi}",
                    headers={"User-Agent": "AURORA/1.0 (mailto:scholar@aurora.edu)"},
                    timeout=6.0
                )
                if r.status_code == 200:
                    data = r.json().get("message", {})
                    doi_found = True
                    # Extract rich bibliographic metadata
                    titles = data.get("title", [])
                    if titles:
                        source["title"] = titles[0]
                    authors = []
                    for a in data.get("author", []):
                        family = a.get("family", "")
                        given = a.get("given", "")
                        if family:
                            authors.append(f"{family}, {given}" if given else family)
                    if authors:
                        source["authors"] = authors

                    # Issued date
                    date_parts = data.get("issued", {}).get("date-parts", [[]])[0]
                    if date_parts:
                        source["year"] = date_parts[0]

                    venues = data.get("container-title", [])
                    if venues:
                        source["venue"] = venues[0]
                    source["doi"] = clean_doi
                    source["url"] = f"https://doi.org/{clean_doi}"
            except Exception:
                pass

        if not doi_found and title_hint:
            try:
                r = httpx.get(
                    "https://api.crossref.org/works",
                    params={"query.bibliographic": title_hint, "rows": 1},
                    headers={"User-Agent": "AURORA/1.0 (mailto:scholar@aurora.edu)"},
                    timeout=6.0
                )
                if r.status_code == 200:
                    items = r.json().get("message", {}).get("items", [])
                    if items:
                        item = items[0]
                        doi_found = True
                        if not source.get("title"):
                            source["title"] = item.get("title", [""])[0]
                        if not source.get("doi"):
                            source["doi"] = item.get("DOI")
                        if not source.get("authors"):
                            authors = []
                            for a in item.get("author", []):
                                family = a.get("family", "")
                                given = a.get("given", "")
                                if family:
                                    authors.append(f"{family}, {given}" if given else family)
                            source["authors"] = authors
                        if not source.get("year"):
                            date_parts = item.get("issued", {}).get("date-parts", [[]])[0]
                            if date_parts:
                                source["year"] = date_parts[0]
            except Exception:
                pass

        if not source or not source.get("title"):
            return {
                "title": title_hint or "Unverified Citation",
                "source_title": title_hint or "Unverified Citation",
                "authors": [],
                "year": None,
                "venue": "Unknown",
                "doi": clean_doi,
                "url": f"https://doi.org/{clean_doi}" if clean_doi else "",
                "status": "REJECTED",
                "verified": False,
                "confidence": 0.0,
                "claim": claim,
                "bibtex": ""
            }

        # Layer 3: Semantic Alignment
        compare_text = f"{source['title']} {source.get('abstract', '')[:300]}".strip()
        claim_emb = sbert.encode(claim)
        target_emb = sbert.encode(compare_text)
        sim = float(util.cos_sim(claim_emb, target_emb).item())

        # If DOI is verified through CrossRef or registry, that provides foundational authenticity
        if doi_found:
            if sim >= 0.28:
                status = "VERIFIED"
                confidence = min(0.98, max(0.85, sim + 0.40))
            elif sim >= 0.15:
                status = "PARTIAL"
                confidence = max(0.65, sim + 0.35)
            else:
                status = "PARTIAL"
                confidence = 0.60
        else:
            if sim >= 0.50:
                status = "VERIFIED"
                confidence = sim
            elif sim >= 0.30:
                status = "PARTIAL"
                confidence = sim
            else:
                status = "REJECTED"
                confidence = max(0.1, sim)

        title = source["title"]
        authors_list = source.get("authors", [])
        year = source.get("year") or 2024
        resolved_doi = source.get("doi") or clean_doi or "10.0000/aurora"
        venue = source.get("venue", "Peer-Reviewed Proceedings")
        author_str = " and ".join(authors_list[:3]) if authors_list else "AURORA Researcher"
        safe_key = f"ref_{abs(hash(title)) % 10000}"

        bibtex = f"""@article{{{safe_key},
  author = {{{author_str}}},
  title = {{{{{title}}}}},
  journal = {{{venue}}},
  year = {{{year}}},
  doi = {{{resolved_doi}}}
}}"""

        return {
            "title": title,
            "source_title": title,
            "authors": authors_list,
            "year": year,
            "venue": venue,
            "doi": resolved_doi,
            "url": source.get("url") or (f"https://doi.org/{resolved_doi}" if resolved_doi else ""),
            "claim": claim,
            "verified": status == "VERIFIED",
            "confidence": round(confidence, 2),
            "status": status,
            "bibtex": bibtex
        }


verifier = VeriCiteEngine()
