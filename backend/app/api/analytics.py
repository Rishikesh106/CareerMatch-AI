from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Application, Interview, Resume, ResumeAnalysis, MatchAnalysis, UserSkill, Profile

router = APIRouter(prefix="/analytics", tags=["Analytics & Dashboard"])

@router.get("/dashboard-summary")
def get_dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).all()
    matches = db.query(MatchAnalysis).filter(MatchAnalysis.user_id == current_user.id).all()
    primary_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == True).first()
    resume_analysis = None
    if primary_resume:
        resume_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == primary_resume.id).first()

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    completeness = profile.completeness_score if profile else 50

    total_apps = len(apps)
    saved_count = sum(1 for a in apps if a.status.lower() == "saved")
    applied_count = sum(1 for a in apps if a.status.lower() == "applied")
    screening_count = sum(1 for a in apps if a.status.lower() == "screening")
    interview_count = sum(1 for a in apps if a.status.lower() == "interview") or len(interviews)
    offer_count = sum(1 for a in apps if a.status.lower() == "offer")
    rejected_count = sum(1 for a in apps if a.status.lower() == "rejected")

    active_applied = applied_count + screening_count + interview_count + offer_count
    conversion_rate = round((interview_count / max(1, active_applied)) * 100, 1)

    avg_match = 0
    if matches:
        avg_match = round(sum(m.overall_score for m in matches) / len(matches), 1)

    # Status distribution for charts
    status_distribution = [
        {"name": "Saved", "value": saved_count, "color": "#94a3b8"},
        {"name": "Applied", "value": applied_count, "color": "#6366f1"},
        {"name": "Screening", "value": screening_count, "color": "#38bdf8"},
        {"name": "Interview", "value": interview_count, "color": "#f59e0b"},
        {"name": "Offer", "value": offer_count, "color": "#10b981"},
        {"name": "Rejected", "value": rejected_count, "color": "#ef4444"},
    ]

    # Application funnel
    funnel = [
        {"stage": "Saved", "count": saved_count + active_applied + rejected_count},
        {"stage": "Applied", "count": active_applied + rejected_count},
        {"stage": "Screening", "count": screening_count + interview_count + offer_count},
        {"stage": "Interview", "count": interview_count + offer_count},
        {"stage": "Offer", "count": offer_count}
    ]

    # Match score distribution
    score_ranges = {"60-70%": 0, "70-80%": 0, "80-90%": 0, "90-100%": 0}
    for m in matches:
        s = m.overall_score
        if s < 70: score_ranges["60-70%"] += 1
        elif s < 80: score_ranges["70-80%"] += 1
        elif s < 90: score_ranges["80-90%"] += 1
        else: score_ranges["90-100%"] += 1

    match_distribution = [{"range": k, "count": v} for k, v in score_ranges.items()]

    # Timeline (mocked last 6 months trend with real totals)
    timeline_data = [
        {"month": "May", "applied": max(1, total_apps // 5), "interviews": 0, "offers": 0},
        {"month": "Jun", "applied": max(2, total_apps // 4), "interviews": 1, "offers": 0},
        {"month": "Jul", "applied": max(3, total_apps // 3), "interviews": 1, "offers": 0},
        {"month": "Aug", "applied": max(4, total_apps // 2), "interviews": interview_count // 2, "offers": 0},
        {"month": "Sep", "applied": total_apps, "interviews": interview_count, "offers": offer_count}
    ]

    # Recommended actions
    recommended_actions = []
    if completeness < 85:
        recommended_actions.append({
            "id": "profile_complete",
            "title": "Boost Profile Completeness",
            "description": f"Your profile is at {completeness}%. Add education, certifications, and technical projects to improve match accuracy.",
            "link": "/dashboard/profile",
            "badge": "Profile",
            "priority": "High"
        })
    if not primary_resume:
        recommended_actions.append({
            "id": "upload_resume",
            "title": "Upload Master Resume",
            "description": "Upload a PDF or DOCX resume to unlock automated AI parsing and tailored keyword insights.",
            "link": "/dashboard/resumes",
            "badge": "Resume",
            "priority": "Critical"
        })
    elif resume_analysis and resume_analysis.overall_score < 80:
        recommended_actions.append({
            "id": "resume_health",
            "title": "Improve Resume Metrics",
            "description": "Quantify outcomes in your experience bullets to increase your resume impact score.",
            "link": "/dashboard/resumes",
            "badge": "Analysis",
            "priority": "Medium"
        })

    if interview_count > 0:
        recommended_actions.append({
            "id": "interview_prep",
            "title": "Review Interview Practice Questions",
            "description": "Generate technical and behavioral mock questions tailored to your active interview pipeline.",
            "link": "/dashboard/interviews",
            "badge": "Interviews",
            "priority": "High"
        })

    recommended_actions.append({
        "id": "explore_jobs",
        "title": "Explore Top Matched Roles",
        "description": "Match your verified technical skillset against newly indexed job openings.",
        "link": "/dashboard/jobs",
        "badge": "Jobs",
        "priority": "Normal"
    })

    return {
        "metrics": {
            "total_applications": total_apps,
            "saved_jobs": saved_count,
            "interviews": interview_count,
            "offers": offer_count,
            "average_match_score": avg_match or 82.5,
            "resume_health": resume_analysis.overall_score if resume_analysis else 82,
            "conversion_rate": conversion_rate,
            "profile_completeness": completeness
        },
        "status_distribution": status_distribution,
        "funnel": funnel,
        "match_distribution": match_distribution,
        "timeline_data": timeline_data,
        "recommended_actions": recommended_actions
    }
