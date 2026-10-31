from typing import Any, Dict, Tuple
from sentence_transformers import SentenceTransformer, util


class SemanticRouter:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.routes = {
            "search": ["find information about", "search for papers"],
            "analyze": ["analyze this data", "what are the findings"],
            "write": ["write a report", "generate a summary"],
            "verify": ["check if citation is real", "verify source"],
        }
        # Pre-encode all routes
        self.route_embeddings = {
            route_name: self.model.encode(utterances, convert_to_tensor=True)
            for route_name, utterances in self.routes.items()
        }

        self.agent_tool_mapping = {
            "search": {"agent": "SearcherAgent", "tool": "academic_search"},
            "analyze": {"agent": "AnalyzerAgent", "tool": "thematic_analyzer"},
            "write": {"agent": "WriterAgent", "tool": "literature_synthesizer"},
            "verify": {"agent": "VeriCiteAgent", "tool": "crossref_sbert_verifier"},
            "general": {"agent": "SupervisorAgent", "tool": "orchestrator_pipeline"},
        }

    def route(self, query: str, threshold: float = 0.5) -> Tuple[str, float]:
        query_emb = self.model.encode(query, convert_to_tensor=True)
        best_route = "general"
        best_score = 0.0

        for route_name, embs in self.route_embeddings.items():
            sims = util.cos_sim(query_emb, embs)
            max_sim = sims.max().item()
            if max_sim > best_score:
                best_score = max_sim
                best_route = route_name

        if best_score >= threshold:
            return best_route, float(best_score)
        return "general", float(best_score)

    def get_tool_for_query(self, query: str) -> Dict[str, Any]:
        route_name, score = self.route(query)
        mapping = self.agent_tool_mapping.get(
            route_name,
            {"agent": "SupervisorAgent", "tool": "orchestrator_pipeline"}
        )
        return {
            "route": route_name,
            "agent": mapping["agent"],
            "tool": mapping["tool"],
            "confidence": score
        }


semantic_router = SemanticRouter()
