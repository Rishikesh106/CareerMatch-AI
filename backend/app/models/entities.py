import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="candidate")  # "candidate", "admin", "recruiter"
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    career_level = Column(String, default="Entry-level")
    target_role = Column(String, default="Software Engineer")
    location = Column(String, default="San Francisco, CA")
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="user", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    matches = relationship("MatchAnalysis", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    headline = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    preferred_location = Column(String, nullable=True)
    remote_preference = Column(String, default="Hybrid")  # Remote, Hybrid, On-site
    expected_salary = Column(String, nullable=True)
    completeness_score = Column(Integer, default=50)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="General")  # Programming, Cloud, Cybersecurity, Databases, DevOps, Data/AI, Soft Skills, Tools
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String, nullable=False)
    category = Column(String, default="General")
    proficiency = Column(String, default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    years_experience = Column(Float, default=1.0)

    user = relationship("User", back_populates="user_skills")


class Education(Base):
    __tablename__ = "educations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=False)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    gpa = Column(String, nullable=True)
    is_current = Column(Boolean, default=False)

    user = relationship("User", back_populates="educations")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    technologies = Column(JSON, default=list)
    is_current = Column(Boolean, default=False)

    user = relationship("User", back_populates="experiences")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(JSON, default=list)
    github_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)

    user = relationship("User", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    issuing_org = Column(String, nullable=False)
    issue_date = Column(String, nullable=True)
    expiration_date = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)

    user = relationship("User", back_populates="certifications")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    parsed_text = Column(Text, nullable=True)
    parsed_sections = Column(JSON, default=dict)
    confidence_score = Column(Float, default=0.85)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    resume_id = Column(String, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_score = Column(Integer, default=75)
    skills_score = Column(Integer, default=70)
    experience_score = Column(Integer, default=75)
    projects_score = Column(Integer, default=80)
    keywords_score = Column(Integer, default=70)
    achievement_score = Column(Integer, default=75)
    suggestions = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

    resume = relationship("Resume", back_populates="analysis")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, index=True, nullable=False)
    company = Column(String, index=True, nullable=False)
    location = Column(String, default="Remote")
    work_type = Column(String, default="Remote")  # Remote, Hybrid, On-site
    employment_type = Column(String, default="Full-time")  # Full-time, Contract, Internship
    experience_level = Column(String, default="Mid-level")
    salary_min = Column(Integer, default=80000)
    salary_max = Column(Integer, default=130000)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    education_requirement = Column(String, default="Bachelor's degree or equivalent")
    experience_requirement = Column(String, default="2+ years")
    job_url = Column(String, nullable=True)
    posted_date = Column(DateTime, default=utc_now)
    deadline = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class MatchAnalysis(Base):
    __tablename__ = "match_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(String, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    overall_score = Column(Integer, default=75)
    skills_score = Column(Integer, default=75)
    experience_score = Column(Integer, default=70)
    projects_score = Column(Integer, default=80)
    education_score = Column(Integer, default=85)
    certification_score = Column(Integer, default=70)
    matched_skills = Column(JSON, default=list)
    partial_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    explanations = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="matches")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    status = Column(String, default="Saved")  # Saved, Applied, Screening, Interview, Offer, Rejected
    application_date = Column(String, default=lambda: datetime.date.today().isoformat())
    follow_up_date = Column(String, nullable=True)
    interview_date = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    job_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    match_score = Column(Integer, default=80)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(String, ForeignKey("applications.id", ondelete="SET NULL"), nullable=True)
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    interview_date = Column(String, nullable=False)
    interview_type = Column(String, default="Technical")  # HR, Technical, Coding, Managerial, Final
    interviewer = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    checklist = Column(JSON, default=list)
    outcome = Column(String, default="scheduled")  # scheduled, passed, failed, cancelled
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="interviews")
    application = relationship("Application", back_populates="interviews")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="general")  # follow_up, interview, profile, resume, match, skill
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)  # "LOGIN", "REGISTER", "UPLOAD_RESUME", "DELETE_RESUME", "MATCH_JOB", etc.
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)


class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    provider = Column(String, default="mock")
    endpoint = Column(String, nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=50)
    created_at = Column(DateTime, default=utc_now)
