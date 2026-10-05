import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.entities import Job, Resume

class JobMatcher:
    """
    Intelligent Resume-to-Job Matching and Recommendation Engine.
    Analyzes resume text, extracts core domain (Cybersecurity, Software Engineering, etc.)
    and experience tier (Fresher, Mid-Level, Senior), then dynamically ranks and matches
    relevant job openings with direct application URLs.
    """

    CYBER_KEYWORDS = {
        'cybersecurity', 'vapt', 'soc', 'siem', 'wireshark', 'burp suite',
        'nmap', 'metasploit', 'owasp', 'penetration testing', 'incident response',
        'snort', 'nessus', 'ceh', 'threat intelligence', 'splunk', 'hydra',
        'virustotal', 'packet analysis', 'cryptography', 'xss', 'sql injection'
    }

    SWE_KEYWORDS = {
        'full stack', 'frontend', 'backend', 'react', 'typescript', 'javascript',
        'fastapi', 'node', 'express', 'django', 'flask', 'html', 'css', 'vue',
        'angular', 'rest api', 'graphql', 'microservices', 'software engineer'
    }

    CLOUD_KEYWORDS = {
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
        'jenkins', 'devops', 'linux', 'ansible', 'prometheus', 'grafana'
    }

    DATA_KEYWORDS = {
        'data analyst', 'data scientist', 'machine learning', 'deep learning',
        'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'tableau', 'nlp', 'llm'
    }

    @classmethod
    def detect_domain(cls, text: str) -> str:
        """Determines the candidate's primary domain from resume content."""
        lower = text.lower()
        scores = {
            "Cybersecurity": sum(1 for kw in cls.CYBER_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower)),
            "Software Engineering": sum(1 for kw in cls.SWE_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower)),
            "Cloud & DevOps": sum(1 for kw in cls.CLOUD_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower)),
            "Data & AI": sum(1 for kw in cls.DATA_KEYWORDS if re.search(r'\b' + re.escape(kw) + r'\b', lower)),
        }
        best_domain = max(scores, key=scores.get)
        return best_domain if scores[best_domain] > 0 else "Software Engineering"

    @classmethod
    def detect_experience_tier(cls, text: str, parsed_sections: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determines whether the candidate is a Fresher / College Student,
        Mid-level, or Senior based on graduation dates and work history.
        """
        lower = text.lower()
        is_fresher = False
        reason = "Standard Experience"

        # Check graduation dates (e.g. 2024, 2025, 2026, 2027)
        grad_years = re.findall(r'\b(202[4-9]|2030)\b', lower)
        has_current_study = any(w in lower for w in ['cgpa', 'student', 'pursuing', 'b.e.', 'b.tech', 'undergraduate'])

        exp_items = parsed_sections.get("experience", [])
        has_only_internships = False
        if exp_items:
            internship_count = sum(1 for e in exp_items if 'intern' in str(e).lower())
            if internship_count == len(exp_items):
                has_only_internships = True

        if grad_years or 'internship' in lower or has_only_internships or (has_current_study and len(exp_items) <= 2):
            is_fresher = True
            reason = "Student / Recent Graduate (Internship Experience)"
            tier = "Fresher / Entry-Level"
        elif any(w in lower for w in ['senior', 'lead', 'staff', 'principal', '5+ years', '6+ years']):
            tier = "Senior"
            reason = "5+ Years of Industry Experience"
        else:
            tier = "Mid-level"
            reason = "2-4 Years of Practical Experience"

        return {
            "tier": tier,
            "is_fresher": is_fresher,
            "reason": reason
        }

    @classmethod
    def match_jobs_for_resume(cls, db: Session, resume: Resume) -> Dict[str, Any]:
        """
        Scores all active jobs against the resume and returns
        personalized recommendations with direct apply links.
        """
        text = resume.parsed_text or ""
        parsed = resume.parsed_sections or {}

        domain = cls.detect_domain(text)
        exp_info = cls.detect_experience_tier(text, parsed)
        candidate_skills = set()

        # Gather skills from parsed_sections or text
        for s in parsed.get("skills", []):
            if isinstance(s, dict):
                candidate_skills.add(s.get("name", "").lower())
            elif isinstance(s, str):
                candidate_skills.add(s.lower())

        text_lower = text.lower()
        jobs = db.query(Job).filter(Job.is_active == True).all()

        scored_jobs = []

        for job in jobs:
            required = [s.strip() for s in (job.required_skills or [])]
            preferred = [s.strip() for s in (job.preferred_skills or [])]
            all_job_skills = required + preferred

            matched = []
            missing = []

            for s in all_job_skills:
                s_lower = s.lower()
                if s_lower in candidate_skills or re.search(r'\b' + re.escape(s_lower) + r'\b', text_lower):
                    matched.append(s)
                else:
                    missing.append(s)

            # Base skill match ratio
            total_skills = max(1, len(all_job_skills))
            skills_score = (len(matched) / total_skills) * 100

            # Domain affinity boost
            job_text = f"{job.title} {job.description} {' '.join(all_job_skills)}".lower()
            job_domain = cls.detect_domain(job_text)
            domain_boost = 18 if job_domain == domain else 0

            # Experience alignment boost
            exp_boost = 0
            is_job_fresher = any(w in job.experience_level.lower() for w in ['entry', 'fresher', 'junior', 'intern', '0-'])
            if exp_info["is_fresher"] and is_job_fresher:
                exp_boost = 12
            elif not exp_info["is_fresher"] and not is_job_fresher:
                exp_boost = 10

            final_score = int((skills_score * 0.7) + domain_boost + exp_boost)
            final_score = max(42, min(97, final_score))

            scored_jobs.append({
                "job_id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "work_type": job.work_type,
                "employment_type": job.employment_type,
                "experience_level": job.experience_level,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "description": job.description,
                "job_url": job.job_url or f"https://careers.google.com/jobs/results/?q={job.title.replace(' ', '+')}",
                "required_skills": required,
                "matched_skills": matched,
                "missing_skills": missing,
                "match_score": final_score,
                "domain": job_domain,
                "is_fresher_friendly": is_job_fresher,
                "domain_match": (job_domain == domain)
            })

        # Sort jobs by match_score descending
        scored_jobs.sort(key=lambda j: j["match_score"], reverse=True)

        return {
            "resume_id": resume.id,
            "candidate_name": parsed.get("name") or "Candidate",
            "detected_domain": domain,
            "detected_experience_tier": exp_info["tier"],
            "experience_reason": exp_info["reason"],
            "is_fresher": exp_info["is_fresher"],
            "total_matched_jobs": len(scored_jobs),
            "jobs": scored_jobs
        }
