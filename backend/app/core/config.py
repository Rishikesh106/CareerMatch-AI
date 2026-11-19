import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerMatch AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careermatch_ai_super_secret_jwt_key_for_development_2026_xyz")
    REFRESH_SECRET_KEY: str = os.getenv("REFRESH_SECRET_KEY", "careermatch_ai_super_refresh_jwt_key_for_development_2026_abc")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for dev convenience
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
    ] + [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
    
    # Database (Default to sqlite for seamless zero-setup local dev, or postgresql via .env)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./career_match.db").replace("postgres://", "postgresql://", 1)
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: set = {"pdf", "docx"}
    
    # AI Providers ("mock", "gemini", "openai")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Audit & Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
