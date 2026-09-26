import json
import httpx
from typing import Dict, Any, List, Optional
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider
from app.core.config import settings

class GeminiAIProvider(BaseAIProvider):
    """
    Google Gemini API provider integration.
    Falls back gracefully to MockAIProvider if no key is configured or on transient failure.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = MockAIProvider()
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    def _call_gemini(self, prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        try:
            url = f"{self.base_url}?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json"
                }
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
        except Exception:
            pass
        return None

    def analyze_resume(self, text: str, profile_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        prompt = f"""You are an expert resume analyst. Analyze this resume text and return valid JSON with:
overall_score (0-100), skills_score (0-100), experience_score (0-100), projects_score (0-100), keywords_score (0-100), achievement_score (0-100), suggestions (list of strings), strengths (list of strings), weaknesses (list of strings).
RESUME TEXT:
{text[:4000]}
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                data = json.loads(response_text)
                if "overall_score" in data:
                    return data
            except Exception:
                pass
        return self.fallback.analyze_resume(text, profile_data)

    def analyze_job_description(self, jd_text: str) -> Dict[str, Any]:
        prompt = f"""Analyze this job description and return JSON with: title, company, required_skills (list), preferred_skills (list), experience_requirement, education_requirement, responsibilities (list), keywords (list).
JOB DESCRIPTION:
{jd_text[:4000]}
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                data = json.loads(response_text)
                if "title" in data:
                    return data
            except Exception:
                pass
        return self.fallback.analyze_job_description(jd_text)

    def match_resume_to_job(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        # Always use hybrid / mock engine to ensure absolute fidelity to guardrails and component scoring
        return self.fallback.match_resume_to_job(candidate_data, job_data)

    def generate_cover_letter(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], tone: str = "Professional") -> Dict[str, Any]:
        prompt = f"""Write a professional cover letter for {candidate_data.get('full_name')} applying for {job_data.get('title')} at {job_data.get('company')}.
Rule: Never invent experience not present in the candidate details.
Return JSON with 'subject' and 'content' fields.
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                data = json.loads(response_text)
                if "content" in data:
                    data["disclaimer"] = "Please review, personalize, and verify all AI-generated content before sending. CareerMatch AI never invents candidate qualifications."
                    return data
            except Exception:
                pass
        return self.fallback.generate_cover_letter(candidate_data, job_data, tone)

    def generate_application_email(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], email_type: str = "Application", contact_person: str = "Hiring Team") -> Dict[str, Any]:
        return self.fallback.generate_application_email(candidate_data, job_data, email_type, contact_person)

    def generate_interview_prep(self, job_data: Dict[str, Any], candidate_data: Optional[Dict[str, Any]] = None, interview_type: str = "Technical") -> Dict[str, Any]:
        return self.fallback.generate_interview_prep(job_data, candidate_data, interview_type)

    def get_embedding(self, text: str) -> List[float]:
        return self.fallback.get_embedding(text)

    def calculate_similarity(self, text1: str, text2: str) -> float:
        return self.fallback.calculate_similarity(text1, text2)
