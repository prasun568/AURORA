"""
Formatter Agent — converts the polished draft into numbered citations
and produces real DOCX bytes, LaTeX source, and BibTeX.

Dependencies already in requirements.txt:
  python-docx, bibtexparser
"""
import io
import logging
import re
from typing import Any, Dict, List

from app.agents.state import ResearchState

logger = logging.getLogger("aurora.agents.formatter")


# ---------------------------------------------------------------------------
# Citation numbering helper
# ---------------------------------------------------------------------------

def _number_citations(text: str) -> tuple[str, Dict[str, int]]:
    """
    Replace {cite:source_id} markers with [N] numbers.
    Returns (formatted_text, citation_map {source_id: number}).
    """
    citation_map: Dict[str, int] = {}
    counter = 1

    def _replace(match: re.Match) -> str:
        nonlocal counter
        key = match.group(1).strip()
        if key not in citation_map:
            citation_map[key] = counter
            counter += 1
        return f"[{citation_map[key]}]"

    formatted = re.sub(r'\{cite:([^}]+)\}', _replace, text)
    return formatted, citation_map


# ---------------------------------------------------------------------------
# DOCX generator
# ---------------------------------------------------------------------------

def _build_docx(title: str, formatted_text: str) -> bytes:
    """Generate a properly-styled Word document and return raw bytes."""
    try:
        from docx import Document
        from docx.shared import Pt, Inches, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH

        doc = Document()

        # Page margins
        for section in doc.sections:
            section.top_margin = Inches(1.0)
            section.bottom_margin = Inches(1.0)
            section.left_margin = Inches(1.25)
            section.right_margin = Inches(1.25)

        # Document title
        title_para = doc.add_heading(level=0)
        title_run = title_para.add_run(title or "AURORA Systematic Review")
        title_run.font.size = Pt(16)
        title_run.font.bold = True
        title_run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
        title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

        doc.add_paragraph()  # spacer

        # Parse the markdown-ish text into Word paragraphs
        for line in formatted_text.splitlines():
            stripped = line.strip()
            if not stripped:
                doc.add_paragraph()
                continue

            if stripped.startswith("#### "):
                doc.add_heading(stripped[5:], level=4)
            elif stripped.startswith("### "):
                doc.add_heading(stripped[4:], level=3)
            elif stripped.startswith("## "):
                doc.add_heading(stripped[3:], level=2)
            elif stripped.startswith("# "):
                # Skip redundant H1 (already added as title above)
                pass
            elif stripped.startswith("- ") or stripped.startswith("* "):
                p = doc.add_paragraph(style="List Bullet")
                _add_inline_markdown(p, stripped[2:])
            else:
                p = doc.add_paragraph()
                p.paragraph_format.space_after = Pt(6)
                _add_inline_markdown(p, stripped)

        buf = io.BytesIO()
        doc.save(buf)
        return buf.getvalue()

    except Exception as e:
        logger.warning(f"DOCX generation failed: {e}. Returning plain-text DOCX fallback.")
        # Minimal fallback: plain text wrapped in a DOCX
        try:
            from docx import Document
            doc = Document()
            doc.add_heading(title or "AURORA Systematic Review", 0)
            for chunk in [formatted_text[i:i+5000] for i in range(0, len(formatted_text), 5000)]:
                doc.add_paragraph(chunk)
            buf = io.BytesIO()
            doc.save(buf)
            return buf.getvalue()
        except Exception as e2:
            logger.error(f"DOCX fallback also failed: {e2}")
            return b""


def _add_inline_markdown(paragraph: Any, text: str) -> None:
    """Handle **bold** and *italic* inline markdown in a docx paragraph."""
    try:
        from docx.shared import Pt
        # Split on bold (**...**) and italic (*...*)
        parts = re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*)', text)
        for part in parts:
            if part.startswith('**') and part.endswith('**'):
                run = paragraph.add_run(part[2:-2])
                run.bold = True
            elif part.startswith('*') and part.endswith('*'):
                run = paragraph.add_run(part[1:-1])
                run.italic = True
            else:
                paragraph.add_run(part)
    except Exception:
        paragraph.add_run(text)


# ---------------------------------------------------------------------------
# LaTeX generator
# ---------------------------------------------------------------------------

