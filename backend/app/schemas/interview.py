from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class InterviewBase(BaseModel):
    company: str
    position: str
    interview_date: str
    interview_type: str = "Technical"  # HR, Technical, Coding, Managerial, Final
    interviewer: Optional[str] = None
    notes: Optional[str] = None
    checklist: Optional[List[str]] = []
    outcome: Optional[str] = "scheduled"  # scheduled, passed, failed, cancelled
    application_id: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    interview_date: Optional[str] = None
    interview_type: Optional[str] = None
    interviewer: Optional[str] = None
    notes: Optional[str] = None
    checklist: Optional[List[str]] = None
    outcome: Optional[str] = None

class InterviewResponse(InterviewBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionGuidance(BaseModel):
    question: str
    category: str  # Technical, Behavioral, Role-specific, Resume-based
    why_asked: str
    recommended_approach: str
    key_points: List[str]

class InterviewPrepResponse(BaseModel):
    job_title: str
    company: str
    interview_type: str
    preparation_tips: List[str]
    questions: List[QuestionGuidance]
    disclaimer: str = "These questions and guidance are AI-generated practice materials to help you prepare. They are not guaranteed to be asked in actual interviews."
