import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
from app.models.entities import AuditLog
from app.core.database import SessionLocal

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"
        return response

def log_audit_event(action: str, user_id: str = None, entity_type: str = None, entity_id: str = None, request: Request = None, details: dict = None):
    try:
        db = SessionLocal()
        ip = request.client.host if request and request.client else "127.0.0.1"
        ua = request.headers.get("user-agent", "") if request else ""
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip,
            user_agent=ua[:200],
            details=details or {}
        )
        db.add(log)
        db.commit()
        db.close()
    except Exception:
        pass
