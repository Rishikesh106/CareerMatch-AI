from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class ApplicationBase(BaseModel):
    job_title: str
    company: str
    status: str = "Saved"  # Saved, Applied, Screening, Interview, Offer, Rejected
    application_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    interview_date: Optional[str] = None
    contact_person: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    match_score: Optional[int] = 80
    job_id: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None
    application_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    interview_date: Optional[str] = None
    contact_person: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    match_score: Optional[int] = None

class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
