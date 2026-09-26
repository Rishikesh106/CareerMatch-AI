from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.entities import User, Job, Resume, ResumeAnalysis, MatchAnalysis, Application, AuditLog, AIUsage, Skill
from app.schemas.admin import AdminStatsResponse, AuditLogResponse, AIUsageResponse, SkillItemCreate, SkillItemResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_jobs = db.query(Job).count()
    total_resumes = db.query(Resume).count()
    total_matches = db.query(MatchAnalysis).count()
    total_applications = db.query(Application).count()
    total_ai_reqs = db.query(AIUsage).count()
    total_tokens = db.query(func.sum(AIUsage.total_tokens)).scalar() or 0
    total_audit = db.query(AuditLog).count()

    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    recent_activity = [
        {
            "id": l.id,
            "action": l.action,
            "user_id": l.user_id,
            "entity_type": l.entity_type,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat()
        } for l in recent_logs
    ]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_jobs": total_jobs,
        "total_resumes": total_resumes,
        "total_matches": total_matches,
        "total_applications": total_applications,
        "total_ai_requests": total_ai_reqs,
        "total_ai_tokens": int(total_tokens),
        "total_audit_events": total_audit,
        "recent_activity": recent_activity
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    limit: int = 50,
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).offset(offset).limit(limit).all()

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot disable your own admin account")
    user.is_active = not user.is_active
    db.commit()
    return {"success": True, "user_id": user.id, "is_active": user.is_active}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/ai-usage", response_model=List[AIUsageResponse])
def get_ai_usage_history(
    limit: int = 50,
    offset: int = 0,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(AIUsage).order_by(AIUsage.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/skills", response_model=List[SkillItemResponse])
def get_admin_skills(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.category.asc(), Skill.name.asc()).all()

@router.post("/skills", response_model=SkillItemResponse)
def create_skill(skill_in: SkillItemCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    existing = db.query(Skill).filter(Skill.name.ilike(skill_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists in catalog")
    s = Skill(name=skill_in.name, category=skill_in.category, description=skill_in.description)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    s = db.query(Skill).filter(Skill.id == skill_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(s)
    db.commit()
    return {"success": True}
