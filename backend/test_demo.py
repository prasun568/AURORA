"""
AURORA Module and Engine Verification Test Script
Tests all core modules, routing inference, and stylometric safeguards.
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("1. Testing Module Imports...")
print("=" * 60)

try:
    import app.config as config
    print("  [OK] app.config")
    import app.database as database
    print("  [OK] app.database")
    import app.models.research as models_research
    print("  [OK] app.models.research")
    import app.router.semantic_router as semantic_router
    print("  [OK] app.router.semantic_router")
    import app.memory.vector_store as vector_store
    print("  [OK] app.memory.vector_store")
    import app.memory.knowledge_graph as knowledge_graph
    print("  [OK] app.memory.knowledge_graph")
    import app.vericite.verifier as verifier
    print("  [OK] app.vericite.verifier")
    import app.utils.burstiness as burstiness
    print("  [OK] app.utils.burstiness")
    import app.agents.state as agents_state
    print("  [OK] app.agents.state")
    import app.agents.planner as agents_planner
    print("  [OK] app.agents.planner")
    import app.agents.searcher as agents_searcher
    print("  [OK] app.agents.searcher")
    import app.agents.screener as agents_screener
    print("  [OK] app.agents.screener")
    import app.agents.reader as agents_reader
    print("  [OK] app.agents.reader")
    import app.agents.analyzer as agents_analyzer
    print("  [OK] app.agents.analyzer")
    import app.agents.writer as agents_writer
    print("  [OK] app.agents.writer")
    import app.agents.polish as agents_polish
    print("  [OK] app.agents.polish")
    import app.agents.citation_validator as agents_citation_validator
    print("  [OK] app.agents.citation_validator")
    import app.agents.quality_control as agents_quality_control
    print("  [OK] app.agents.quality_control")
    import app.agents.mediator as agents_mediator
    print("  [OK] app.agents.mediator")
    import app.agents.formatter as agents_formatter
    print("  [OK] app.agents.formatter")
    import app.agents.supervisor as agents_supervisor
    print("  [OK] app.agents.supervisor")
    import app.api.websocket as api_websocket
    print("  [OK] app.api.websocket")
    import app.api.routes as api_routes
    print("  [OK] app.api.routes")
    import app.main as app_main
    print("  [OK] app.main")
except Exception as e:
    print(f"FAILED TO IMPORT MODULE: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("2. Testing Semantic SBERT Router...")
print("=" * 60)

router = semantic_router.SemanticRouter()
sample_query = "find research papers and literature on post-quantum cryptography"
route, score = router.route(sample_query)
print(f"  Query: '{sample_query}'")
print(f"  Matched Route: '{route}' (confidence: {score:.4f})")
assert route in router.routes or route == "general", f"Unexpected route {route}"
tool_decision = router.get_tool_for_query(sample_query)
print(f"  Dispatched Tool: {tool_decision}")

print("\n" + "=" * 60)
print("3. Testing Stylometric Burstiness & Safeguards...")
print("=" * 60)

sample_academic_text = (
    "Quantum computing introduces non-polynomial algorithmic speedups against asymmetric key cryptography. "
    "Shor's algorithm specifically solves discrete logarithms in polynomial time. "
    "Consequently, standard RSA and ECC primitives will fail under fault-tolerant quantum regimes. "
    "Lattice-based post-quantum candidates provide strong worst-case reduction guarantees. "
    "However, parameter sizing must balance memory and computational overhead across IoT devices."
)

burst_results = burstiness.check_burstiness(sample_academic_text)
print(f"  Burstiness Score: {burst_results['score']:.4f} (verdict: {burst_results['verdict']})")
print(f"  Mean sentence length: {burst_results['mean_length']:.2f} words, Stdev: {burst_results['stdev']:.2f}")

flagged_text = "In conclusion, it is crucial to delve into the intricate landscape and leverage multifaceted paradigms."
banned_found = burstiness.find_banned_words(flagged_text)
print(f"  Banned words detected in test text: {banned_found}")
assert len(banned_found) > 0, "Banned words should have been caught!"

print("\n" + "=" * 60)
print("ALL IMPORTS OK")
print("=" * 60)
