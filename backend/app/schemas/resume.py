from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class ResumeBase(BaseModel):
    file_name: str
    file_size: int
    mime_type: str
    is_primary: bool = False
    version: int = 1

class ResumeResponse(ResumeBase):
    id: str
    user_id: str
    confidence_score: float
    parsed_sections: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    overall_score: int
    skills_score: int
    experience_score: int
    projects_score: int
    keywords_score: int
    achievement_score: int
    suggestions: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeParsedData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[str] = []
    confidence: float = 0.85
    message: Optional[str] = None
