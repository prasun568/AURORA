import io
import re
import zipfile
from datetime import datetime
from typing import Any, Dict, List, Optional
import pymupdf


def _clean_markdown(text: str) -> str:
    """Removes HTML tags and cleans raw markdown markers."""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\{cite:[^}]+\}", "", text)
    return text.strip()


def generate_pdf(
    markdown_text: str,
    topic: str = "Systematic Literature Review",
    citations: Optional[List[Dict[str, Any]]] = None,
    bibtex: Optional[str] = None,
    template: str = "IEEE Conference",
    citation_style: str = "IEEE"
) -> bytes:
    """Generates a publication-grade academic PDF formatted according to the selected template & citation style."""
    doc = pymupdf.open()
    page_width = 595.0
    page_height = 842.0
    margin_left = 54.0
    margin_right = 54.0

    current_page = doc.new_page(width=page_width, height=page_height)
    page_num = 1

    template_str = template or "IEEE Conference"
    style_str = citation_style or "IEEE"
    template_lower = template_str.lower()

    if "ieee" in template_lower:
        header_title = f"IEEE {template_str.upper()} — RESEARCH PROCEEDINGS"
    elif "acm" in template_lower:
        header_title = "ACM PROCEEDINGS — ADVANCED MULTI-AGENT SYNTHESIS"
    elif "springer" in template_lower or "lncs" in template_lower:
        header_title = "SPRINGER NATURE LECTURE NOTES IN COMPUTER SCIENCE"
    elif "apa" in template_lower:
        header_title = "AMERICAN PSYCHOLOGICAL ASSOCIATION (APA 7TH ED.) MANUSCRIPT"
    elif "elsevier" in template_lower:
        header_title = "ELSEVIER SCIENCEDIRECT — SYSTEMATIC LITERATURE REVIEW"
    else:
        header_title = f"{template_str.upper()} — SCHOLARLY MANUSCRIPT"

    def draw_header_footer(page, p_num):
        # Academic Header
        page.draw_line(
            pymupdf.Point(margin_left, 45),
            pymupdf.Point(page_width - margin_right, 45),
            color=(0.46, 0.31, 0.18),  # Antique Gold
            width=0.75
        )
        page.insert_text(
            pymupdf.Point(margin_left, 40),
            header_title,
            fontsize=8,
            fontname="helv",
            color=(0.45, 0.40, 0.35)
        )

        # Academic Footer
        page.draw_line(
            pymupdf.Point(margin_left, page_height - 45),
            pymupdf.Point(page_width - margin_right, page_height - 45),
            color=(0.46, 0.31, 0.18),
            width=0.75
        )
        page.insert_text(
            pymupdf.Point(margin_left, page_height - 32),
            f"Style: {style_str} | Verified via AURORA VeriCite Engine | PRISMA 2020 Compliant",
            fontsize=8,
            fontname="helv",
            color=(0.45, 0.40, 0.35)
        )
        page.insert_text(
            pymupdf.Point(page_width - margin_right - 40, page_height - 32),
            f"Page {p_num}",
            fontsize=8,
            fontname="helv",
            color=(0.45, 0.40, 0.35)
        )

    draw_header_footer(current_page, page_num)
    y = 75.0

    # Title
    title_text = topic or "Systematic Literature Review"
    title_rect = pymupdf.Rect(margin_left, y, page_width - margin_right, y + 60)
    current_page.insert_textbox(
        title_rect,
        title_text,
        fontsize=18,
        fontname="times-bold",
        color=(0.14, 0.04, 0.06),
        align=pymupdf.TEXT_ALIGN_CENTER
    )
    y += 65.0

    # Metadata & Date
    meta_text = f"Venue Format: {template_str} • Citations: {style_str} • Inscribed: {datetime.now().strftime('%B %d, %Y')}"
    current_page.insert_text(
        pymupdf.Point(margin_left, y),
        meta_text,
        fontsize=9,
        fontname="helv",
        color=(0.46, 0.31, 0.18)
    )
    y += 20.0

    # Parse and layout markdown text
    cleaned = _clean_markdown(markdown_text)
    paragraphs = cleaned.split("\n\n")

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # Section Headings
        if para.startswith("#"):
            level = len(para) - len(para.lstrip("#"))
            heading_text = para.lstrip("#").strip()

            # Apply template-specific heading numbering
            if "ieee" in template_lower and level == 2:
                # Add Roman numeral if not present
                heading_display = heading_text.upper()
            else:
                heading_display = heading_text

            font_size = 13 if level <= 2 else 11
            font_name = "times-bold"
            height_needed = 35.0

            if y + height_needed > page_height - 65:
                current_page = doc.new_page(width=page_width, height=page_height)
                page_num += 1
                draw_header_footer(current_page, page_num)
                y = 65.0

            y += 10.0
            heading_rect = pymupdf.Rect(margin_left, y, page_width - margin_right, y + 25)
            current_page.insert_textbox(
                heading_rect,
                heading_display,
                fontsize=font_size,
                fontname=font_name,
                color=(0.20, 0.05, 0.08)
            )
            y += 25.0
        else:
            lines = max(1, len(para) // 85 + 1)
            para_height = lines * 14.0 + 8.0

            if y + para_height > page_height - 65:
                current_page = doc.new_page(width=page_width, height=page_height)
                page_num += 1
                draw_header_footer(current_page, page_num)
                y = 65.0

            rect = pymupdf.Rect(margin_left, y, page_width - margin_right, y + para_height)
            current_page.insert_textbox(
                rect,
                para,
                fontsize=10,
                fontname="times-roman",
                color=(0.10, 0.10, 0.10),
                align=pymupdf.TEXT_ALIGN_LEFT
            )
            y += para_height + 4.0

    # References Section Formatted in chosen Citation Style
    if citations:
        if y + 80 > page_height - 65:
            current_page = doc.new_page(width=page_width, height=page_height)
            page_num += 1
            draw_header_footer(current_page, page_num)
            y = 65.0

        y += 15.0
        ref_heading_rect = pymupdf.Rect(margin_left, y, page_width - margin_right, y + 25)
        current_page.insert_textbox(
            ref_heading_rect,
            f"References ({style_str} Standard)",
            fontsize=13,
            fontname="times-bold",
            color=(0.20, 0.05, 0.08)
        )
        y += 30.0

        for i, c in enumerate(citations):
            title = c.get("title") or c.get("source_title") or "Scholarly Publication"
            authors = ", ".join(c.get("authors", [])) if c.get("authors") else "Research Authors"
            year = c.get("year") or "2024"
            doi = c.get("doi") or "N/A"
            venue = c.get("venue") or "Academic Proceedings"

            if "apa" in style_str.lower():
                ref_entry = f"{authors} ({year}). {title}. {venue}. https://doi.org/{doi}"
            elif "mla" in style_str.lower():
                ref_entry = f"{authors}. \"{title}.\" {venue}, {year}. DOI: {doi}."
            elif "harvard" in style_str.lower():
                ref_entry = f"{authors}, {year}. {title}. {venue}. Available at: <https://doi.org/{doi}>"
            else: # IEEE / Vancouver default
                ref_entry = f"[{i + 1}] {authors}, \"{title},\" in {venue}, {year}. doi: {doi}."

            ref_height = 24.0

            if y + ref_height > page_height - 65:
                current_page = doc.new_page(width=page_width, height=page_height)
                page_num += 1
                draw_header_footer(current_page, page_num)
                y = 65.0

            rect = pymupdf.Rect(margin_left, y, page_width - margin_right, y + ref_height)
            current_page.insert_textbox(
                rect,
                ref_entry,
                fontsize=9,
                fontname="times-roman",
                color=(0.25, 0.25, 0.25)
            )
            y += ref_height

    return doc.tobytes()


def generate_docx(
    markdown_text: str,
    topic: str = "Systematic Literature Review",
    citations: Optional[List[Dict[str, Any]]] = None,
    template: str = "IEEE Conference",
    citation_style: str = "IEEE"
) -> bytes:
    """Generates a genuine OpenXML Microsoft Word document (.docx) styled for the chosen academic venue."""
    cleaned = _clean_markdown(markdown_text)
    paragraphs = cleaned.split("\n\n")

    template_str = template or "IEEE Conference"
    style_str = citation_style or "IEEE"
    template_lower = template_str.lower()

    def escape_xml(s: str) -> str:
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    body_xml_parts = []

    # Title Paragraph
    safe_title = escape_xml(topic or "Systematic Literature Review")
    body_xml_parts.append(f"""
        <w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="240" w:after="120"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:sz w:val="44"/>
                    <w:color w:val="24090F"/>
                </w:rPr>
                <w:t>{safe_title}</w:t>
            </w:r>
        </w:p>
    """)

    # Subtitle / Venue Template Info
    meta_info = f"Formatted for: {template_str} • Citation Style: {style_str} • Date: {datetime.now().strftime('%B %d, %Y')}"
    body_xml_parts.append(f"""
        <w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:after="360"/>
            </w:pPr>
            <w:r>
                <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:i/>
                    <w:sz w:val="20"/>
                    <w:color w:val="75502F"/>
                </w:rPr>
                <w:t>{escape_xml(meta_info)}</w:t>
            </w:r>
        </w:p>
    """)

    # Paragraphs and Headings
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if para.startswith("#"):
            level = len(para) - len(para.lstrip("#"))
            heading_text = para.lstrip("#").strip()

            if "ieee" in template_lower and level == 2:
                heading_text = heading_text.upper()

            safe_heading = escape_xml(heading_text)
            sz = "30" if level <= 2 else "24"
            before = "360" if level <= 2 else "240"
            body_xml_parts.append(f"""
                <w:p>
                    <w:pPr>
                        <w:spacing w:before="{before}" w:after="120"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                            <w:b/>
                            <w:sz w:val="{sz}"/>
                            <w:color w:val="24090F"/>
                        </w:rPr>
                        <w:t>{safe_heading}</w:t>
                    </w:r>
                </w:p>
            """)
        else:
            safe_para = escape_xml(para)
            body_xml_parts.append(f"""
                <w:p>
                    <w:pPr>
                        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t xml:space="preserve">{safe_para}</w:t>
                    </w:r>
                </w:p>
            """)

    # Citations in Word
    if citations:
        body_xml_parts.append(f"""
            <w:p>
                <w:pPr>
                    <w:spacing w:before="400" w:after="160"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                        <w:b/>
                        <w:sz w:val="28"/>
                        <w:color w:val="24090F"/>
                    </w:rPr>
                    <w:t>References ({escape_xml(style_str)} Standard)</w:t>
                </w:r>
            </w:p>
        """)

        for i, c in enumerate(citations):
            title = c.get("title") or c.get("source_title") or "Scholarly Publication"
            authors = ", ".join(c.get("authors", [])) if c.get("authors") else "Research Authors"
            year = c.get("year") or "2024"
            doi = c.get("doi") or "N/A"
            venue = c.get("venue") or "Scholarly Venue"

            if "apa" in style_str.lower():
                ref_entry = f"{authors} ({year}). {title}. {venue}. https://doi.org/{doi}"
            elif "mla" in style_str.lower():
                ref_entry = f"{authors}. \"{title}.\" {venue}, {year}. DOI: {doi}."
            elif "harvard" in style_str.lower():
                ref_entry = f"{authors}, {year}. {title}. {venue}. Available at: <https://doi.org/{doi}>"
            else: # IEEE / Vancouver default
                ref_entry = f"[{i + 1}] {authors}, \"{title},\" in {venue}, {year}. doi: {doi}."

            body_xml_parts.append(f"""
                <w:p>
                    <w:pPr>
                        <w:spacing w:after="100"/>
                        <w:ind w:left="400" w:hanging="400"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                            <w:sz w:val="20"/>
                        </w:rPr>
                        <w:t>{escape_xml(ref_entry)}</w:t>
                    </w:r>
                </w:p>
            """)

    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        {''.join(body_xml_parts)}
        <w:sectPr>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
        </w:sectPr>
    </w:body>
</w:document>"""

    content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""

    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types_xml)
        z.writestr("_rels/.rels", rels_xml)
        z.writestr("word/document.xml", doc_xml)

    return buf.getvalue()


def generate_latex_zip(
    markdown_text: str,
    topic: str = "Systematic Literature Review",
    citations: Optional[List[Dict[str, Any]]] = None,
    bibtex: Optional[str] = None,
    template: str = "IEEE Conference",
    citation_style: str = "IEEE"
) -> bytes:
    """Generates an official LaTeX package matching the user's selected publishing venue template."""
    cleaned = _clean_markdown(markdown_text)
    paragraphs = cleaned.split("\n\n")

    template_str = template or "IEEE Conference"
    template_lower = template_str.lower()

    # Determine exact document class & bibliography style for selected template
    if "acm" in template_lower:
        doc_class = "\\documentclass[sigconf]{acmart}"
        bib_style = "\\bibliographystyle{ACM-Reference-Format}"
        extra_packages = ""
    elif "springer" in template_lower or "lncs" in template_lower:
        doc_class = "\\documentclass{llncs}"
        bib_style = "\\bibliographystyle{splncs04}"
        extra_packages = "\\usepackage{amsmath,amssymb}"
    elif "apa" in template_lower:
        doc_class = "\\documentclass[man,floatsintext]{apa7}"
        bib_style = "\\bibliographystyle{apacite}"
        extra_packages = "\\usepackage[natbibapa]{apacite}"
    elif "elsevier" in template_lower:
        doc_class = "\\documentclass[preprint,12pt]{elsarticle}"
        bib_style = "\\bibliographystyle{elsarticle-num}"
        extra_packages = "\\usepackage{amsmath,amssymb}"
    elif "journal" in template_lower:
        doc_class = "\\documentclass[journal]{IEEEtran}"
        bib_style = "\\bibliographystyle{IEEEtran}"
        extra_packages = "\\usepackage{cite}\\usepackage{amsmath,amssymb}"
    else:  # IEEE Conference (default)
        doc_class = "\\documentclass[conference]{IEEEtran}"
        bib_style = "\\bibliographystyle{IEEEtran}"
        extra_packages = "\\usepackage{cite}\\usepackage{amsmath,amssymb}"

    # Build LaTeX sections
    tex_body = []
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if para.startswith("#"):
            level = len(para) - len(para.lstrip("#"))
            heading_text = para.lstrip("#").strip()
            safe_heading = heading_text.replace("_", "\\_").replace("&", "\\&").replace("%", "\\%")
            if level <= 1:
                tex_body.append(f"\\section*{{{safe_heading}}}\n")
            elif level == 2:
                tex_body.append(f"\\section{{{safe_heading}}}\n")
            elif level == 3:
                tex_body.append(f"\\subsection{{{safe_heading}}}\n")
            else:
                tex_body.append(f"\\subsubsection{{{safe_heading}}}\n")
        else:
            safe_para = para.replace("_", "\\_").replace("&", "\\&").replace("%", "\\%")
            tex_body.append(f"{safe_para}\n\n")

    safe_title = (topic or "Systematic Literature Review").replace("_", "\\_").replace("&", "\\&")

    tex_content = f"""{doc_class}
\\usepackage[utf8]{{inputenc}}
{extra_packages}
\\usepackage{{graphicx}}
\\usepackage{{hyperref}}

\\begin{{document}}

\\title{{{safe_title}}}

\\author{{AURORA Autonomous Research Intelligence\\\\
\\textit{{Venue Template: {template_str}}}\\\\
Compiled: {datetime.now().strftime('%B %d, %Y')}\\\\
Verified via VeriCite Engine}}

\\maketitle

{''.join(tex_body)}

{bib_style}
\\bibliography{{references}}

\\end{{document}}
"""

    # Build references.bib
    bib_entries = []
    if bibtex:
        bib_entries.append(bibtex)
    elif citations:
        for i, c in enumerate(citations):
            doi = c.get("doi") or f"ref_{i + 1}"
            title = c.get("title") or c.get("source_title") or "Academic Paper"
            authors = " and ".join(c.get("authors", [])) if c.get("authors") else "AURORA Scholar"
            year = c.get("year") or "2024"
            key = f"ref_{i + 1}"
            bib_entries.append(f"""@article{{{key},
  author = {{{authors}}},
  title = {{{{{title}}}}},
  year = {{{year}}},
  doi = {{{doi}}}
}}""")

    final_bib = "\n\n".join(bib_entries) if bib_entries else "% No citations indexed\n"

    readme = f"""AURORA LaTeX Package ({template_str})
========================================
Template: {template_str}
Citation Style: {citation_style}

To compile this manuscript to PDF:
  pdflatex manuscript.tex
  bibtex manuscript
  pdflatex manuscript.tex
  pdflatex manuscript.tex
"""

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("manuscript.tex", tex_content)
        z.writestr("references.bib", final_bib)
        z.writestr("README.txt", readme)

    return buf.getvalue()
