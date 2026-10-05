from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.entities import Job, User, Application
from app.schemas.job import JobResponse, JobCreate, JobUpdate, JobAnalysisRequest, JobAnalysisResponse
from app.ai.service import ai_service
from app.security.middleware import log_audit_event

router = APIRouter(prefix="/jobs", tags=["Job Management"])

@router.get("", response_model=List[JobResponse])
def get_jobs(
    q: Optional[str] = Query(None, description="Search keyword in title, company, description"),
    location: Optional[str] = Query(None),
    work_type: Optional[str] = Query(None, description="Remote, Hybrid, On-site"),
    employment_type: Optional[str] = Query(None, description="Full-time, Contract, Internship"),
    experience_level: Optional[str] = Query(None, description="Fresher, Mid-level, Senior"),
    domain: Optional[str] = Query(None, description="Cybersecurity, Software Engineering, Cloud, Data"),
    skill: Optional[str] = Query(None, description="Filter by required skill"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_active == True)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_pattern),
                Job.company.ilike(search_pattern),
                Job.description.ilike(search_pattern)
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if work_type and work_type != "All":
        query = query.filter(Job.work_type.ilike(work_type))
    if employment_type and employment_type != "All":
        query = query.filter(Job.employment_type.ilike(employment_type))
    if experience_level and experience_level != "All":
        if "fresher" in experience_level.lower() or "entry" in experience_level.lower():
            query = query.filter(
                or_(
                    Job.experience_level.ilike("%fresher%"),
                    Job.experience_level.ilike("%entry%"),
                    Job.experience_level.ilike("%intern%"),
                    Job.experience_level.ilike("%junior%")
                )
            )
        else:
            query = query.filter(Job.experience_level.ilike(f"%{experience_level}%"))

    if domain and domain != "All":
        d_lower = domain.lower()
        if "cyber" in d_lower or "security" in d_lower:
            query = query.filter(
                or_(
                    Job.title.ilike("%security%"),
                    Job.title.ilike("%cyber%"),
                    Job.title.ilike("%soc%"),
                    Job.title.ilike("%penetration%"),
                    Job.title.ilike("%vapt%")
                )
            )
        elif "software" in d_lower or "developer" in d_lower or "web" in d_lower:
            query = query.filter(
                or_(
                    Job.title.ilike("%software%"),
                    Job.title.ilike("%developer%"),
                    Job.title.ilike("%full stack%"),
                    Job.title.ilike("%frontend%"),
                    Job.title.ilike("%backend%")
                )
            )
        elif "cloud" in d_lower or "devops" in d_lower:
            query = query.filter(
                or_(
                    Job.title.ilike("%cloud%"),
                    Job.title.ilike("%devops%"),
                    Job.title.ilike("%infrastructure%")
                )
            )
        elif "data" in d_lower or "ai" in d_lower:
            query = query.filter(
                or_(
                    Job.title.ilike("%data%"),
                    Job.title.ilike("%ai%"),
                    Job.title.ilike("%ml%"),
                    Job.title.ilike("%learning%")
                )
            )

    jobs = query.order_by(Job.posted_date.desc()).offset(offset).limit(limit).all()

    # Optional skill filtering in Python for DB engine portability
    if skill:
        skill_lower = skill.lower()
        jobs = [j for j in jobs if any(skill_lower in s.lower() for s in (j.required_skills or []))]

    return jobs

@router.post("/{job_id}/apply")
def apply_to_job(
    job_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if application already exists
    app = db.query(Application).filter(Application.user_id == current_user.id, Application.job_id == job.id).first()
    today_str = datetime.now().strftime("%Y-%m-%d")
    if not app:
        app = Application(
            user_id=current_user.id,
            job_id=job.id,
            job_title=job.title,
            company=job.company,
            status="Applied",
            application_date=today_str,
            job_url=job.job_url,
            notes=f"Applied directly to {job.company} via CareerMatch AI.",
            match_score=90
        )
        db.add(app)
    else:
        app.status = "Applied"
        app.application_date = today_str
        if job.job_url:
            app.job_url = job.job_url

    db.commit()
    db.refresh(app)
    log_audit_event("APPLY_JOB", user_id=current_user.id, entity_type="job", entity_id=job.id, request=request)

    return {
        "success": True,
        "job_url": job.job_url or f"https://careers.google.com/jobs/results/?q={job.title.replace(' ', '+')}",
        "application_id": app.id,
        "company": job.company,
        "title": job.title,
        "message": f"Application to {job.company} successfully tracked in your Kanban dashboard! Redirecting to official career application link."
    }

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    job = Job(**job_in.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: str, job_in: JobUpdate, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for field, val in job_in.model_dump(exclude_unset=True).items():
        setattr(job, field, val)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(job_id: str, current_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"success": True, "message": "Job removed successfully"}

@router.post("/analyze-jd", response_model=JobAnalysisResponse)
def analyze_job_description(request_in: JobAnalysisRequest, db: Session = Depends(get_db)):
    """
    Job Description Analyzer:
    Extracts skills, experience, education, responsibilities, and keywords from raw job description text.
    """
    if not request_in.description or len(request_in.description.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide a valid, descriptive job description (minimum 20 characters).")

    extracted = ai_service.provider.analyze_job_description(request_in.description)
    if request_in.title:
        extracted["title"] = request_in.title
    if request_in.company:
        extracted["company"] = request_in.company

    ai_service.track_usage(db, "analyze-jd", prompt_len=len(request_in.description))
    return extracted
