from typing import Any, Dict, Optional
import httpx
from sentence_transformers import SentenceTransformer, util

# Load SBERT at module level
sbert = SentenceTransformer("all-MiniLM-L6-v2")


class VeriCiteEngine:
    async def verify_claim(
        self,
        claim: str,
        doi: Optional[str] = None,
        title_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        # Layer 2: CrossRef lookup
        source = None
        if doi:
            try:
                r = httpx.get(
                    f"https://api.crossref.org/works/{doi}",
                    headers={"User-Agent": "AURORA/1.0 (mailto:aurora@mits.edu)"},
                    timeout=10.0
                )
                if r.status_code == 200:
                    data = r.json()["message"]
                    source = {
                        "title": data.get("title", [""])[0],
                        "doi": doi
                    }
            except Exception:
                pass

        if not source and title_hint:
            try:
                r = httpx.get(
                    "https://api.crossref.org/works",
                    params={"query.bibliographic": title_hint, "rows": 1},
                    headers={"User-Agent": "AURORA/1.0 (mailto:aurora@mits.edu)"},
                    timeout=10.0
                )
                if r.status_code == 200:
                    items = r.json()["message"]["items"]
                    if items:
                        source = {
                            "title": items[0]["title"][0],
                            "doi": items[0].get("DOI")
                        }
            except Exception:
                pass

        if not source:
            return {
                "status": "REJECTED",
                "confidence": 0.0,
                "claim": claim,
                "bibtex": ""
            }

        # Layer 3: SBERT similarity
        claim_emb = sbert.encode(claim)
        title_emb = sbert.encode(source["title"])
        sim = util.cos_sim(claim_emb, title_emb).item()

        if sim > 0.70:
            status = "VERIFIED"
        elif sim > 0.40:
            status = "PARTIAL"
        else:
            status = "REJECTED"

        return {
            "claim": claim,
            "source_title": source["title"],
            "doi": source.get("doi"),
            "verified": status == "VERIFIED",
            "confidence": sim,
            "status": status,
            "bibtex": f"@article{{{doi or 'x'}, title={{{source['title']}}}, doi={{{source.get('doi', '')}}}}}"
        }


verifier = VeriCiteEngine()
