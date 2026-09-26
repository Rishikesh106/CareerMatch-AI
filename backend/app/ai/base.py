from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseAIProvider(ABC):
    @abstractmethod
    def analyze_resume(self, text: str, profile_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze a resume text and return structured quality scores, strengths, suggestions."""
        pass

    @abstractmethod
    def analyze_job_description(self, jd_text: str) -> Dict[str, Any]:
        """Extract structured information from raw job description text."""
        pass

    @abstractmethod
    def match_resume_to_job(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform explainable semantic and structured matching between candidate and job."""
        pass

    @abstractmethod
    def generate_cover_letter(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], tone: str = "Professional") -> Dict[str, Any]:
        """Generate a personalized cover letter based purely on verified profile evidence."""
        pass

    @abstractmethod
    def generate_application_email(self, candidate_data: Dict[str, Any], job_data: Dict[str, Any], email_type: str = "Application", contact_person: str = "Hiring Team") -> Dict[str, Any]:
        """Generate a tailored application or follow-up email."""
        pass

    @abstractmethod
    def generate_interview_prep(self, job_data: Dict[str, Any], candidate_data: Optional[Dict[str, Any]] = None, interview_type: str = "Technical") -> Dict[str, Any]:
        """Generate interview questions and preparation guidance."""
        pass

    @abstractmethod
    def get_embedding(self, text: str) -> List[float]:
        """Generate vector embedding representation of text."""
        pass

    @abstractmethod
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity score between two texts."""
        pass
