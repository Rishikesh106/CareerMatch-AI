from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class MatchRequest(BaseModel):
    job_id: Optional[str] = None
    job_title: Optional[str] = "Target Job"
    company: Optional[str] = "Target Company"
    job_description: Optional[str] = None
    resume_id: Optional[str] = None

class SkillEvidence(BaseModel):
    skill: str
    status: str  # "matched", "partial", "no_evidence"
    evidence: Optional[str] = None
    category: str = "General"
    priority: str = "Medium"  # "High", "Medium", "Low"

class MatchExplanation(BaseModel):
    component: str
    score: int
    summary: str
    details: List[str] = []

class LearningPathRecommendation(BaseModel):
    missing_skill: str
    category: str
    priority: str
    steps: List[str] = []
    recommended_project: Optional[str] = None
    disclaimer: str = "Completing recommendations strengthens your profile evidence; it does not guarantee job placement."

class MatchResponse(BaseModel):
    id: str
    job_id: Optional[str] = None
    job_title: str
    company: str
    overall_score: int
    skills_score: int
    experience_score: int
    projects_score: int
    education_score: int
    certification_score: int
    matched_skills: List[SkillEvidence] = []
    partial_skills: List[SkillEvidence] = []
    missing_skills: List[SkillEvidence] = []
    explanations: List[MatchExplanation] = []
    recommendations: List[LearningPathRecommendation] = []
    semantic_similarity: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SkillGapReport(BaseModel):
    total_skills_required: int
    matched_count: int
    partial_count: int
    missing_count: int
    top_missing_skills: List[SkillEvidence] = []
    categorized_gaps: Dict[str, List[SkillEvidence]] = {}
    learning_paths: List[LearningPathRecommendation] = []
