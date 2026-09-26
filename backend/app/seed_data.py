import os
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.entities import (
    User, Profile, Skill, UserSkill, Education, Experience,
    Project, Certification, Resume, ResumeAnalysis, Job,
    MatchAnalysis, Application, Interview, Notification, AuditLog, AIUsage
)
from app.ai.mock_provider import SKILLS_TAXONOMY

def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "alex@careermatch.ai").first():
            print("Database already seeded with demo data.")
            return

        print("Seeding skills taxonomy...")
        seen_skills = set()
        for category, skills in SKILLS_TAXONOMY.items():
            for s_name in skills:
                if s_name.lower() not in seen_skills:
                    seen_skills.add(s_name.lower())
                    if not db.query(Skill).filter(Skill.name.ilike(s_name)).first():
                        db.add(Skill(name=s_name, category=category, description=f"{s_name} competency"))
        db.commit()

        print("Seeding admin user...")
        admin = User(
            email="admin@careermatch.ai",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin Director",
            role="admin",
            is_active=True,
            is_verified=True,
            career_level="Lead / Executive",
            target_role="Platform Administrator",
            location="San Francisco, CA"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        db.add(Profile(
            user_id=admin.id,
            headline="Lead Platform Architect & Administrator",
            summary="Managing CareerMatch AI platform analytics, job integrations, and AI models.",
            completeness_score=100
        ))

        print("Seeding candidate Alex Johnson...")
        candidate = User(
            email="alex@careermatch.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Alex Johnson",
            role="candidate",
            is_active=True,
            is_verified=True,
            career_level="Mid-level",
            target_role="Full Stack Developer",
            location="San Francisco, CA",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        profile = Profile(
            user_id=candidate.id,
            headline="Full Stack Software Engineer | Python, React, TypeScript, Cloud",
            summary="Passionate full stack developer with 3+ years of experience building scalable web applications, robust REST APIs, and microservices. Dedicated to clean architecture, automated testing, and explainable AI systems.",
            phone="+1 (555) 234-5678",
            location="San Francisco, CA",
            linkedin_url="https://linkedin.com/in/alex-johnson-dev",
            github_url="https://github.com/alexjohnson-tech",
            portfolio_url="https://alexjohnson.dev",
            target_role="Full Stack Developer",
            experience_level="Mid-level (3 years)",
            preferred_location="San Francisco, CA / Remote",
            remote_preference="Hybrid",
            expected_salary="$120,000 - $145,000",
            completeness_score=95
        )
        db.add(profile)

        # Candidate Skills
        candidate_skills = [
            ("Python", "Programming", "Advanced", 3.5),
            ("JavaScript", "Programming", "Advanced", 3.0),
            ("TypeScript", "Programming", "Advanced", 2.5),
            ("React", "Programming", "Advanced", 3.0),
            ("SQL", "Databases", "Advanced", 3.0),
            ("PostgreSQL", "Databases", "Intermediate", 2.5),
            ("Docker", "DevOps", "Intermediate", 2.0),
            ("Linux", "Tools", "Advanced", 4.0),
            ("Git", "Tools", "Advanced", 3.5),
            ("REST APIs", "Tools", "Expert", 3.5),
            ("CI/CD", "DevOps", "Intermediate", 2.0),
            ("Problem Solving", "Soft Skills", "Expert", 4.0),
            ("Agile", "Soft Skills", "Advanced", 3.0),
        ]
        for s_name, cat, prof, yrs in candidate_skills:
            db.add(UserSkill(user_id=candidate.id, skill_name=s_name, category=cat, proficiency=prof, years_experience=yrs))

        # Education
        db.add(Education(
            user_id=candidate.id,
            institution="University of California, Berkeley",
            degree="Bachelor of Science",
            field_of_study="Computer Science",
            start_date="2018-09-01",
            end_date="2022-05-15",
            gpa="3.82",
            is_current=False
        ))

        # Experience
        db.add(Experience(
            user_id=candidate.id,
            company="Nexora Tech Solutions",
            role="Software Engineer",
            description="Engineered high-throughput microservices handling 2M+ requests daily with 99.98% uptime. Developed responsive user interfaces with React and TypeScript, optimizing client bundle load time by 32%.",
            start_date="2022-06-01",
            end_date="2024-08-30",
            technologies=["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Redis"],
            is_current=False
        ))
        db.add(Experience(
            user_id=candidate.id,
            company="Apex Cloud Labs",
            role="Junior Full Stack Engineer",
            description="Built internal administrative dashboards and automated data synchronization pipelines using Python and REST endpoints. Reduced data ingestion latency by 45%.",
            start_date="2021-06-01",
            end_date="2022-05-01",
            technologies=["Python", "JavaScript", "SQL", "Git", "Linux"],
            is_current=False
        ))

        # Projects
        db.add(Project(
            user_id=candidate.id,
            name="Distributed Task Orchestrator",
            description="A distributed job scheduler with Redis message queue, exponential backoff retries, and comprehensive monitoring dashboard.",
            technologies=["Python", "FastAPI", "Redis", "Docker", "React"],
            github_url="https://github.com/alexjohnson-tech/task-orchestrator",
            live_url="https://orchestrator-demo.alexjohnson.dev"
        ))
        db.add(Project(
            user_id=candidate.id,
            name="Real-Time Analytics Pipeline",
            description="Event streaming processor ingesting IoT sensor telemetry with PostgreSQL time-series indexing and interactive Recharts visualizations.",
            technologies=["TypeScript", "React", "Node.js", "PostgreSQL", "Tailwind CSS"],
            github_url="https://github.com/alexjohnson-tech/realtime-analytics",
            live_url="https://analytics-demo.alexjohnson.dev"
        ))

        # Certifications
        db.add(Certification(
            user_id=candidate.id,
            name="AWS Certified Solutions Architect – Associate",
            issuing_org="Amazon Web Services",
            issue_date="2023-04-10",
            expiration_date="2026-04-10",
            credential_url="https://aws.amazon.com/verification"
        ))

        # Resume
        resume_text = """ALEX JOHNSON
San Francisco, CA | (555) 234-5678 | alex@careermatch.ai
LinkedIn: linkedin.com/in/alex-johnson-dev | GitHub: github.com/alexjohnson-tech

SUMMARY
Full Stack Software Engineer with 3+ years of experience in Python, TypeScript, React, and cloud architectures. Proven track record of optimizing distributed REST APIs and creating intuitive web interfaces.

PROFESSIONAL EXPERIENCE
Software Engineer | Nexora Tech Solutions (2022 - 2024)
- Engineered scalable microservices handling 2M+ requests daily with 99.98% uptime using Python and FastAPI.
- Developed client-facing web application with React and TypeScript, reducing bundle load time by 32%.
- Implemented PostgreSQL query optimizations and indexing, speeding up analytical queries by 45%.
- Maintained Docker and CI/CD pipelines across staging and production clusters.

Junior Full Stack Engineer | Apex Cloud Labs (2021 - 2022)
- Built internal tooling and automated ETL scripts in Python, saving 15 engineering hours weekly.
- Collaborated with product designers to implement responsive, accessible UI components.

EDUCATION
University of California, Berkeley — B.S. in Computer Science (GPA: 3.82)

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, SQL, HTML, CSS
Frameworks & Tools: FastAPI, React, PostgreSQL, Docker, Redis, Git, Linux, REST APIs
Cloud: AWS (EC2, S3, RDS), CI/CD pipelines
"""
        os.makedirs(os.path.join(".", "uploads"), exist_ok=True)
        sample_path = os.path.join(".", "uploads", "alex_johnson_resume.pdf")
        with open(sample_path, "w", encoding="utf-8") as f:
            f.write(resume_text)

        resume = Resume(
            user_id=candidate.id,
            file_name="Alex_Johnson_Software_Engineer_Resume.pdf",
            file_path=sample_path,
            file_size=104857,
            mime_type="application/pdf",
            is_primary=True,
            version=1,
            parsed_text=resume_text,
            confidence_score=0.94
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        # Resume Analysis
        db.add(ResumeAnalysis(
            resume_id=resume.id,
            overall_score=86,
            skills_score=88,
            experience_score=85,
            projects_score=90,
            keywords_score=82,
            achievement_score=85,
            suggestions=[
                "Add quantified metrics to your junior role at Apex Cloud Labs.",
                "Explicitly highlight unit test coverage and automated integration testing frameworks.",
                "Detail your experience with container orchestration (e.g. Kubernetes) to appeal to senior infrastructure roles."
            ],
            strengths=[
                "Exceptional quantification of impact ('2M+ requests daily', '32% bundle speedup', '45% query speedup').",
                "Clean technical breakdown aligning with modern web development industry standards.",
                "Verified degree and tier-1 AWS cloud credential."
            ],
            weaknesses=[
                "Could expand on automated integration testing frameworks (pytest, vitest, cypress)."
            ]
        ))

        print("Seeding realistic job postings...")
        sample_jobs = [
            {
                "title": "Full Stack Developer",
                "company": "Starlight Financial",
                "location": "San Francisco, CA",
                "work_type": "Hybrid",
                "employment_type": "Full-time",
                "experience_level": "Mid-level",
                "salary_min": 125000,
                "salary_max": 155000,
                "description": "We are seeking a Full Stack Developer to build our next-generation fintech platform. You will work across modern React/TypeScript frontends and Python/PostgreSQL microservices. Experience with Docker, RESTful APIs, and CI/CD automation is required.",
                "required_skills": ["Python", "TypeScript", "React", "PostgreSQL", "Docker", "REST APIs"],
                "preferred_skills": ["Redis", "AWS", "CI/CD", "Tailwind CSS"],
                "education_requirement": "Bachelor's in Computer Science or related degree",
                "experience_requirement": "2-4 years"
            },
            {
                "title": "Backend Developer",
                "company": "Vanguard Cloud Systems",
                "location": "Remote",
                "work_type": "Remote",
                "employment_type": "Full-time",
                "experience_level": "Mid-level",
                "salary_min": 130000,
                "salary_max": 160000,
                "description": "Vanguard Cloud is looking for a Backend Engineer to scale our distributed cloud storage API. You will architect high-throughput services in Python/Go, design relational database schemas, and implement asynchronous event queues with Redis and Celery.",
                "required_skills": ["Python", "SQL", "PostgreSQL", "Docker", "Linux", "REST APIs"],
                "preferred_skills": ["Go", "Kubernetes", "Redis", "Celery", "AWS"],
                "education_requirement": "B.S. in Computer Science or equivalent practical experience",
                "experience_requirement": "3+ years"
            },
            {
                "title": "Cybersecurity Analyst",
                "company": "Fortress Defense Technologies",
                "location": "New York, NY",
                "work_type": "On-site",
                "employment_type": "Full-time",
                "experience_level": "Mid-level",
                "salary_min": 115000,
                "salary_max": 145000,
                "description": "Fortress Defense is seeking a Cybersecurity Analyst to monitor security events, investigate potential incidents, and maintain our SIEM infrastructure. You will conduct log analysis with Splunk, analyze threat intelligence feeds, and execute incident response procedures.",
                "required_skills": ["SIEM", "Splunk", "Incident Response", "Linux", "Network Security", "Threat Intelligence"],
                "preferred_skills": ["Python", "Wireshark", "Penetration Testing", "NIST"],
                "education_requirement": "Bachelor's in Cybersecurity, Computer Science, or equivalent",
                "experience_requirement": "2+ years"
            },
            {
                "title": "Cloud Engineer",
                "company": "Nimbus Infrastructure",
                "location": "Austin, TX",
                "work_type": "Hybrid",
                "employment_type": "Full-time",
                "experience_level": "Senior",
                "salary_min": 140000,
                "salary_max": 175000,
                "description": "Lead the design and automation of multi-region cloud infrastructure on AWS. Drive containerization with Kubernetes, codify infrastructure with Terraform, and implement zero-downtime CI/CD deployment pipelines.",
                "required_skills": ["AWS", "Terraform", "Kubernetes", "Docker", "Linux", "CI/CD"],
                "preferred_skills": ["Python", "Go", "Prometheus", "Ansible"],
                "education_requirement": "Bachelor's degree in engineering discipline",
                "experience_requirement": "4+ years"
            },
            {
                "title": "Data Analyst",
                "company": "MetricPulse AI",
                "location": "Remote",
                "work_type": "Remote",
                "employment_type": "Full-time",
                "experience_level": "Entry-level",
                "salary_min": 90000,
                "salary_max": 115000,
                "description": "Join MetricPulse to extract actionable product insights from user activity datasets. You will write complex SQL analytical queries, build automated reporting dashboards, and conduct statistical exploratory analysis with Python and Pandas.",
                "required_skills": ["SQL", "Python", "Data Analysis", "Pandas", "Problem Solving"],
                "preferred_skills": ["PostgreSQL", "Tableau", "Machine Learning", "Git"],
                "education_requirement": "Degree in Mathematics, Statistics, Computer Science, or Economics",
                "experience_requirement": "1-2 years"
            }
        ]

        created_jobs = []
        for j in sample_jobs:
            job_obj = Job(**j)
            db.add(job_obj)
            created_jobs.append(job_obj)
        db.commit()
        for j in created_jobs:
            db.refresh(j)

        print("Seeding Match Analyses...")
        # Match Alex Johnson with Full Stack Developer (High match ~88%)
        fs_job = created_jobs[0]
        db.add(MatchAnalysis(
            user_id=candidate.id,
            resume_id=resume.id,
            job_id=fs_job.id,
            job_title=fs_job.title,
            company=fs_job.company,
            overall_score=88,
            skills_score=92,
            experience_score=85,
            projects_score=94,
            education_score=95,
            certification_score=80,
            matched_skills=[
                {"skill": "Python", "status": "matched", "evidence": "Verified in profile (3.5 yrs) and work experience at Nexora.", "category": "Programming", "priority": "High"},
                {"skill": "TypeScript", "status": "matched", "evidence": "Verified in profile (2.5 yrs) and production React apps.", "category": "Programming", "priority": "High"},
                {"skill": "React", "status": "matched", "evidence": "Demonstrated across frontend architecture and projects.", "category": "Programming", "priority": "High"},
                {"skill": "PostgreSQL", "status": "matched", "evidence": "Documented in experience and personal projects.", "category": "Databases", "priority": "High"},
                {"skill": "Docker", "status": "matched", "evidence": "Containerized backend microservices at Nexora.", "category": "DevOps", "priority": "High"},
                {"skill": "REST APIs", "status": "matched", "evidence": "Deep experience architecting and testing REST services.", "category": "Tools", "priority": "High"},
            ],
            partial_skills=[
                {"skill": "AWS", "status": "partial", "evidence": "AWS Solutions Architect certificate verified; deeper production EC2 deployment details recommended.", "category": "Cloud", "priority": "Medium"}
            ],
            missing_skills=[
                {"skill": "Tailwind CSS", "status": "no_evidence", "evidence": "No evidence found in your current profile.", "category": "Programming", "priority": "Low"}
            ],
            explanations=[
                {"component": "Skills Alignment", "score": 92, "summary": "Outstanding alignment with 6 of 6 core required skills verified in your profile.", "details": ["Python, TypeScript, React, PostgreSQL, Docker, REST APIs confirmed."]},
                {"component": "Experience Alignment", "score": 85, "summary": "3 years of hands-on experience closely matches the 2-4 year requirement.", "details": ["Strong record of building microservices and web apps."]},
                {"component": "Project Relevance", "score": 94, "summary": "Projects strongly demonstrate distributed architecture and modern UI development.", "details": ["Task Orchestrator directly showcases your backend and UI skillset."]},
                {"component": "Education Alignment", "score": 95, "summary": "B.S. in Computer Science from UC Berkeley satisfies prerequisite.", "details": ["Strong academic credentials."]},
                {"component": "Certification Relevance", "score": 80, "summary": "AWS certification provides positive cloud engineering credential.", "details": ["AWS Solutions Architect valid until 2026."]}
            ],
            recommendations=[
                {
                    "missing_skill": "Tailwind CSS",
                    "category": "Programming",
                    "priority": "Low",
                    "steps": ["Review Tailwind CSS utility class system", "Convert a plain CSS/Sass project into utility classes", "Add verified Tailwind experience to your profile"],
                    "recommended_project": "Style a responsive portfolio dashboard using Tailwind CSS and headless components.",
                    "disclaimer": "Completing recommendations strengthens your profile evidence; it does not guarantee job placement."
                }
            ]
        ))

        # Match Alex Johnson with Cybersecurity Analyst (Lower match ~54% to show realistic skill gaps!)
        cyber_job = created_jobs[2]
        db.add(MatchAnalysis(
            user_id=candidate.id,
            resume_id=resume.id,
            job_id=cyber_job.id,
            job_title=cyber_job.title,
            company=cyber_job.company,
            overall_score=54,
            skills_score=45,
            experience_score=50,
            projects_score=60,
            education_score=90,
            certification_score=50,
            matched_skills=[
                {"skill": "Linux", "status": "matched", "evidence": "Demonstrated 4 years operating and administrating Linux servers.", "category": "Tools", "priority": "High"},
                {"skill": "Python", "status": "matched", "evidence": "Strong Python scripting and automated tooling capabilities.", "category": "Programming", "priority": "Medium"}
            ],
            partial_skills=[
                {"skill": "Network Security", "status": "partial", "evidence": "Basic networking and API security concepts evident, but formal enterprise defense experience is partial.", "category": "Cybersecurity", "priority": "High"}
            ],
            missing_skills=[
                {"skill": "SIEM", "status": "no_evidence", "evidence": "No evidence found in your current profile.", "category": "Cybersecurity", "priority": "High"},
                {"skill": "Splunk", "status": "no_evidence", "evidence": "No evidence found in your current profile.", "category": "Cybersecurity", "priority": "High"},
                {"skill": "Incident Response", "status": "no_evidence", "evidence": "No evidence found in your current profile.", "category": "Cybersecurity", "priority": "High"},
                {"skill": "Threat Intelligence", "status": "no_evidence", "evidence": "No evidence found in your current profile.", "category": "Cybersecurity", "priority": "High"}
            ],
            explanations=[
                {"component": "Skills Alignment", "score": 45, "summary": "Core software engineering skills match, but primary cybersecurity and SOC tooling lack evidence.", "details": ["Linux and Python matched. SIEM, Splunk, Incident Response lack evidence."]},
                {"component": "Experience Alignment", "score": 50, "summary": "Work experience has been primarily software development rather than security operations.", "details": ["Software engineering background provides strong analytical foundation."]}
            ],
            recommendations=[
                {
                    "missing_skill": "Splunk",
                    "category": "Cybersecurity",
                    "priority": "High",
                    "steps": ["Learn SIEM & log fundamentals", "Install Splunk Free & practice parsing syslog data", "Create search queries (SPL) and security alert dashboards", "Add verified project evidence to your profile"],
                    "recommended_project": "Build a home-lab security monitor analyzing SSH authentication failures using Splunk.",
                    "disclaimer": "Completing recommendations strengthens your profile evidence; it does not guarantee job placement."
                },
                {
                    "missing_skill": "Incident Response",
                    "category": "Cybersecurity",
                    "priority": "High",
                    "steps": ["Study the NIST and SANS incident response lifecycle", "Analyze malware artifacts and PCAP network traces", "Document tabletop exercise response workflows"],
                    "recommended_project": "Create an automated incident triage playbook script for suspicious web traffic.",
                    "disclaimer": "Completing recommendations strengthens your profile evidence; it does not guarantee job placement."
                }
            ]
        ))

        print("Seeding Applications...")
        # Applications in Kanban stages
        db.add(Application(
            user_id=candidate.id,
            job_id=fs_job.id,
            job_title="Full Stack Developer",
            company="Starlight Financial",
            status="Interview",
            application_date="2026-09-12",
            interview_date="2026-09-28",
            contact_person="Sarah Jenkins (Engineering Manager)",
            job_url="https://starlightfin.com/careers/fs-dev",
            notes="Passed initial HR screen. Technical round scheduled for Monday focusing on system design and React performance.",
            match_score=88
        ))
        db.add(Application(
            user_id=candidate.id,
            job_id=created_jobs[1].id,
            job_title="Backend Developer",
            company="Vanguard Cloud Systems",
            status="Screening",
            application_date="2026-09-15",
            contact_person="David Miller (Recruiter)",
            job_url="https://vanguardcloud.io/jobs/backend",
            notes="Recruiter reached out on LinkedIn. 30-min screening call scheduled.",
            match_score=84
        ))
        db.add(Application(
            user_id=candidate.id,
            job_title="Cloud Systems Specialist",
            company="Skyline Infrastructure",
            status="Applied",
            application_date="2026-09-20",
            contact_person="Hiring Team",
            job_url="https://skylineinfra.com/apply",
            notes="Applied through company portal with customized cover letter highlighting AWS Solutions Architect credential.",
            match_score=81
        ))
        db.add(Application(
            user_id=candidate.id,
            job_id=created_jobs[3].id,
            job_title="Cloud Engineer",
            company="Nimbus Infrastructure",
            status="Saved",
            application_date="2026-09-24",
            job_url="https://nimbus.cloud/careers",
            notes="Reviewing Kubernetes requirements before submitting application.",
            match_score=79
        ))
        db.add(Application(
            user_id=candidate.id,
            job_title="Software Engineer II",
            company="Helios Data Tech",
            status="Offer",
            application_date="2026-08-20",
            contact_person="Amanda Cruz (VP of Engineering)",
            job_url="https://heliosdata.com/jobs",
            notes="Received formal offer package ($135,000 base + equity). Evaluating team fit and benefits.",
            match_score=91
        ))
        db.add(Application(
            user_id=candidate.id,
            job_title="DevOps Specialist",
            company="Quantum Scale",
            status="Rejected",
            application_date="2026-08-01",
            notes="Role required 5+ years of production Terraform. Polite rejection received; encouraged to reapply for junior cloud roles.",
            match_score=68
        ))

        print("Seeding Interviews...")
        starlight_app = db.query(Application).filter(Application.company == "Starlight Financial").first()
        db.add(Interview(
            user_id=candidate.id,
            application_id=starlight_app.id if starlight_app else None,
            company="Starlight Financial",
            position="Full Stack Developer",
            interview_date="2026-09-28 14:00",
            interview_type="Technical",
            interviewer="Sarah Jenkins (Eng Manager) & Marcus Cole (Staff Architect)",
            notes="Focus on microservices communication, database concurrency, and React state management.",
            checklist=["Review REST API design principles", "Practice explanation of Task Orchestrator architecture", "Prepare questions regarding Starlight's deployment frequency"],
            outcome="scheduled"
        ))

        print("Seeding Notifications...")
        db.add(Notification(
            user_id=candidate.id,
            title="Upcoming Interview Reminder 🗓️",
            message="Technical round with Starlight Financial scheduled for Sep 28. Don't forget to practice generated questions!",
            type="interview",
            is_read=False,
            link="/dashboard/interviews"
        ))
        db.add(Notification(
            user_id=candidate.id,
            title="High Match Alert: 88% Match! 🎯",
            message="Your master resume scored an 88% match for Full Stack Developer at Starlight Financial.",
            type="match",
            is_read=False,
            link="/dashboard/matches"
        ))
        db.add(Notification(
            user_id=candidate.id,
            title="Resume Analysis Complete 📊",
            message="Your master resume quality scored 86/100. 3 actionable suggestions available.",
            type="resume",
            is_read=True,
            link="/dashboard/resumes"
        ))

        print("Seeding Audit and AI usage logs...")
        db.add(AuditLog(
            user_id=candidate.id,
            action="LOGIN",
            entity_type="user",
            entity_id=candidate.id,
            ip_address="198.51.100.24",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
            details={"method": "password"}
        ))
        db.add(AIUsage(
            user_id=candidate.id,
            provider="mock",
            endpoint="match-analysis",
            prompt_tokens=420,
            completion_tokens=280,
            total_tokens=700,
            estimated_cost=0.0014,
            latency_ms=45
        ))
        db.add(AIUsage(
            user_id=candidate.id,
            provider="mock",
            endpoint="resume-analysis",
            prompt_tokens=650,
            completion_tokens=320,
            total_tokens=970,
            estimated_cost=0.0019,
            latency_ms=62
        ))

        db.commit()
        print("Demo database successfully seeded!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
