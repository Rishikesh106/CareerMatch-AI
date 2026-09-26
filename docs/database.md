# CareerMatch AI — Database Schema & Architecture

## Relational Model Design

CareerMatch AI uses a fully normalized relational schema built on SQLAlchemy 2.0 and compatible with PostgreSQL and SQLite.

### Tables & Relationships

```
 users (1) ──── (1) profiles
   │
   ├──── (N) resumes ──── (1) resume_analyses
   ├──── (N) user_skills
   ├──── (N) educations
   ├──── (N) experiences
   ├──── (N) projects
   ├──── (N) certifications
   ├──── (N) applications ──── (N) interviews
   ├──── (N) match_analyses
   ├──── (N) notifications
   └──── (N) audit_logs
```

### Table Definitions

1. **`users`**:
   - `id`: String / UUID (PK)
   - `email`: String (Unique, Indexed)
   - `hashed_password`: String (Bcrypt salt rounds 12)
   - `full_name`: String
   - `role`: String (`candidate`, `admin`, `recruiter`)
   - `is_active`: Boolean
   - `is_verified`: Boolean
   - `career_level`: String
   - `target_role`: String
   - `location`: String
   - `created_at`, `updated_at`: DateTime (UTC)

2. **`profiles`**:
   - `id`: String / UUID (PK)
   - `user_id`: String (FK `users.id` on delete CASCADE, Unique)
   - `headline`: String
   - `summary`: Text
   - `phone`, `location`: String
   - `linkedin_url`, `github_url`, `portfolio_url`: String
   - `remote_preference`: String (`Remote`, `Hybrid`, `On-site`)
   - `expected_salary`: String
   - `completeness_score`: Integer (0-100)

3. **`skills` & `user_skills`**:
   - `skills`: Global taxonomy with `name` (Unique, Indexed), `category`, `description`.
   - `user_skills`: User-associated skills with `user_id` (FK), `skill_name`, `category`, `proficiency` (`Beginner`, `Intermediate`, `Advanced`, `Expert`), `years_experience` (Float).

4. **`resumes` & `resume_analyses`**:
   - `resumes`: `id`, `user_id` (FK), `file_name`, `file_path`, `file_size`, `mime_type`, `is_primary`, `version`, `parsed_text`, `confidence_score`.
   - `resume_analyses`: `resume_id` (FK, Unique), `overall_score`, `skills_score`, `experience_score`, `projects_score`, `keywords_score`, `achievement_score`, `suggestions` (JSON), `strengths` (JSON), `weaknesses` (JSON).

5. **`jobs`**:
   - `id`: String / UUID (PK)
   - `title`: String (Indexed)
   - `company`: String (Indexed)
   - `location`: String
   - `work_type`: String (`Remote`, `Hybrid`, `On-site`)
   - `employment_type`: String (`Full-time`, `Contract`, `Internship`)
   - `experience_level`: String
   - `salary_min`, `salary_max`: Integer
   - `description`: Text
   - `required_skills`: JSON (List of strings)
   - `preferred_skills`: JSON (List of strings)
   - `is_active`: Boolean

6. **`match_analyses`**:
   - `id`: String / UUID (PK)
   - `user_id`: String (FK `users.id`)
   - `job_id`: String (FK `jobs.id` on delete SET NULL)
   - `overall_score`: Integer (0-100)
   - `skills_score`, `experience_score`, `projects_score`, `education_score`, `certification_score`: Integer
   - `matched_skills`, `partial_skills`, `missing_skills`: JSON
   - `explanations`: JSON
   - `recommendations`: JSON

7. **`applications` & `interviews`**:
   - `applications`: `id`, `user_id` (FK), `job_id` (FK nullable), `job_title`, `company`, `status` (`Saved`, `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`), `application_date`, `interview_date`, `notes`, `match_score`.
   - `interviews`: `id`, `user_id` (FK), `application_id` (FK nullable), `company`, `position`, `interview_date`, `interview_type`, `interviewer`, `notes`, `checklist` (JSON).

8. **`audit_logs` & `ai_usage`**:
   - `audit_logs`: `id`, `user_id`, `action`, `entity_type`, `ip_address`, `user_agent`, `details` (JSON), `created_at`.
   - `ai_usage`: `id`, `user_id`, `provider`, `endpoint`, `total_tokens`, `estimated_cost`, `latency_ms`.

## Indexing Strategy

- `users.email`: Unique index for instant authentication lookups.
- `skills.name`: Unique index for catalog lookups.
- `jobs.title`, `jobs.company`: Standard B-Tree indexes for rapid filtering.
- Foreign keys (`user_id`, `job_id`, `resume_id`) indexed for fast JOIN queries.
