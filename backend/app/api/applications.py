from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Application, User, Notification
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse

router = APIRouter(prefix="/applications", tags=["Application Tracker"])

@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Application).filter(Application.user_id == current_user.id)
    if status and status != "All":
        query = query.filter(Application.status.ilike(status))
    return query.order_by(Application.updated_at.desc()).all()

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_record = Application(
        user_id=current_user.id,
        **app_in.model_dump()
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)
    return app_record

@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: str,
    app_in: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_record = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app_record.status
    for field, val in app_in.model_dump(exclude_unset=True).items():
        setattr(app_record, field, val)

    # If transitioned to Interview or Offer, fire congratulations/reminder notification
    if app_record.status != old_status:
        if app_record.status == "Interview":
            db.add(Notification(
                user_id=current_user.id,
                title="Interview Stage Reached! 🎉",
                message=f"You moved {app_record.company} ({app_record.job_title}) to the Interview column. Generate prep questions now!",
                type="interview",
                link="/dashboard/interviews"
            ))
        elif app_record.status == "Offer":
            db.add(Notification(
                user_id=current_user.id,
                title="Offer Received! 🚀",
                message=f"Congratulations on your offer from {app_record.company} for {app_record.job_title}!",
                type="general",
                link="/dashboard/applications"
            ))

    db.commit()
    db.refresh(app_record)
    return app_record

@router.delete("/{app_id}")
def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_record = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app_record)
    db.commit()
    return {"success": True, "message": "Application deleted"}
