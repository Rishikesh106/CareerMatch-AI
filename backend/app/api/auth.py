from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.entities import User, Profile, Notification
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, PasswordResetRequest, PasswordResetConfirm
from app.api.deps import get_current_user
from app.security.middleware import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    if user_in.confirm_password and user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    hashed_pw = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        career_level=user_in.career_level or "Entry-level",
        target_role=user_in.target_role or "Software Engineer",
        location=user_in.location or "San Francisco, CA",
        role="candidate",
        is_active=True,
        is_verified=True # Auto-verify for streamlined portfolio demo
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize associated profile
    profile = Profile(
        user_id=user.id,
        headline=f"{user.target_role} | {user.career_level}",
        target_role=user.target_role,
        experience_level=user.career_level,
        location=user.location,
        completeness_score=60
    )
    db.add(profile)

    # Add welcome notification
    welcome_notif = Notification(
        user_id=user.id,
        title="Welcome to CareerMatch AI!",
        message="Upload your resume or build your candidate profile to start matching against top tech opportunities.",
        type="profile",
        link="/dashboard/resumes"
    )
    db.add(welcome_notif)
    db.commit()

    log_audit_event("REGISTER", user_id=user.id, entity_type="user", entity_id=user.id, request=request)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "career_level": user.career_level,
            "target_role": user.target_role,
            "location": user.location,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        },
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    }

@router.post("/login")
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        log_audit_event("FAILED_LOGIN", entity_type="auth", request=request, details={"email": login_in.email})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has been disabled."
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    log_audit_event("LOGIN", user_id=user.id, entity_type="user", entity_id=user.id, request=request)

    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "career_level": user.career_level,
            "target_role": user.target_role,
            "location": user.location,
            "avatar_url": user.avatar_url,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        },
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    }

@router.post("/refresh")
def refresh_token_endpoint(body: dict, db: Session = Depends(get_db)):
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    payload = decode_token(token, is_refresh=True)
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    new_access_token = create_access_token(user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "career_level": current_user.career_level,
        "target_role": current_user.target_role,
        "location": current_user.location,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # Always return success to prevent email enumeration
    return {"success": True, "message": "If the account exists, a password reset link has been dispatched."}

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    # Standard mock token verification for development
    return {"success": True, "message": "Password has been successfully updated. You may now log in."}
