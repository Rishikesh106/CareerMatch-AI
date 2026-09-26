from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: str = "Remote"
    work_type: str = "Remote"
    employment_type: str = "Full-time"
    experience_level: str = "Mid-level"
    salary_min: Optional[int] = 80000
    salary_max: Optional[int] = 130000
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    education_requirement: Optional[str] = "Bachelor's degree or equivalent"
    experience_requirement: Optional[str] = "2+ years"
    job_url: Optional[str] = None
    deadline: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    work_type: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    education_requirement: Optional[str] = None
    experience_requirement: Optional[str] = None
    job_url: Optional[str] = None
    deadline: Optional[str] = None
    is_active: Optional[bool] = None

class JobResponse(JobBase):
    id: str
    is_active: bool
    posted_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class JobAnalysisRequest(BaseModel):
    description: str
    title: Optional[str] = None
    company: Optional[str] = None

class JobAnalysisResponse(BaseModel):
    title: str
    company: Optional[str] = "Disclosed in description"
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_requirement: str = "Not specified"
    education_requirement: str = "Not specified"
    responsibilities: List[str] = []
    keywords: List[str] = []
