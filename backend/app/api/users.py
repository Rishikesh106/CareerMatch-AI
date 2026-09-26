from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Profile, UserSkill, Education, Experience, Project, Certification
from app.schemas.user import (
    ProfileUpdate, ProfileResponse, UserSkillCreate, UserSkillResponse,
    EducationCreate, EducationResponse, ExperienceCreate, ExperienceResponse,
    ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse,
    CandidateProfileFull, UserResponse
)
from app.security.middleware import log_audit_event

router = APIRouter(prefix="/profile", tags=["Profile Management"])

@router.get("", response_model=Dict[str, Any])
def get_full_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, target_role=current_user.target_role)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    educations = db.query(Education).filter(Education.user_id == current_user.id).all()
    experiences = db.query(Experience).filter(Experience.user_id == current_user.id).all()
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    certifications = db.query(Certification).filter(Certification.user_id == current_user.id).all()

    # Calculate profile completeness score
    score = 40
    if profile.summary: score += 10
    if profile.linkedin_url or profile.github_url: score += 10
    if skills: score += 15
    if experiences: score += 15
    if educations: score += 5
    if projects: score += 5
    score = min(100, score)

    profile.completeness_score = score
    db.commit()

    return {
        "user": UserResponse.model_validate(current_user),
        "profile": ProfileResponse.model_validate(profile) if profile else None,
        "skills": [UserSkillResponse.model_validate(s) for s in skills],
        "educations": [EducationResponse.model_validate(e) for e in educations],
        "experiences": [ExperienceResponse.model_validate(ex) for ex in experiences],
        "projects": [ProjectResponse.model_validate(p) for p in projects],
        "certifications": [CertificationResponse.model_validate(c) for c in certifications]
    }

@router.put("", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    for field, val in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)

    # Sync primary target_role if updated
    if profile_in.target_role:
        current_user.target_role = profile_in.target_role
    if profile_in.location:
        current_user.location = profile_in.location

    db.commit()
    db.refresh(profile)
    log_audit_event("UPDATE_PROFILE", user_id=current_user.id, entity_type="profile", entity_id=profile.id, request=request)
    return profile

# --- Skills ---
@router.post("/skills", response_model=UserSkillResponse)
def add_skill(skill_in: UserSkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if exists
    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_name.ilike(skill_in.skill_name.strip())
    ).first()
    if existing:
        existing.proficiency = skill_in.proficiency
        existing.years_experience = skill_in.years_experience
        db.commit()
        db.refresh(existing)
        return existing

    new_skill = UserSkill(
        user_id=current_user.id,
        skill_name=skill_in.skill_name.strip(),
        category=skill_in.category or "General",
        proficiency=skill_in.proficiency or "Intermediate",
        years_experience=skill_in.years_experience or 1.0
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"success": True}

# --- Education ---
@router.post("/education", response_model=EducationResponse)
def add_education(edu_in: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = Education(user_id=current_user.id, **edu_in.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.delete("/education/{edu_id}")
def delete_education(edu_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    edu = db.query(Education).filter(Education.id == edu_id, Education.user_id == current_user.id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education not found")
    db.delete(edu)
    db.commit()
    return {"success": True}

# --- Experience ---
@router.post("/experience", response_model=ExperienceResponse)
def add_experience(exp_in: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = Experience(user_id=current_user.id, **exp_in.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/experience/{exp_id}")
def delete_experience(exp_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"success": True}

# --- Projects ---
@router.post("/projects", response_model=ProjectResponse)
def add_project(proj_in: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proj = Project(user_id=current_user.id, **proj_in.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

@router.delete("/projects/{proj_id}")
def delete_project(proj_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id, Project.user_id == current_user.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"success": True}

# --- Certifications ---
@router.post("/certifications", response_model=CertificationResponse)
def add_certification(cert_in: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = Certification(user_id=current_user.id, **cert_in.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/certifications/{cert_id}")
def delete_certification(cert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cert = db.query(Certification).filter(Certification.id == cert_id, Certification.user_id == current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"success": True}

# --- Data Privacy / Export / Deletion ---
@router.get("/export-data")
def export_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    educations = db.query(Education).filter(Education.user_id == current_user.id).all()
    experiences = db.query(Experience).filter(Experience.user_id == current_user.id).all()
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    certifications = db.query(Certification).filter(Certification.user_id == current_user.id).all()

    return {
        "user_account": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "location": current_user.location,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat()
        },
        "profile": {
            "headline": profile.headline if profile else None,
            "summary": profile.summary if profile else None,
            "remote_preference": profile.remote_preference if profile else None,
            "target_role": profile.target_role if profile else None
        },
        "skills": [{"name": s.skill_name, "category": s.category, "proficiency": s.proficiency} for s in skills],
        "experiences": [{"company": e.company, "role": e.role, "description": e.description} for e in experiences],
        "educations": [{"institution": ed.institution, "degree": ed.degree} for ed in educations],
        "projects": [{"name": p.name, "description": p.description, "technologies": p.technologies} for p in projects],
        "certifications": [{"name": c.name, "issuing_org": c.issuing_org} for c in certifications]
    }

@router.delete("/account")
def delete_account(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event("DELETE_ACCOUNT", user_id=current_user.id, entity_type="user", entity_id=current_user.id, request=request)
    db.delete(current_user)
    db.commit()
    return {"success": True, "message": "Your account and all associated data have been permanently deleted."}
