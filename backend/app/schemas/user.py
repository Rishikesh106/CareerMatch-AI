from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

# Auth / User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    career_level: Optional[str] = "Entry-level"
    target_role: Optional[str] = "Software Engineer"
    location: Optional[str] = "San Francisco, CA"

class UserCreate(UserBase):
    password: str
    confirm_password: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Profile Schemas
class ProfileBase(BaseModel):
    headline: Optional[str] = None
    summary: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_location: Optional[str] = None
    remote_preference: Optional[str] = "Hybrid"
    expected_salary: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    completeness_score: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Skills
class UserSkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "General"
    proficiency: Optional[str] = "Intermediate"
    years_experience: Optional[float] = 1.0

class UserSkillResponse(UserSkillCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True

# Education
class EducationCreate(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    is_current: Optional[bool] = False

class EducationResponse(EducationCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True

# Experience
class ExperienceCreate(BaseModel):
    company: str
    role: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    technologies: Optional[List[str]] = []
    is_current: Optional[bool] = False

class ExperienceResponse(ExperienceCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True

# Project
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None

class ProjectResponse(ProjectCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True

# Certification
class CertificationCreate(BaseModel):
    name: str
    issuing_org: str
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    credential_url: Optional[str] = None

class CertificationResponse(CertificationCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True

# Full Profile Response
class CandidateProfileFull(BaseModel):
    user: UserResponse
    profile: Optional[ProfileResponse] = None
    skills: List[UserSkillResponse] = []
    educations: List[EducationResponse] = []
    experiences: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []
