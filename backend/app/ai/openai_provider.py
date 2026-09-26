import json
import httpx
from typing import Dict, Any, List, Optional
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider
from app.core.config import settings

class OpenAIProvider(BaseAIProvider):
    """
    OpenAI API provider integration.
    Falls back gracefully to MockAIProvider if no key is configured or on transient failure.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.fallback = MockAIProvider()
        self.base_url = "https://api.openai.com/v1/chat/completions"

    def _call_openai(self, prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are an expert career and resume intelligence AI. Output strict valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(self.base_url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
        except Exception:
            pass
        return None

    def analyze_resume(self, text: str, profile_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        prompt = f"Analyze this resume and return JSON with overall_score, skills_score, experience_score, projects_score, keywords_score, achievement_score, suggestions, strengths, weaknesses.\nRESUME:\n{text[:4000]}"
        raw = self._call_openai(prompt)
        if raw:
            try:
                data = json.loads(raw)
                if "overall_score" in data:
                    return data
            except Exception:
                pass
        return self.fallback.analyze_resume(text, profile_data)

    def analyze_job_description(self, jd_text: str) -> Dict[str, Any]:
        prompt = f"Analyze this job description and return JSON with title, company, required_skills, preferred_skills, experience_requirement, education_requirement, responsibilities, keywords.\nJD:\n{jd_text[:4000]}"
        raw = self._call_openai(prompt)
        if raw:
            try:
                data = json.loads(raw)
                if "title" in data:
                    return data
            except Exception:
                pass
        return self.fallback.analyze_job_description(jd_text)

    def match_resume_to_job(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        return self.fallback.match_resume_to_job(candidate_data, job_data)

    def generate_cover_letter(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], tone: str = "Professional") -> Dict[str, Any]:
        prompt = f"Write a cover letter for {candidate_data.get('full_name')} for {job_data.get('title')} at {job_data.get('company')}. Return JSON with 'subject' and 'content'. Do not invent candidate qualifications."
        raw = self._call_openai(prompt)
        if raw:
            try:
                data = json.loads(raw)
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
