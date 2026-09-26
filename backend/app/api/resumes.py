import os
import shutil
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Resume, ResumeAnalysis, Profile, UserSkill, Experience, Education, Project
from app.parsers.resume_parser import ResumeParser
from app.ai.service import ai_service
from app.schemas.resume import ResumeResponse, ResumeAnalysisResponse, ResumeParsedData
from app.security.middleware import log_audit_event

router = APIRouter(prefix="/resumes", tags=["Resume Management"])

@router.get("", response_model=List[ResumeResponse])
def get_user_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return resumes

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file extension
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type .{ext}. Only PDF and DOCX documents are supported."
        )

    # Validate file size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save to disk securely
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Parse resume
    parsed_info = ResumeParser.parse(file_path, file.content_type or f"application/{ext}")

    # Check if user already has resumes
    existing_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    is_primary = True if existing_count == 0 else False

    # Create Resume entity
    resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or f"application/{ext}",
        is_primary=is_primary,
        version=existing_count + 1,
        parsed_text=parsed_info.get("raw_text", ""),
        parsed_sections=parsed_info,
        confidence_score=parsed_info.get("confidence_score", 0.85)
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Auto-generate AI analysis
    ai_result = ai_service.provider.analyze_resume(resume.parsed_text or "")
    analysis = ResumeAnalysis(
        resume_id=resume.id,
        overall_score=ai_result.get("overall_score", 78),
        skills_score=ai_result.get("skills_score", 75),
        experience_score=ai_result.get("experience_score", 80),
        projects_score=ai_result.get("projects_score", 82),
        keywords_score=ai_result.get("keywords_score", 70),
        achievement_score=ai_result.get("achievement_score", 72),
        suggestions=ai_result.get("suggestions", []),
        strengths=ai_result.get("strengths", []),
        weaknesses=ai_result.get("weaknesses", [])
    )
    db.add(analysis)

    # Auto-populate user skills if candidate has few skills
    current_skill_count = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).count()
    if current_skill_count == 0 and parsed_info.get("skills"):
        for s in parsed_info.get("skills", [])[:10]:
            user_skill = UserSkill(
                user_id=current_user.id,
                skill_name=s["name"],
                category=s.get("category", "General"),
                proficiency="Intermediate",
                years_experience=1.5
            )
            db.add(user_skill)

    db.commit()
    log_audit_event("UPLOAD_RESUME", user_id=current_user.id, entity_type="resume", entity_id=resume.id, request=request)
    return resume

@router.put("/{resume_id}/primary")
def set_primary_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Demote others
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": False})
    resume.is_primary = True
    db.commit()
    return {"success": True, "message": "Primary resume updated"}

@router.get("/{resume_id}/download")
def download_resume(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume or not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server")
    return FileResponse(
        path=resume.file_path,
        filename=resume.file_name,
        media_type=resume.mime_type
    )

@router.delete("/{resume_id}")
def delete_resume(resume_id: str, request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()
    log_audit_event("DELETE_RESUME", user_id=current_user.id, entity_type="resume", entity_id=resume_id, request=request)
    return {"success": True, "message": "Resume deleted successfully"}

@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
def get_resume_analysis(resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = db.query(ResumeAnalysis).join(Resume).filter(
        ResumeAnalysis.resume_id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not analysis:
        # Generate on demand
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        ai_res = ai_service.provider.analyze_resume(resume.parsed_text or "")
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            overall_score=ai_res.get("overall_score", 80),
            skills_score=ai_res.get("skills_score", 78),
            experience_score=ai_res.get("experience_score", 82),
            projects_score=ai_res.get("projects_score", 85),
            keywords_score=ai_res.get("keywords_score", 74),
            achievement_score=ai_res.get("achievement_score", 76),
            suggestions=ai_res.get("suggestions", []),
            strengths=ai_res.get("strengths", []),
            weaknesses=ai_res.get("weaknesses", [])
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
    return analysis
