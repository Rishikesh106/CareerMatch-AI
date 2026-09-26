import time
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.gemini_provider import GeminiAIProvider
from app.ai.openai_provider import OpenAIProvider
from app.models.entities import AIUsage

class AIService:
    def __init__(self):
        self.provider_name = settings.AI_PROVIDER.lower()
        if self.provider_name == "gemini" and settings.GEMINI_API_KEY:
            self.provider: BaseAIProvider = GeminiAIProvider()
        elif self.provider_name == "openai" and settings.OPENAI_API_KEY:
            self.provider: BaseAIProvider = OpenAIProvider()
        else:
            self.provider: BaseAIProvider = MockAIProvider()

    def track_usage(self, db: Optional[Session], endpoint: str, user_id: Optional[str] = None, prompt_len: int = 100, completion_len: int = 150, latency_ms: int = 40):
        if db is None:
            return
        try:
            prompt_tokens = max(10, prompt_len // 4)
            completion_tokens = max(10, completion_len // 4)
            total = prompt_tokens + completion_tokens
            cost = total * 0.000002
            record = AIUsage(
                user_id=user_id,
                provider=self.provider_name,
                endpoint=endpoint,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total,
                estimated_cost=cost,
                latency_ms=latency_ms
            )
            db.add(record)
            db.commit()
        except Exception:
            db.rollback()

ai_service = AIService()
