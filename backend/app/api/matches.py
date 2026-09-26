from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Resume, Job, MatchAnalysis, UserSkill, Experience, Project, Education, Certification, Profile
from app.schemas.match import MatchRequest, MatchResponse, SkillGapReport
from app.ai.service import ai_service

router = APIRouter(prefix="/matches", tags=["AI Job Matching"])

def _build_candidate_payload(user: User, resume: Optional[Resume], db: Session) -> Dict[str, Any]:
    skills = db.query(UserSkill).filter(UserSkill.user_id == user.id).all()
    experiences = db.query(Experience).filter(Experience.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    educations = db.query(Education).filter(Education.user_id == user.id).all()
    certifications = db.query(Certification).filter(Certification.user_id == user.id).all()
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    return {
        "full_name": user.full_name,
        "target_role": user.target_role,
        "career_level": user.career_level,
        "summary": profile.summary if profile else "",
        "resume_text": resume.parsed_text if resume else "",
        "skills": [{"skill_name": s.skill_name, "category": s.category, "proficiency": s.proficiency} for s in skills],
        "experiences": [{"company": e.company, "role": e.role, "description": e.description} for e in experiences],
        "projects": [{"name": p.name, "description": p.description, "technologies": p.technologies} for p in projects],
        "educations": [{"institution": ed.institution, "degree": ed.degree} for ed in educations],
        "certifications": [{"name": c.name, "issuing_org": c.issuing_org} for c in certifications]
    }

@router.post("", response_model=MatchResponse)
def compute_match(
    req: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve resume (specified or primary)
    resume = None
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == True).first()
    if not resume:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()

    # Retrieve or construct job details
    job = None
    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()

    job_title = job.title if job else (req.job_title or "Software Engineer")
    company = job.company if job else (req.company or "Technology Partner")
    job_description = job.description if job else (req.job_description or "")
    required_skills = job.required_skills if job else []
    preferred_skills = job.preferred_skills if job else []

    # If job description passed without DB job, extract skills on the fly
    if not job and job_description:
        parsed_jd = ai_service.provider.analyze_job_description(job_description)
        required_skills = parsed_jd.get("required_skills", [])
        preferred_skills = parsed_jd.get("preferred_skills", [])
        if not req.job_title:
            job_title = parsed_jd.get("title", job_title)

    candidate_payload = _build_candidate_payload(current_user, resume, db)
    job_payload = {
        "title": job_title,
        "company": company,
        "description": job_description,
        "required_skills": required_skills,
        "preferred_skills": preferred_skills
    }

    # Run AI Matching Engine
    match_result = ai_service.provider.match_resume_to_job(candidate_payload, job_payload)

    # Persist match record
    match_record = MatchAnalysis(
        user_id=current_user.id,
        resume_id=resume.id if resume else None,
        job_id=job.id if job else None,
        job_title=job_title,
        company=company,
        overall_score=match_result["overall_score"],
        skills_score=match_result["skills_score"],
        experience_score=match_result["experience_score"],
        projects_score=match_result["projects_score"],
        education_score=match_result["education_score"],
        certification_score=match_result["certification_score"],
        matched_skills=match_result["matched_skills"],
        partial_skills=match_result["partial_skills"],
        missing_skills=match_result["missing_skills"],
        explanations=match_result["explanations"],
        recommendations=match_result["recommendations"]
    )
    db.add(match_record)
    db.commit()
    db.refresh(match_record)

    ai_service.track_usage(db, "match-analysis", user_id=current_user.id)

    return {
        "id": match_record.id,
        "job_id": job.id if job else None,
        "job_title": job_title,
        "company": company,
        "overall_score": match_result["overall_score"],
        "skills_score": match_result["skills_score"],
        "experience_score": match_result["experience_score"],
        "projects_score": match_result["projects_score"],
        "education_score": match_result["education_score"],
        "certification_score": match_result["certification_score"],
        "matched_skills": match_result["matched_skills"],
        "partial_skills": match_result["partial_skills"],
        "missing_skills": match_result["missing_skills"],
        "explanations": match_result["explanations"],
        "recommendations": match_result["recommendations"],
        "semantic_similarity": match_result.get("semantic_similarity", 0.8),
        "created_at": match_record.created_at
    }

@router.get("", response_model=List[MatchResponse])
def get_match_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    matches = db.query(MatchAnalysis).filter(
        MatchAnalysis.user_id == current_user.id
    ).order_by(MatchAnalysis.created_at.desc()).limit(20).all()
    return matches

@router.get("/{match_id}", response_model=MatchResponse)
def get_match_detail(match_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    match = db.query(MatchAnalysis).filter(
        MatchAnalysis.id == match_id,
        MatchAnalysis.user_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match analysis record not found")
    return match

@router.get("/skill-gaps/summary", response_model=SkillGapReport)
def get_skill_gaps_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Aggregates skill gaps across recent job matches to produce a holistic skill-gap report.
    """
    recent_matches = db.query(MatchAnalysis).filter(
        MatchAnalysis.user_id == current_user.id
    ).order_by(MatchAnalysis.created_at.desc()).limit(5).all()

    missing_dict = {}
    matched_set = set()
    partial_set = set()
    learning_paths = []

    for m in recent_matches:
        for s in (m.matched_skills or []):
            matched_set.add(s.get("skill"))
        for s in (m.partial_skills or []):
            partial_set.add(s.get("skill"))
        for s in (m.missing_skills or []):
            name = s.get("skill")
            if name:
                missing_dict[name] = s
        for rec in (m.recommendations or []):
            if not any(r["missing_skill"] == rec["missing_skill"] for r in learning_paths):
                learning_paths.append(rec)

    # Categorize gaps
    categorized: Dict[str, list] = {}
    top_missing = list(missing_dict.values())
    for item in top_missing:
        cat = item.get("category", "General")
        categorized.setdefault(cat, []).append(item)

    total = len(matched_set) + len(partial_set) + len(top_missing)

    return {
        "total_skills_required": max(total, 8),
        "matched_count": len(matched_set),
        "partial_count": len(partial_set),
        "missing_count": len(top_missing),
        "top_missing_skills": top_missing[:8],
        "categorized_gaps": categorized,
        "learning_paths": learning_paths[:5]
    }
