from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_jobs: int
    total_resumes: int
    total_matches: int
    total_applications: int
    total_ai_requests: int
    total_ai_tokens: int
    total_audit_events: int
    recent_activity: List[Dict[str, Any]] = []

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class AIUsageResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    provider: str
    endpoint: str
    total_tokens: int
    estimated_cost: float
    latency_ms: int
    created_at: datetime

    class Config:
        from_attributes = True

class SkillItemCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillItemResponse(SkillItemCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
