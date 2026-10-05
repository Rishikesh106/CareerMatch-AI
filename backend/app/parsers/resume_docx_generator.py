import os
import re
from typing import Dict, Any, List
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

class ResumeDocxGenerator:
    """
    Generates a Microsoft Word (.docx) resume adhering strictly to standard professional ATS formatting.
    Preserves uniform typography (Calibri), standard font sizes (18pt Name, 12pt Headers, 10.5pt Content),
    standard 0.75" margins, and exact section layout.
    """

    FONT_NAME = "Calibri"
    COLOR_PRIMARY = RGBColor(15, 23, 42)      # Deep slate / Charcoal (#0f172a)
    COLOR_MUTED = RGBColor(100, 116, 139)     # Slate muted (#64748b)
    COLOR_ACCENT = RGBColor(37, 99, 235)      # Royal Blue (#2563eb)

    @classmethod
    def _add_bottom_border(cls, paragraph):
        """Adds a subtle bottom border underline beneath a section heading."""
        pPr = paragraph._p.get_or_add_pPr()
        pBdr = OxmlElement('w:pBdr')
        bottom = OxmlElement('w:bottom')
        bottom.set(qn('w:val'), 'single')
        bottom.set(qn('w:sz'), '6')  # 3/4 pt
        bottom.set(qn('w:space'), '2')
        bottom.set(qn('w:color'), 'CBD5E1')  # Slate-300
        pBdr.append(bottom)
        pPr.append(pBdr)

    @classmethod
    def generate(cls, corrected_text: str, output_path: str, candidate_name: str = "Candidate") -> str:
        """
        Parses corrected text and renders it into a clean, professional .docx document.
        """
        doc = Document()

        # Set 0.75 inch margins
        for section in doc.sections:
            section.top_margin = Inches(0.75)
            section.bottom_margin = Inches(0.75)
            section.left_margin = Inches(0.75)
            section.right_margin = Inches(0.75)

        lines = [l.strip() for l in corrected_text.split('\n')]
        
        # Process lines
        i = 0
        total_lines = len(lines)

        # 1. First line: Candidate Name
        if i < total_lines and lines[i]:
            name_p = doc.add_paragraph()
            name_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            name_run = name_p.add_run(lines[i])
            name_run.font.name = cls.FONT_NAME
            name_run.font.size = Pt(18)
            name_run.font.bold = True
            name_run.font.color.rgb = cls.COLOR_PRIMARY
            name_p.paragraph_format.space_after = Pt(2)
            name_p.paragraph_format.space_before = Pt(0)
            i += 1

        # 2. Header subtitle / Tagline (e.g. Aspiring Cybersecurity Analyst)
        if i < total_lines and lines[i] and not lines[i].isupper() and "@" not in lines[i]:
            tag_p = doc.add_paragraph()
            tag_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            tag_run = tag_p.add_run(lines[i])
            tag_run.font.name = cls.FONT_NAME
            tag_run.font.size = Pt(11)
            tag_run.font.bold = True
            tag_run.font.color.rgb = cls.COLOR_ACCENT
            tag_p.paragraph_format.space_after = Pt(2)
            tag_p.paragraph_format.space_before = Pt(0)
            i += 1

        # 3. Contact information line (Email, Phone, Location, Links)
        contact_lines = []
        while i < total_lines and lines[i] and not lines[i].isupper():
            contact_lines.append(lines[i])
            i += 1

        if contact_lines:
            contact_str = " | ".join(contact_lines)
            c_p = doc.add_paragraph()
            c_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            c_run = c_p.add_run(contact_str)
            c_run.font.name = cls.FONT_NAME
            c_run.font.size = Pt(9.5)
            c_run.font.color.rgb = cls.COLOR_MUTED
            c_p.paragraph_format.space_after = Pt(10)
            c_p.paragraph_format.space_before = Pt(0)

        # 4. Remaining Sections
        known_sections = {
            "SUMMARY", "TECHNICAL SKILLS", "SKILLS", "PROFESSIONAL EXPERIENCE",
            "EXPERIENCE", "WORK EXPERIENCE", "EDUCATION", "PROJECTS",
            "CERTIFICATIONS", "ACHIEVEMENTS", "WORKSHOPS & TRAINING",
            "PUBLICATIONS", "LEADERSHIP", "AWARDS"
        }

        while i < total_lines:
            line = lines[i]
            if not line:
                i += 1
                continue

            # Check if this line is a Section Heading
            is_section_header = (
                line.isupper() and len(line) < 40 and not line.startswith(('HTTP', 'WWW', 'HTTPS'))
            ) or line in known_sections

            if is_section_header:
                h_p = doc.add_paragraph()
                cls._add_bottom_border(h_p)
                h_run = h_p.add_run(line)
                h_run.font.name = cls.FONT_NAME
                h_run.font.size = Pt(12)
                h_run.font.bold = True
                h_run.font.color.rgb = cls.COLOR_PRIMARY
                h_p.paragraph_format.space_before = Pt(10)
                h_p.paragraph_format.space_after = Pt(4)
                i += 1
                continue

            # Check if line is a Bullet Point
            if line.startswith(('●', '-', '*', '•')):
                clean_bullet = line.lstrip('●-*• ').strip()
                b_p = doc.add_paragraph(style='List Bullet')
                b_run = b_p.add_run(clean_bullet)
                b_run.font.name = cls.FONT_NAME
                b_run.font.size = Pt(10.5)
                b_run.font.color.rgb = cls.COLOR_PRIMARY
                b_p.paragraph_format.space_before = Pt(1)
                b_p.paragraph_format.space_after = Pt(2)
                b_p.paragraph_format.line_spacing = 1.15
                i += 1
                continue

            # Check if line looks like a subheader / job title / project name (e.g. contains — or | or boldable)
            is_subheader = (
                " — " in line or " | " in line or
                any(line.lower().startswith(prefix) for prefix in ['tech stack:', 'technologies:'])
            )

            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15

            if is_subheader and not line.lower().startswith('tech stack:'):
                run = p.add_run(line)
                run.font.name = cls.FONT_NAME
                run.font.size = Pt(11)
                run.font.bold = True
                run.font.color.rgb = cls.COLOR_PRIMARY
            elif line.lower().startswith(('tech stack:', 'technologies:')):
                prefix = line.split(':', 1)[0] + ":"
                rest = line.split(':', 1)[1] if ':' in line else ""
                r1 = p.add_run(prefix)
                r1.font.name = cls.FONT_NAME
                r1.font.size = Pt(10)
                r1.font.bold = True
                r1.font.color.rgb = cls.COLOR_ACCENT

                r2 = p.add_run(rest)
                r2.font.name = cls.FONT_NAME
                r2.font.size = Pt(10)
                r2.font.color.rgb = cls.COLOR_MUTED
            else:
                run = p.add_run(line)
                run.font.name = cls.FONT_NAME
                run.font.size = Pt(10.5)
                run.font.color.rgb = cls.COLOR_PRIMARY

            i += 1

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        return output_path
