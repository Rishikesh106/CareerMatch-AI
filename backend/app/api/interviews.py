from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Interview, User, Application, Job
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse, InterviewPrepResponse
from app.ai.service import ai_service

router = APIRouter(prefix="/interviews", tags=["Interview Management"])

@router.get("", response_model=List[InterviewResponse])
def get_interviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.interview_date.asc()).all()

@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    int_in: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = Interview(
        user_id=current_user.id,
        **int_in.model_dump()
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview

@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: str,
    int_in: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    for field, val in int_in.model_dump(exclude_unset=True).items():
        setattr(interview, field, val)

    db.commit()
    db.refresh(interview)
    return interview

@router.delete("/{interview_id}")
def delete_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    db.delete(interview)
    db.commit()
    return {"success": True, "message": "Interview deleted"}

@router.get("/prep/generate", response_model=InterviewPrepResponse)
def generate_interview_prep(
    job_title: str = "Software Engineer",
    company: str = "Hiring Organization",
    interview_type: str = "Technical",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    candidate_data = {
        "full_name": current_user.full_name,
        "target_role": current_user.target_role,
        "career_level": current_user.career_level
    }
    job_data = {
        "title": job_title,
        "company": company
    }
    prep = ai_service.provider.generate_interview_prep(job_data, candidate_data, interview_type)
    ai_service.track_usage(db, "interview-prep", user_id=current_user.id)
    return prep
