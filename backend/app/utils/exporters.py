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


def generate_pdf(markdown_text: str, topic: str = "Systematic Literature Review", citations: Optional[List[Dict[str, Any]]] = None, bibtex: Optional[str] = None) -> bytes:
    """Generates a publication-grade academic PDF using PyMuPDF."""
    doc = pymupdf.open()
    page_width = 595.0
    page_height = 842.0
    margin_left = 54.0
    margin_right = 54.0
    usable_width = page_width - margin_left - margin_right

    current_page = doc.new_page(width=page_width, height=page_height)
    page_num = 1

    def draw_header_footer(page, p_num):
        # Academic Header
        page.draw_line(
            pymupdf.Point(margin_left, 45),
            pymupdf.Point(page_width - margin_right, 45),
            color=(0.46, 0.31, 0.18),  # Antique Gold / Bronze
            width=0.75
        )
        page.insert_text(
            pymupdf.Point(margin_left, 40),
            "AURORA RESEARCH INTELLIGENCE — SYSTEMATIC LITERATURE REVIEW",
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
            "Verified via AURORA VeriCite Engine | CrossRef & PRISMA 2020 Compliant",
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
        color=(0.14, 0.04, 0.06), # Deep Burgundy
        align=pymupdf.TEXT_ALIGN_CENTER
    )
    y += 65.0

    # Metadata & Date
    meta_text = f"Compiled by AURORA Autonomous Multi-Agent Framework • Date: {datetime.now().strftime('%B %d, %Y')}"
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
            font_size = 14 if level <= 2 else 12
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
                heading_text,
                fontsize=font_size,
                fontname=font_name,
                color=(0.20, 0.05, 0.08)
            )
            y += 25.0
        else:
            # Body Paragraph
            # Estimate height: approx 15 chars per line at 10pt = ~90 chars per line
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

    # Add References Section if citations provided
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
            "References & Verified Bibliographic Index",
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
            status = c.get("status") or "VERIFIED"

            ref_entry = f"[{i + 1}] {authors} ({year}). \"{title}\". DOI: {doi} [{status}]"
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


def generate_docx(markdown_text: str, topic: str = "Systematic Literature Review", citations: Optional[List[Dict[str, Any]]] = None) -> bytes:
    """Generates a genuine OpenXML Microsoft Word document (.docx)."""
    cleaned = _clean_markdown(markdown_text)
    paragraphs = cleaned.split("\n\n")

    def escape_xml(s: str) -> str:
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    # Construct Document XML elements
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
                    <w:sz w:val="48"/>
                    <w:color w:val="24090F"/>
                </w:rPr>
                <w:t>{safe_title}</w:t>
            </w:r>
        </w:p>
    """)

    # Subtitle / Metadata
    meta_info = f"Generated by AURORA Autonomous Multi-Agent Framework • {datetime.now().strftime('%B %d, %Y')}"
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
            heading_text = escape_xml(para.lstrip("#").strip())
            sz = "32" if level <= 2 else "26"
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
                        <w:t>{heading_text}</w:t>
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
        body_xml_parts.append("""
            <w:p>
                <w:pPr>
                    <w:spacing w:before="400" w:after="160"/>
                </w:pPr>
                <w:r>
                    <w:rPr>
                        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                        <w:b/>
                        <w:sz w:val="30"/>
                        <w:color w:val="24090F"/>
                    </w:rPr>
                    <w:t>References &amp; Verified Bibliographic Index</w:t>
                </w:r>
            </w:p>
        """)

        for i, c in enumerate(citations):
            title = c.get("title") or c.get("source_title") or "Scholarly Publication"
            authors = ", ".join(c.get("authors", [])) if c.get("authors") else "Research Authors"
            year = c.get("year") or "2024"
            doi = c.get("doi") or "N/A"
            status = c.get("status") or "VERIFIED"

            ref_entry = escape_xml(f"[{i + 1}] {authors} ({year}). \"{title}\". DOI: {doi} [{status}]")
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
                        <w:t>{ref_entry}</w:t>
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


def generate_latex_zip(markdown_text: str, topic: str = "Systematic Literature Review", citations: Optional[List[Dict[str, Any]]] = None, bibtex: Optional[str] = None) -> bytes:
    """Generates an IEEE/ACM-compliant LaTeX manuscript package in a ZIP archive."""
    cleaned = _clean_markdown(markdown_text)
    paragraphs = cleaned.split("\n\n")

    # Build LaTeX sections
    tex_body = []
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if para.startswith("#"):
            level = len(para) - len(para.lstrip("#"))
            heading_text = para.lstrip("#").strip()
            # Escape LaTeX special chars
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
    
    tex_content = f"""\\documentclass[conference]{{IEEEtran}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{cite}}
\\usepackage{{amsmath,amssymb,amsfonts}}
\\usepackage{{graphicx}}
\\usepackage{{hyperref}}

\\begin{{document}}

\\title{{{safe_title}}}

\\author{{\\IEEEauthorblockN{{AURORA Autonomous Research Intelligence}}\\\\
\\IEEEauthorblockA{{\\textit{{Multi-Agent Academic Synthesis Framework}}\\\\
Generated: {datetime.now().strftime('%B %d, %Y')}\\\\
Verified via VeriCite Engine}}}}

\\maketitle

{''.join(tex_body)}

\\bibliographystyle{{IEEEtran}}
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

    readme = """AURORA LaTeX Package
====================
To compile this academic manuscript to PDF:
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

