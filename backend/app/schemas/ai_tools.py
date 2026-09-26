from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class CoverLetterRequest(BaseModel):
    job_title: str
    company: str
    job_description: Optional[str] = None
    tone: Optional[str] = "Professional"  # Professional, Enthusiastic, Confident
    resume_id: Optional[str] = None

class CoverLetterResponse(BaseModel):
    subject: str
    content: str
    disclaimer: str = "Please review, personalize, and verify all AI-generated content before sending. CareerMatch AI never invents candidate qualifications."

class EmailRequest(BaseModel):
    job_title: str
    company: str
    email_type: str = "Application"  # Application, Follow-up, Thank You, Inquiry
    contact_person: Optional[str] = "Hiring Team"
    resume_id: Optional[str] = None

class EmailResponse(BaseModel):
    subject: str
    body: str
    disclaimer: str = "Review and customize this draft with specific personal details before sending."
