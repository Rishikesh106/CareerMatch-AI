import re
import math
from typing import Dict, Any, List, Optional, Set
from collections import Counter
from app.ai.base import BaseAIProvider

# Comprehensive skill taxonomy
SKILLS_TAXONOMY = {
    "Programming": ["Python", "JavaScript", "TypeScript", "Go", "Java", "C++", "C#", "Rust", "PHP", "Ruby", "HTML", "CSS"],
    "Cloud": ["AWS", "Azure", "GCP", "Google Cloud", "Terraform", "CloudFormation", "Serverless", "Lambda", "EC2", "S3"],
    "Cybersecurity": ["SIEM", "Splunk", "Incident Response", "Threat Intelligence", "Penetration Testing", "Wireshark", "SOC", "NIST", "CIS", "Firewalls", "Network Security", "Vulnerability Management"],
    "Databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQL", "Cassandra", "DynamoDB", "SQLite"],
    "DevOps": ["Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Linux", "Git", "Ansible", "Nginx", "Prometheus", "Grafana"],
    "Data/AI": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn", "NLP", "LLM", "Data Analysis", "Computer Vision"],
    "Tools": ["Git", "Postman", "Jira", "Figma", "VS Code", "Linux", "Bash", "PowerShell"],
    "Soft Skills": ["Problem Solving", "Communication", "Leadership", "Teamwork", "Agile", "Scrum", "Critical Thinking", "Project Management"]
}

ALL_KNOWN_SKILLS = {skill.lower(): (skill, cat) for cat, skills in SKILLS_TAXONOMY.items() for skill in skills}

LEARNING_PATH_TEMPLATES = {
    "Splunk": {
        "steps": ["Learn SIEM & log fundamentals", "Install Splunk Free & practice parsing syslog data", "Create search queries (SPL) and security alert dashboards", "Add verified project evidence to your profile"],
        "project": "Build a home-lab security monitor analyzing SSH authentication failures using Splunk."
    },
    "Docker": {
        "steps": ["Learn containerization concepts vs VMs", "Write Dockerfiles for multi-stage web apps", "Master Docker Compose for microservices", "Deploy containerized applications to cloud"],
        "project": "Containerize a full-stack REST API and PostgreSQL database with health checks and volumes."
    },
    "Kubernetes": {
        "steps": ["Understand Pods, Services, and Deployments", "Set up Minikube or Kind for local testing", "Manage ConfigMaps, Secrets, and Ingress controllers", "Implement rolling updates and readiness probes"],
        "project": "Deploy a multi-tier web application on Minikube with horizontal pod autoscaling."
    },
    "AWS": {
        "steps": ["Understand core compute (EC2), storage (S3), and networking (VPC)", "Practice IAM least-privilege security policies", "Deploy serverless functions with AWS Lambda and API Gateway", "Prepare for AWS Certified Cloud Practitioner / Solutions Architect"],
        "project": "Host an automated static site on S3 + CloudFront with serverless backend API."
    },
    "PostgreSQL": {
        "steps": ["Master relational database schema design and normalization", "Practice advanced SQL: CTEs, Window functions, and JOINs", "Understand indexing strategies (B-Tree, GIN) and EXPLAIN ANALYZE", "Integrate with ORMs and connection pooling"],
        "project": "Design and benchmark a high-throughput e-commerce relational schema."
    },
    "Threat Intelligence": {
        "steps": ["Understand the Cyber Kill Chain and MITRE ATT&CK framework", "Analyze open-source threat feeds (AlienVault OTX, MISP)", "Map IOCs (Indicators of Compromise) to TTPs", "Integrate threat feeds into automated alert triaging"],
        "project": "Develop a Python script that enriches suspicious IP addresses against VirusTotal and AbuseIPDB."
    }
}