def _build_latex(title: str, formatted_text: str, citation_map: Dict[str, int],
                 summaries: List[Dict[str, Any]]) -> str:
    """Convert the review into a compilable LaTeX article."""

    # Build bibliography entries from paper summaries
    bib_entries: List[str] = []
    for s in summaries:
        doi = s.get("doi") or ""
        cite_key = re.sub(r'[^a-zA-Z0-9_]', '_', doi)[:40] if doi else f"ref_{len(bib_entries)+1}"
        t = s.get("title", "Unknown Title").replace("{", "\\{").replace("}", "\\}")
        bib_entries.append(
            f"\\bibitem{{{cite_key}}}\n"
            f"  {t}.\n"
            f"  \\textit{{DOI: {doi}}}\n"
        )

    # Convert markdown headers to LaTeX sections
    tex_lines: List[str] = []
    for line in formatted_text.splitlines():
        stripped = line.strip()
        if not stripped:
            tex_lines.append("")
            continue
        if stripped.startswith("#### "):
            tex_lines.append(f"\\paragraph{{{stripped[5:]}}}")
        elif stripped.startswith("### "):
            tex_lines.append(f"\\subsubsection{{{stripped[4:]}}}")
        elif stripped.startswith("## "):
            tex_lines.append(f"\\subsection{{{stripped[3:]}}}")
        elif stripped.startswith("# "):
            tex_lines.append(f"\\section{{{stripped[2:]}}}")
        elif stripped.startswith("- ") or stripped.startswith("* "):
            tex_lines.append(f"\\item {stripped[2:]}")
        else:
            # Escape special LaTeX chars (basic)
            safe = stripped.replace("&", "\\&").replace("%", "\\%").replace("_", "\\_")
            tex_lines.append(safe)

    body = "\n".join(tex_lines)

    latex = (
        "\\documentclass[12pt,a4paper]{article}\n"
        "\\usepackage[utf8]{inputenc}\n"
        "\\usepackage[T1]{fontenc}\n"
        "\\usepackage{times}\n"
        "\\usepackage{geometry}\n"
        "\\geometry{margin=1in}\n"
        "\\usepackage{hyperref}\n"
        "\\usepackage{setspace}\n"
        "\\onehalfspacing\n\n"
        f"\\title{{{title or 'AURORA Systematic Review'}}}\n"
        "\\author{AURORA Multi-Agent System}\n"
        "\\date{\\today}\n\n"
        "\\begin{document}\n"
        "\\maketitle\n"
        "\\tableofcontents\n"
        "\\newpage\n\n"
        f"{body}\n\n"
        "\\begin{thebibliography}{99}\n"
        + "\n".join(bib_entries) +
        "\n\\end{thebibliography}\n"
        "\\end{document}\n"
    )
    return latex


# ---------------------------------------------------------------------------
# BibTeX generator
# ---------------------------------------------------------------------------

def _build_bibtex(summaries: List[Dict[str, Any]], citation_map: Dict[str, int]) -> str:
    """Generate a .bib file from paper summaries."""
    entries: List[str] = []
    for i, s in enumerate(summaries):
        doi = s.get("doi") or f"ref_{i+1}"
        cite_key = re.sub(r'[^a-zA-Z0-9_]', '_', doi)[:40]
        title = s.get("title", "Unknown Title").replace("{", "\\{").replace("}", "\\}")
        year = s.get("year", "")
        url = s.get("url", "")

        entry = (
            f"@article{{{cite_key},\n"
            f"  title   = {{{title}}},\n"
        )
        if year:
            entry += f"  year    = {{{year}}},\n"
        if doi and not doi.startswith("ref_"):
            entry += f"  doi     = {{{doi}}},\n"
        if url:
            entry += f"  url     = {{{url}}},\n"
        entry += "}\n"
        entries.append(entry)

    return "\n".join(entries) if entries else "% No citations recorded\n"


# ---------------------------------------------------------------------------
# Main formatter node
# ---------------------------------------------------------------------------

async def formatter_node(state: ResearchState) -> ResearchState:
    text = state.get("polished_draft") or state.get("draft") or ""
    summaries: List[Dict[str, Any]] = state.get("paper_summaries") or []

    # Extract title (first # heading or fallback)
    title_match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else f"Systematic Review: {state.get('topic', '')}"

    # 1. Number citations [1], [2]...
    formatted_text, citation_map = _number_citations(text)
    state["polished_draft"] = formatted_text

    # 2. Generate DOCX
    try:
        docx_bytes = _build_docx(title, formatted_text)
        state["docx_bytes"] = docx_bytes
        logger.info(f"DOCX generated: {len(docx_bytes):,} bytes")
    except Exception as e:
        logger.warning(f"DOCX export failed: {e}")
        state["docx_bytes"] = None

    # 3. Generate LaTeX
    try:
        latex_str = _build_latex(title, formatted_text, citation_map, summaries)
        state["latex_str"] = latex_str
        logger.info(f"LaTeX generated: {len(latex_str):,} chars")
    except Exception as e:
        logger.warning(f"LaTeX export failed: {e}")
        state["latex_str"] = None

    # 4. BibTeX
    try:
        bibtex = _build_bibtex(summaries, citation_map)
        state["bibtex"] = bibtex
        logger.info(f"BibTeX generated: {len(bibtex):,} chars")
    except Exception as e:
        logger.warning(f"BibTeX export failed: {e}")

    state["current_step"] = "formatting_complete"
    state["progress"] = 100
    return state
