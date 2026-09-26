from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Resume, UserSkill, Profile
from app.schemas.ai_tools import CoverLetterRequest, CoverLetterResponse, EmailRequest, EmailResponse
from app.ai.service import ai_service

router = APIRouter(prefix="/ai-tools", tags=["AI Career Tools"])

@router.post("/cover-letter", response_model=CoverLetterResponse)
def generate_cover_letter(
    req: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = None
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == True).first()

    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    candidate_data = {
        "full_name": current_user.full_name,
        "target_role": current_user.target_role,
        "summary": profile.summary if profile else "",
        "skills": [{"skill_name": s.skill_name} for s in skills],
        "resume_text": resume.parsed_text if resume else ""
    }

    job_data = {
        "title": req.job_title,
        "company": req.company,
        "description": req.job_description or ""
    }

    res = ai_service.provider.generate_cover_letter(candidate_data, job_data, req.tone or "Professional")
    ai_service.track_usage(db, "cover-letter", user_id=current_user.id)
    return res

@router.post("/email", response_model=EmailResponse)
def generate_application_email(
    req: EmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate_data = {
        "full_name": current_user.full_name,
        "target_role": current_user.target_role
    }

    job_data = {
        "title": req.job_title,
        "company": req.company
    }

    res = ai_service.provider.generate_application_email(
        candidate_data, job_data, req.email_type, req.contact_person or "Hiring Team"
    )
    ai_service.track_usage(db, "application-email", user_id=current_user.id)
    return res
