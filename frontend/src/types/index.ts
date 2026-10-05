export type Role = 'candidate' | 'admin' | 'recruiter';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  is_verified: boolean;
  career_level: string;
  target_role: string;
  location: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  target_role?: string;
  experience_level?: string;
  preferred_location?: string;
  remote_preference: string;
  expected_salary?: string;
  completeness_score: number;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_experience: number;
}

export interface Education {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  is_current?: boolean;
}

export interface Experience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  technologies: string[];
  is_current?: boolean;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuing_org: string;
  issue_date?: string;
  expiration_date?: string;
  credential_url?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_primary: boolean;
  version: number;
  parsed_text?: string;
  parsed_sections?: any;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  projects_score: number;
  keywords_score: number;
  achievement_score: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

export interface ResumeCorrectionItem {
  section: string;
  original: string;
  corrected: string;
  issue_identified: string;
  clarification_applied: string;
  category: string;
}

export interface ResumeCorrectionsResult {
  original_score: number;
  corrected_score: number;
  score_delta: number;
  corrections_count: number;
  corrections: ResumeCorrectionItem[];
  original_text: string;
  corrected_text: string;
  template_info: {
    font_family: string;
    standard_body_pt: number;
    standard_header_pt: number;
    standard_title_pt: number;
    layout: string;
  };
}

export interface ResumeMatchedJob {
  job_id: string;
  title: string;
  company: string;
  location: string;
  work_type: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  job_url: string;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  match_score: number;
  domain: string;
  is_fresher_friendly: boolean;
  domain_match: boolean;
}

export interface ResumeMatchedJobsResponse {
  resume_id: string;
  candidate_name: string;
  detected_domain: string;
  detected_experience_tier: string;
  experience_reason: string;
  is_fresher: boolean;
  total_matched_jobs: number;
  jobs: ResumeMatchedJob[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  work_type: 'Remote' | 'Hybrid' | 'On-site';
  employment_type: 'Full-time' | 'Contract' | 'Internship' | 'Part-time';
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  education_requirement?: string;
  experience_requirement?: string;
  job_url?: string;
  deadline?: string;
  is_active: boolean;
  posted_date: string;
  created_at: string;
}

export interface SkillEvidence {
  skill: string;
  status: 'matched' | 'partial' | 'no_evidence';
  evidence?: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface MatchExplanation {
  component: string;
  score: number;
  summary: string;
  details: string[];
}

export interface LearningPathRecommendation {
  missing_skill: string;
  category: string;
  priority: string;
  steps: string[];
  recommended_project?: string;
  disclaimer: string;
}

export interface MatchResponse {
  id: string;
  job_id?: string;
  job_title: string;
  company: string;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  projects_score: number;
  education_score: number;
  certification_score: number;
  matched_skills: SkillEvidence[];
  partial_skills: SkillEvidence[];
  missing_skills: SkillEvidence[];
  explanations: MatchExplanation[];
  recommendations: LearningPathRecommendation[];
  semantic_similarity?: number;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id?: string;
  job_title: string;
  company: string;
  status: 'Saved' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  application_date?: string;
  follow_up_date?: string;
  interview_date?: string;
  contact_person?: string;
  job_url?: string;
  notes?: string;
  match_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  application_id?: string;
  company: string;
  position: string;
  interview_date: string;
  interview_type: 'HR' | 'Technical' | 'Coding' | 'Managerial' | 'Final';
  interviewer?: string;
  notes?: string;
  checklist: string[];
  outcome: 'scheduled' | 'passed' | 'failed' | 'cancelled';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_jobs: number;
  total_resumes: number;
  total_matches: number;
  total_applications: number;
  total_ai_requests: number;
  total_ai_tokens: number;
  total_audit_events: number;
  recent_activity: any[];
}