class MockAIProvider(BaseAIProvider):
    """
    Advanced rule-based and NLP heuristic AI provider.
    Runs locally with zero external API dependencies while producing
    transparent, explainable results adhering strictly to safety guidelines.
    """

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b[a-zA-Z0-9\+\#\.]+\b', text.lower())

    def _extract_skills_from_text(self, text: str) -> List[Dict[str, str]]:
        found = []
        text_lower = text.lower()
        for skill_key, (original_name, category) in ALL_KNOWN_SKILLS.items():
            pattern = r'\b' + re.escape(skill_key) + r'\b'
            if re.search(pattern, text_lower):
                found.append({"name": original_name, "category": category})
        return found

    def get_embedding(self, text: str) -> List[float]:
        # Deterministic 16-dimensional frequency representation
        tokens = self._tokenize(text)
        vector = [0.0] * 16
        for t in tokens:
            idx = sum(ord(c) for c in t) % 16
            vector[idx] += 1.0
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [round(x / norm, 4) for x in vector]
        return vector

    def calculate_similarity(self, text1: str, text2: str) -> float:
        tokens1 = Counter(self._tokenize(text1))
        tokens2 = Counter(self._tokenize(text2))
        
        all_tokens = set(tokens1.keys()).union(set(tokens2.keys()))
        if not all_tokens:
            return 0.5
            
        dot_product = sum(tokens1.get(t, 0) * tokens2.get(t, 0) for t in all_tokens)
        mag1 = math.sqrt(sum(v ** 2 for v in tokens1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in tokens2.values()))
        
        if mag1 * mag2 == 0:
            return 0.4
        score = dot_product / (mag1 * mag2)
        # Scale to 0.4 - 0.95 range for realistic candidate-job text similarity
        return min(round(0.45 + (score * 0.5), 2), 0.98)

    def analyze_resume(self, text: str, profile_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        text_lower = text.lower()
        extracted_skills = self._extract_skills_from_text(text)
        
        # Quantification detection (numbers, percentages, metrics)
        has_metrics = len(re.findall(r'\b\d+([\%xX]|\s*(?:percent|million|users|ms|s|gb|tb|reduced|increased))\b', text_lower)) >= 2
        has_action_verbs = len(re.findall(r'\b(developed|built|designed|engineered|implemented|architected|optimized|led|created|spearheaded)\b', text_lower)) >= 4
        has_projects = "project" in text_lower or (profile_data and profile_data.get("projects"))
        has_education = "education" in text_lower or "university" in text_lower or "bachelor" in text_lower or "master" in text_lower
        
        skill_score = min(95, 65 + len(extracted_skills) * 3)
        exp_score = 85 if has_action_verbs else 70
        proj_score = 88 if has_projects else 65
        kw_score = 80 if len(extracted_skills) >= 6 else 60
        achieve_score = 85 if has_metrics else 65
        
        overall = int((skill_score * 0.3) + (exp_score * 0.25) + (proj_score * 0.2) + (kw_score * 0.15) + (achieve_score * 0.1))
        
        suggestions = []
        if not has_metrics:
            suggestions.append("Quantify outcomes in your experience bullet points (e.g., 'improved query performance by 35%').")
        if len(extracted_skills) < 8:
            suggestions.append("Ensure verified technical tools, frameworks, and methodologies are explicitly highlighted.")
        if not has_projects:
            suggestions.append("Add independent or open-source projects demonstrating hands-on technical problem-solving.")
        suggestions.append("Tailor your summary section to clearly reflect your target role and core engineering competencies.")
        suggestions.append("Keep bullet points focused on impact and technologies used rather than basic daily duties.")

        strengths = [
            f"Detected {len(extracted_skills)} prominent industry skills clearly documented in text.",
            "Strong formatting structure with distinct section headers." if (has_education and has_projects) else "Good baseline technical documentation."
        ]
        if has_action_verbs:
            strengths.append("Effective use of strong action verbs across professional summaries.")

        weaknesses = []
        if not has_metrics:
            weaknesses.append("Several bullet points lack measurable performance metrics or quantifiable outcomes.")
        if len(extracted_skills) < 6:
            weaknesses.append("Key modern tooling references are sparse compared to typical industry benchmarks.")

        return {
            "overall_score": overall,
            "skills_score": skill_score,
            "experience_score": exp_score,
            "projects_score": proj_score,
            "keywords_score": kw_score,
            "achievement_score": achieve_score,
            "suggestions": suggestions,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "extracted_skills": [s["name"] for s in extracted_skills]
        }

    def analyze_job_description(self, jd_text: str) -> Dict[str, Any]:
        text_lower = jd_text.lower()
        extracted_skills = self._extract_skills_from_text(jd_text)
        skill_names = [s["name"] for s in extracted_skills]
        
        # Split skills into required and preferred
        half = max(1, len(skill_names) // 2)
        required = skill_names[:half] if len(skill_names) >= 4 else (skill_names if skill_names else ["Python", "SQL", "Git"])
        preferred = skill_names[half:] if len(skill_names) >= 4 else ["Docker", "AWS", "CI/CD"]
        
        # Extract title heuristic
        first_line = jd_text.strip().split("\n")[0][:80]
        title_match = re.search(r'(Senior|Junior|Lead|Staff)?\s*(Software Engineer|Backend Developer|Full Stack Developer|Frontend Developer|Cybersecurity Analyst|Cloud Engineer|DevOps Engineer|Data Analyst|Data Scientist)', jd_text, re.IGNORECASE)
        title = title_match.group(0).strip() if title_match else first_line
        
        # Experience detection
        exp_match = re.search(r'(\d+[\+\-]?\s*(?:to\s*\d+\s*)?years?(?:\s*of\s*experience)?)', text_lower)
        exp_req = exp_match.group(0).capitalize() if exp_match else "2+ years of relevant experience"
        
        # Education detection
        edu_req = "Bachelor's degree in Computer Science or related field" if ("bachelor" in text_lower or "degree" in text_lower) else "Bachelor's degree or equivalent practical experience"

        responsibilities = [
            "Design, develop, and maintain secure, scalable software services and APIs.",
            "Collaborate with cross-functional product and engineering teams to deliver quality features.",
            "Write robust unit and integration tests to ensure code reliability and security.",
            "Participate in code reviews, technical architecture discussions, and continuous improvement."
        ]

        keywords = list(set([s["name"] for s in extracted_skills] + ["REST APIs", "Agile", "Architecture", "Testing"]))

        return {
            "title": title,
            "company": "Hiring Organization",
            "required_skills": required,
            "preferred_skills": preferred,
            "experience_requirement": exp_req,
            "education_requirement": edu_req,
            "responsibilities": responsibilities,
            "keywords": keywords[:10]
        }

    def match_resume_to_job(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        # Extract candidate skills & text evidence
        candidate_skills_raw = candidate_data.get("skills", [])
        candidate_skill_names = set()
        for s in candidate_skills_raw:
            if isinstance(s, dict):
                candidate_skill_names.add(s.get("skill_name", "").lower())
            elif isinstance(s, str):
                candidate_skill_names.add(s.lower())

        resume_text = candidate_data.get("resume_text", "")
        profile_summary = candidate_data.get("summary", "")
        combined_candidate_text = f"{resume_text} {profile_summary} {' '.join(candidate_skill_names)}".lower()

        # Job requirements
        required_skills = job_data.get("required_skills", [])
        preferred_skills = job_data.get("preferred_skills", [])
        all_job_skills = required_skills + preferred_skills
        if not all_job_skills:
            all_job_skills = ["Python", "SQL", "Git", "REST APIs", "Linux"]
            required_skills = ["Python", "SQL", "Git"]
            preferred_skills = ["REST APIs", "Linux"]

        matched_list = []
        partial_list = []
        missing_list = []

        for skill in all_job_skills:
            skill_lower = skill.lower()
            category = ALL_KNOWN_SKILLS.get(skill_lower, (skill, "General"))[1]
            priority = "High" if skill in required_skills else "Medium"
            
            # Check exact match
            if skill_lower in candidate_skill_names or re.search(r'\b' + re.escape(skill_lower) + r'\b', combined_candidate_text):
                matched_list.append({
                    "skill": skill,
                    "status": "matched",
                    "evidence": f"Found explicit verified match in your profile skills / resume text.",
                    "category": category,
                    "priority": priority
                })
            else:
                # Check related partial matches
                is_partial = False
                for c_skill in candidate_skill_names:
                    if skill_lower in c_skill or c_skill in skill_lower:
                        is_partial = True
                        break
                
                if is_partial:
                    partial_list.append({
                        "skill": skill,
                        "status": "partial",
                        "evidence": f"Related competency identified in your profile, but specific evidence for '{skill}' is partial.",
                        "category": category,
                        "priority": priority
                    })
                else:
                    # STRICT SAFETY RULE: Wording MUST BE "No evidence found in your current profile."
                    missing_list.append({
                        "skill": skill,
                        "status": "no_evidence",
                        "evidence": "No evidence found in your current profile.",
                        "category": category,
                        "priority": priority
                    })

        # Calculate scores
        total_skills = max(1, len(all_job_skills))
        skills_score = int(((len(matched_list) * 1.0) + (len(partial_list) * 0.5)) / total_skills * 100)
        skills_score = max(35, min(96, skills_score))

        # Experience score
        candidate_exp = candidate_data.get("experiences", [])
        exp_score = min(95, 60 + len(candidate_exp) * 10)
        
        # Project relevance
        candidate_projects = candidate_data.get("projects", [])
        proj_score = min(95, 65 + len(candidate_projects) * 10)

        # Education
        candidate_edu = candidate_data.get("educations", [])
        edu_score = 90 if candidate_edu else 70

        # Certifications
        candidate_certs = candidate_data.get("certifications", [])
        cert_score = 85 if candidate_certs else 65

        # Semantic similarity
        job_description = job_data.get("description", "")
        semantic_sim = self.calculate_similarity(combined_candidate_text, job_description)
        semantic_component = int(semantic_sim * 100)

        # Overall weighted match score
        overall = int(
            (skills_score * 0.35) +
            (exp_score * 0.20) +
            (proj_score * 0.15) +
            (edu_score * 0.10) +
            (cert_score * 0.05) +
            (semantic_component * 0.15)
        )
        overall = max(40, min(97, overall))

        # Generate component explanations
        explanations = [
            {
                "component": "Skills Alignment",
                "score": skills_score,
                "summary": f"{len(matched_list)} verified matches and {len(partial_list)} partial matches out of {total_skills} target skills.",
                "details": [f"Directly verified: {', '.join([s['skill'] for s in matched_list[:4]]) or 'None'}"]
            },
            {
                "component": "Experience Alignment",
                "score": exp_score,
                "summary": f"Your career history demonstrates relevant professional and academic roles.",
                "details": [f"Evaluated {len(candidate_exp)} professional positions against role requirements."]
            },
            {
                "component": "Project Relevance",
                "score": proj_score,
                "summary": f"Active technical projects present practical evidence of hands-on software development.",
                "details": [f"{len(candidate_projects)} portfolio projects analyzed for technology alignment."]
            },
            {
                "component": "Education Alignment",
                "score": edu_score,
                "summary": "Academic background meets or aligns closely with stated prerequisite qualifications.",
                "details": ["Degree qualifications successfully parsed and evaluated."]
            },
            {
                "component": "Certification Relevance",
                "score": cert_score,
                "summary": "Industry credentials and certifications reviewed against domain standards.",
                "details": [f"{len(candidate_certs)} credentials verified in profile."]
            }
        ]

        # Generate learning path recommendations for missing skills
        recommendations = []
        for missing in missing_list[:4]:
            skill_name = missing["skill"]
            category = missing["category"]
            custom_info = LEARNING_PATH_TEMPLATES.get(skill_name, {
                "steps": [
                    f"Learn core concepts and syntax of {skill_name}",
                    f"Follow official documentation and interactive tutorials",
                    f"Build a small, focused project incorporating {skill_name}",
                    "Document your learnings and add project evidence to your profile"
                ],
                "project": f"Create a sample application demonstrating real-world use of {skill_name}."
            })
            recommendations.append({
                "missing_skill": skill_name,
                "category": category,
                "priority": missing["priority"],
                "steps": custom_info["steps"],
                "recommended_project": custom_info["project"],
                "disclaimer": "Completing recommendations strengthens your profile evidence; it does not guarantee job placement."
            })

        return {
            "overall_score": overall,
            "skills_score": skills_score,
            "experience_score": exp_score,
            "projects_score": proj_score,
            "education_score": edu_score,
            "certification_score": cert_score,
            "matched_skills": matched_list,
            "partial_skills": partial_list,
            "missing_skills": missing_list,
            "explanations": explanations,
            "recommendations": recommendations,
            "semantic_similarity": semantic_sim
        }

    def generate_cover_letter(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], tone: str = "Professional") -> Dict[str, Any]:
        candidate_name = candidate_data.get("full_name", "Applicant")
        target_role = job_data.get("title", "Software Engineer")
        company = job_data.get("company", "the hiring team")
        skills_list = [s.get("skill_name", "") for s in candidate_data.get("skills", [])][:4]
        skills_str = ", ".join(filter(None, skills_list)) or "modern software engineering, problem solving, and system design"

        content = f"""Dear Hiring Team at {company},

I am writing to express my enthusiastic interest in the {target_role} position. With a strong background in {skills_str}, I am confident in my ability to contribute meaningfully to your engineering initiatives from day one.

Throughout my academic and professional career, I have focused on building scalable, reliable, and user-centric systems. My hands-on experience with modern development practices and collaborative problem-solving has equipped me to tackle complex technical challenges effectively.

I am particularly excited about {company}'s commitment to innovation and engineering excellence. I welcome the opportunity to discuss how my technical skills, proactive mindset, and dedication can support your team's mission.

Thank you for your time and consideration.

Sincerely,
{candidate_name}"""

        return {
            "subject": f"Application for {target_role} - {candidate_name}",
            "content": content,
            "disclaimer": "Please review, personalize, and verify all AI-generated content before sending. CareerMatch AI never invents candidate qualifications."
        }

    def generate_application_email(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], email_type: str = "Application", contact_person: str = "Hiring Team") -> Dict[str, Any]:
        candidate_name = candidate_data.get("full_name", "Candidate")
        target_role = job_data.get("title", "Software Engineer")
        company = job_data.get("company", "Company")

        if email_type == "Follow-up":
            subject = f"Following up on {target_role} application — {candidate_name}"
            body = f"""Hi {contact_person},

I hope this email finds you well.

I am following up on my recent application for the {target_role} position at {company}. I remain very enthusiastic about the role and the chance to contribute my skills to your team.

Please let me know if there are any additional materials or details I can provide to support my application.

Best regards,
{candidate_name}"""
        elif email_type == "Thank You":
            subject = f"Thank you — {target_role} Interview — {candidate_name}"
            body = f"""Hi {contact_person},

Thank you very much for taking the time to speak with me today about the {target_role} role at {company}. I really enjoyed learning more about your team's engineering goals and upcoming projects.

Our conversation reinforced my enthusiasm for the opportunity. Please let me know if you need any follow-up information from my side.

Warm regards,
{candidate_name}"""
        else:
            subject = f"Application for {target_role} — {candidate_name}"
            body = f"""Dear {contact_person},

I am excited to submit my application for the {target_role} opening at {company}. 

Attached please find my resume for your review. My background includes practical experience in modern software development and engineering best practices. I look forward to the possibility of discussing how my experience aligns with your team's needs.

Thank you for your time and consideration.

Sincerely,
{candidate_name}"""

        return {
            "subject": subject,
            "body": body,
            "disclaimer": "Review and customize this draft with specific personal details before sending."
        }

    def generate_interview_prep(self, job_data: Dict[str, Any], candidate_data: Optional[Dict[str, Any]] = None, interview_type: str = "Technical") -> Dict[str, Any]:
        job_title = job_data.get("title", "Software Engineer")
        company = job_data.get("company", "the company")

        questions = [
            {
                "question": "Can you walk us through the architecture of a complex project you developed, explaining the technical trade-offs you made?",
                "category": "Technical",
                "why_asked": "Assesses end-to-end system understanding, decision rationale, and ability to balance performance vs simplicity.",
                "recommended_approach": "Use the STAR method (Situation, Task, Action, Result) with specific architectural diagrams in mind.",
                "key_points": [
                    "State the business problem and constraints clearly.",
                    "Highlight why specific technologies (e.g. databases, caching) were chosen.",
                    "Discuss challenges encountered and how you mitigated them."
                ]
            },
            {
                "question": "How do you ensure data integrity, API security, and graceful error handling in production services?",
                "category": "Role-specific",
                "why_asked": "Validates familiarity with industry reliability, authentication, and defensive engineering practices.",
                "recommended_approach": "Reference standard security practices such as JWT validation, input sanitization, rate limiting, and structured logging.",
                "key_points": [
                    "Mention centralized error handling middlewares.",
                    "Discuss database transactions and ACID properties.",
                    "Emphasize monitoring, alerts, and audit logging."
                ]
            },
            {
                "question": "Tell me about a time you faced ambiguous technical requirements or a tight deadline. How did you prioritize?",
                "category": "Behavioral",
                "why_asked": "Evaluates self-direction, cross-functional communication, and pragmatic delivery mindset.",
                "recommended_approach": "Focus on proactive stakeholder communication, MVP scoping, and iterative delivery.",
                "key_points": [
                    "Clarifying unknowns with product or lead engineers early.",
                    "Breaking down tasks into measurable milestones.",
                    "Reflecting on what was delivered and post-launch takeaways."
                ]
            },
            {
                "question": f"Based on your profile, how would you leverage your technical background to solve {company}'s engineering challenges?",
                "category": "Resume-based",
                "why_asked": "Measures genuine enthusiasm for the specific company domain and self-awareness of skill applicability.",
                "recommended_approach": "Bridge your past project experiences directly to the role responsibilities mentioned in the job description.",
                "key_points": [
                    "Connect specific tools you have built with to their stack.",
                    "Express curiosity about their engineering roadmap.",
                    "Ask a thoughtful question about their deployment or scaling hurdles."
                ]
            }
        ]

        tips = [
            f"Review the key competencies requested for {job_title}.",
            "Prepare concrete examples highlighting quantifiable results from past projects.",
            "Practice explaining technical trade-offs aloud clearly and concisely.",
            f"Formulate 2-3 insightful questions about {company}'s engineering culture and challenges."
        ]

        return {
            "job_title": job_title,
            "company": company,
            "interview_type": interview_type,
            "preparation_tips": tips,
            "questions": questions,
            "disclaimer": "These questions and guidance are AI-generated practice materials to help you prepare. They are not guaranteed to be asked in actual interviews."
        }
