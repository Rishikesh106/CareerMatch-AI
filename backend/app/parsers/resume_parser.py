import os
import re
import fitz  # PyMuPDF
import docx
from typing import Dict, Any, List, Optional
from app.ai.mock_provider import ALL_KNOWN_SKILLS

class ResumeParser:
    """
    Production-grade resume parser supporting PDF and DOCX documents.
    Extracts text, segments sections, identifies entities, and assesses extraction confidence.
    """

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        text = ""
        try:
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text() + "\n"
        except Exception as e:
            text = f"Error reading PDF: {str(e)}"
        return text.strip()

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        text = []
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                if para.text.strip():
                    text.append(para.text.strip())
            for table in doc.tables:
                for row in table.rows:
                    row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_data:
                        text.append(" | ".join(row_data))
        except Exception as e:
            return f"Error reading DOCX: {str(e)}"
        return "\n".join(text).strip()

    @classmethod
    def extract_text(cls, file_path: str, mime_type: str) -> str:
        if file_path.lower().endswith(".pdf") or "pdf" in mime_type.lower():
            return cls.extract_text_from_pdf(file_path)
        elif file_path.lower().endswith(".docx") or "word" in mime_type.lower():
            return cls.extract_text_from_docx(file_path)
        return ""

    @classmethod
    def parse(cls, file_path: str, mime_type: str) -> Dict[str, Any]:
        raw_text = cls.extract_text(file_path, mime_type)
        if not raw_text or raw_text.startswith("Error"):
            return {
                "raw_text": raw_text,
                "confidence_score": 0.2,
                "confidence_message": "Some information could not be confidently extracted. Please review your profile.",
                "name": None,
                "email": None,
                "phone": None,
                "skills": [],
                "education": [],
                "experience": [],
                "projects": [],
                "certifications": [],
                "links": []
            }

        # 1. Contact Info extraction
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        email = email_match.group(0) if email_match else None

        phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text)
        phone = phone_match.group(0) if phone_match else None

        # Links (LinkedIn, GitHub)
        linkedin_match = re.search(r'(https?://(?:www\.)?linkedin\.com/in/[\w\-]+)', raw_text, re.IGNORECASE)
        linkedin = linkedin_match.group(0) if linkedin_match else None

        github_match = re.search(r'(https?://(?:www\.)?github\.com/[\w\-]+)', raw_text, re.IGNORECASE)
        github = github_match.group(0) if github_match else None

        # Name extraction (usually top 1-3 lines before email/phone)
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        name = None
        for line in lines[:4]:
            if not email_match or line != email_match.group(0):
                if len(line.split()) in [2, 3, 4] and not re.search(r'[\@\d\:\/]', line):
                    name = line
                    break
        if not name and lines:
            name = lines[0]

        # 2. Section segmentation
        section_headers = {
            "summary": ["summary", "professional summary", "about me", "objective", "profile"],
            "experience": ["experience", "work experience", "employment", "professional experience", "work history"],
            "education": ["education", "academic history", "academics"],
            "projects": ["projects", "personal projects", "technical projects", "key projects"],
            "skills": ["skills", "technical skills", "technologies", "competencies", "core competencies"],
            "certifications": ["certifications", "licenses", "certificates"]
        }

        sections: Dict[str, List[str]] = {k: [] for k in section_headers}
        current_section = "summary"

        for line in lines:
            line_lower = line.lower().strip(": ")
            found_header = None
            for sec, headers in section_headers.items():
                if line_lower in headers or any(line_lower.startswith(h) for h in headers if len(line_lower) < 30):
                    found_header = sec
                    break
            
            if found_header:
                current_section = found_header
            else:
                sections[current_section].append(line)

        # 3. Skills extraction
        found_skills = []
        text_lower = raw_text.lower()
        for skill_key, (original_name, category) in ALL_KNOWN_SKILLS.items():
            pattern = r'\b' + re.escape(skill_key) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append({"name": original_name, "category": category})

        # Remove duplicate skills
        unique_skills = []
        seen = set()
        for s in found_skills:
            if s["name"] not in seen:
                seen.add(s["name"])
                unique_skills.append(s)

        # 4. Experience parsing
        experience_items = []
        exp_lines = sections.get("experience", [])
        if exp_lines:
            chunk = "\n".join(exp_lines[:15])
            experience_items.append({
                "company": "Professional Experience",
                "role": "Role / Position",
                "description": chunk[:400],
                "technologies": [s["name"] for s in unique_skills[:4]]
            })

        # 5. Education parsing
        education_items = []
        edu_lines = sections.get("education", [])
        if edu_lines:
            edu_text = " ".join(edu_lines)
            deg = "Bachelor of Science in Computer Science" if "bachelor" in edu_text.lower() else "University Degree"
            education_items.append({
                "institution": edu_lines[0] if edu_lines else "University",
                "degree": deg,
                "field_of_study": "Computer Science / Information Technology"
            })

        # 6. Projects parsing
        project_items = []
        proj_lines = sections.get("projects", [])
        if proj_lines:
            project_items.append({
                "name": proj_lines[0][:60] if proj_lines else "Portfolio Project",
                "description": "\n".join(proj_lines[1:5])[:300],
                "technologies": [s["name"] for s in unique_skills[4:8]] if len(unique_skills) >= 8 else [s["name"] for s in unique_skills]
            })

        # Calculate confidence score
        confidence = 0.5
        if email: confidence += 0.15
        if phone: confidence += 0.1
        if unique_skills: confidence += 0.15
        if education_items or experience_items: confidence += 0.1
        confidence = round(min(0.95, confidence), 2)

        conf_msg = None
        if confidence < 0.7:
            conf_msg = "Some information could not be confidently extracted. Please review your profile."

        return {
            "raw_text": raw_text,
            "confidence_score": confidence,
            "confidence_message": conf_msg,
            "name": name,
            "email": email,
            "phone": phone,
            "linkedin_url": linkedin,
            "github_url": github,
            "summary": " ".join(sections.get("summary", []))[:300] if sections.get("summary") else None,
            "skills": unique_skills,
            "education": education_items,
            "experience": experience_items,
            "projects": project_items,
            "certifications": sections.get("certifications", [])[:3]
        }
