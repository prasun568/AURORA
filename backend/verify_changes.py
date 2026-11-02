"""
AURORA Post-Change Verification Script (fast - no screener import)
Verifies model routing and state changes using file inspection only.
"""
import sys
import os
import inspect

# Only import lightweight modules - skip supervisor/screener to avoid SBERT network retry
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

errors = []


def check(cond, msg):
    if cond:
        print(f"  [OK] {msg}")
    else:
        print(f"  [FAIL] {msg}")
        errors.append(msg)


print("=" * 60)
print("AURORA Verification - Model Routing & State Schema")
print("=" * 60)

# ------------------------------------------------------------------
# 1. Config
# ------------------------------------------------------------------
print("\n[1] config.py")
from app.config import settings
check(settings.gemini_model == "gemini-2.5-flash",
      f"gemini_model='{settings.gemini_model}' (expected gemini-2.5-flash)")
check(settings.groq_model == "llama-3.3-70b-versatile",
      f"groq_model='{settings.groq_model}' (expected llama-3.3-70b-versatile)")

# ------------------------------------------------------------------
# 2. Writer (inspect source without importing supervisor)
# ------------------------------------------------------------------
print("\n[2] writer.py")
import app.agents.writer as w
writer_src = inspect.getsource(w)
writer_node_src = inspect.getsource(w.writer_node)
check("ChatGoogleGenerativeAI" in writer_src,
      "writer uses ChatGoogleGenerativeAI (Gemini)")
check("ChatGroq" not in writer_src,
      "writer does NOT use ChatGroq")
check("paper_summaries" in writer_node_src,
      "writer reads from paper_summaries")
check("[:40]" in writer_node_src,
      "writer caps at 40 summaries")
check("16384" in writer_src,
      "writer sets max_output_tokens=16384")
check("8,000" in writer_src or "8000" in writer_src,
      "writer prompt requires 8000+ words")
check("600" in writer_src,
      "writer prompt requires 600+ words per theme")
check("PRISMA" in writer_src,
      "writer prompt requires PRISMA section")
check("_validate_citations" in writer_src,
      "writer calls _validate_citations")
check("0.20" in writer_src,
      "writer regenerates if >20% citations are invalid")
for phrase in ["in this paper", "in conclusion", "it is important to note", "delve", "landscape"]:
    check(phrase in writer_src.lower(),
          f"writer forbids banned phrase: '{phrase}'")

# ------------------------------------------------------------------
# 3. Analyzer
# ------------------------------------------------------------------
print("\n[3] analyzer.py")
import app.agents.analyzer as an
analyzer_src = inspect.getsource(an)
analyzer_node_src = inspect.getsource(an.analyzer_node)
check("ChatGoogleGenerativeAI" in analyzer_src,
      "analyzer uses ChatGoogleGenerativeAI (Gemini)")
check("ChatGroq" not in analyzer_src,
      "analyzer does NOT use ChatGroq")
check("agreements" in analyzer_node_src,
      "analyzer writes agreements to state")
check("disagreements" in analyzer_node_src,
      "analyzer writes disagreements to state")
check("[:40]" in analyzer_node_src,
      "analyzer uses up to 40 summaries")

# ------------------------------------------------------------------
# 4. Quality Control
# ------------------------------------------------------------------
print("\n[4] quality_control.py")
import app.agents.quality_control as qc
qc_src = inspect.getsource(qc)
check("ChatGoogleGenerativeAI" in qc_src,
      "quality_control uses ChatGoogleGenerativeAI (Gemini)")
check("ChatGroq" not in qc_src,
      "quality_control does NOT use ChatGroq")
check("8000" in qc_src,
      "quality_control evaluates 8000 chars (was 4000)")

# ------------------------------------------------------------------
# 5. Polish
# ------------------------------------------------------------------
print("\n[5] polish.py")
import app.agents.polish as pol
pol_src = inspect.getsource(pol)
check("ChatGroq" in pol_src,
      "polish uses ChatGroq (Groq stays for stylistic rewrite)")
check("MIN_LENGTH_RATIO" in pol_src,
      "polish has MIN_LENGTH_RATIO constant")
check("0.85" in pol_src,
      "polish uses 15%=0.85 length guard")
check("academic" in pol_src,
      "polish skips for academic writing style")

# ------------------------------------------------------------------
# 6. Planner (must stay Groq)
# ------------------------------------------------------------------
print("\n[6] planner.py")
import app.agents.planner as pl
pl_src = inspect.getsource(pl)
check("ChatGroq" in pl_src,
      "planner keeps Groq")
check("ChatGoogleGenerativeAI" not in pl_src,
      "planner does NOT use Gemini")

# ------------------------------------------------------------------
# 7. State Schema (no screener import - just read file directly)
# ------------------------------------------------------------------
print("\n[7] state.py")
import app.agents.state as st
st_src = inspect.getsource(st)
check("agreements" in st_src,
      "ResearchState has agreements field")
check("disagreements" in st_src,
      "ResearchState has disagreements field")

# ------------------------------------------------------------------
# 8. Supervisor (read source file directly to avoid SBERT import)
# ------------------------------------------------------------------
print("\n[8] supervisor.py (source file check)")
sv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "app", "agents", "supervisor.py")
with open(sv_path, "r", encoding="utf-8") as f:
    sv_src = f.read()
check('"agreements": []' in sv_src,
      "supervisor initialises agreements list in initial_state")
check('"disagreements": []' in sv_src,
      "supervisor initialises disagreements list in initial_state")
check('or "academic"' in sv_src,
      "supervisor defaults writing_style to academic")

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
print("\n" + "=" * 60)
if errors:
    print(f"FAILED - {len(errors)} check(s) failed:")
    for e in errors:
        print(f"  [FAIL] {e}")
    sys.exit(1)
else:
    print("ALL CHECKS PASSED")
print("=" * 60)
