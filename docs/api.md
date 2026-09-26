# CareerMatch AI — REST API Documentation

Base URL: `/api` (or `http://localhost:8000/api`)
OpenAPI UI: `http://localhost:8000/api/docs`

## Error Response Standard

All endpoints return a uniform error structure in case of validation or business logic errors:

```json
{
  "success": false,
  "error": {
    "code": "HTTP_400",
    "message": "Descriptive human-readable error message.",
    "details": []
  }
}
```

## Authentication Endpoints

### `POST /api/auth/register`
Create a new candidate account.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "full_name": "Jordan Rivera",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "career_level": "Entry-level",
    "target_role": "Full Stack Developer",
    "location": "San Francisco, CA"
  }
  ```
- **Response**: `201 Created` with JWT access and refresh tokens.

### `POST /api/auth/login`
Authenticate existing user.
- **Request Body**: `{"email": "alex@careermatch.ai", "password": "password123"}`
- **Response**: `200 OK` with user details and tokens.

### `POST /api/auth/refresh`
Refresh expired access token using valid refresh token.

### `GET /api/auth/me`
Retrieve currently authenticated user's profile and role.

---

## Candidate Profile Endpoints

- `GET /api/profile`: Retrieve comprehensive profile (user, profile info, skills, education, experience, projects, certifications).
- `PUT /api/profile`: Update personal and career preference attributes.
- `POST /api/profile/skills`: Add skill with category, proficiency, and years of experience.
- `DELETE /api/profile/skills/{id}`: Remove skill.
- `POST /api/profile/experience`: Add work experience entry.
- `DELETE /api/profile/experience/{id}`: Remove experience entry.
- `POST /api/profile/education`: Add education degree.
- `DELETE /api/profile/education/{id}`: Remove education.
- `POST /api/profile/projects`: Add technical project.
- `DELETE /api/profile/projects/{id}`: Remove project.
- `POST /api/profile/certifications`: Add certification credential.
- `DELETE /api/profile/certifications/{id}`: Remove certification.
- `GET /api/profile/export-data`: Export complete candidate history as structured JSON.
- `DELETE /api/profile/account`: Permanently delete account and all records.

---

## Resume Management Endpoints

- `GET /api/resumes`: List all uploaded resumes for the user.
- `POST /api/resumes/upload`: Multi-part form upload for PDF/DOCX (validates MIME, size, extension). Parses sections and creates AI analysis.
- `GET /api/resumes/{id}`: Retrieve parsed resume text and section metadata.
- `PUT /api/resumes/{id}/primary`: Set this resume as the active master resume.
- `GET /api/resumes/{id}/download`: Download raw resume file.
- `DELETE /api/resumes/{id}`: Remove resume and delete file from storage.
- `GET /api/resumes/{id}/analysis`: Retrieve AI resume quality scores (overall, skills, experience, projects, keywords, quantification) and suggestions.

---

## Job Management & Analyzer Endpoints

- `GET /api/jobs`: Search and filter jobs with query parameters (`q`, `location`, `work_type`, `employment_type`, `experience_level`, `skill`, `limit`, `offset`).
- `GET /api/jobs/{id}`: Get full job description and requirements.
- `POST /api/jobs`: Create job opening (Admin only).
- `PUT /api/jobs/{id}`: Update job (Admin only).
- `DELETE /api/jobs/{id}`: Remove job (Admin only).
- `POST /api/jobs/analyze-jd`: Extract title, required skills, preferred skills, prerequisites, and responsibilities from raw pasted job description text.

---

## AI Matching & Skill Gaps Endpoints

- `POST /api/matches`: Compute explainable match analysis between candidate profile and a target job. Returns component scores (skills, experience, projects, education, semantic similarity), matched vs partial vs missing skills, and learning paths.
- `GET /api/matches`: List past match analyses for comparison.
- `GET /api/matches/{id}`: Retrieve detailed breakdown of a previous match.
- `GET /api/matches/skill-gaps/summary`: Holistic aggregated skill gaps across target jobs categorized by domain with step-by-step project recommendations.

---

## Application Tracker Endpoints

- `GET /api/applications`: Get all applications (optional filter by `status`).
- `POST /api/applications`: Create a new application entry.
- `PUT /api/applications/{id}`: Update application status (Kanban column transition), interview date, follow-up, or notes.
- `DELETE /api/applications/{id}`: Delete application entry.

---

## Interviews & AI Prep Endpoints

- `GET /api/interviews`: List scheduled interview milestones.
- `POST /api/interviews`: Schedule interview with date, round type, interviewer, and checklist.
- `PUT /api/interviews/{id}`: Update interview details.
- `DELETE /api/interviews/{id}`: Delete interview milestone.
- `GET /api/interviews/prep/generate`: Generate customized Technical, Behavioral, Role-specific, and Resume-based practice questions with model frameworks and talking points.

---

## AI Career Tools Endpoints

- `POST /api/ai-tools/cover-letter`: Generate tailored, truthful cover letter based on resume and job requirements.
- `POST /api/ai-tools/email`: Draft application, follow-up, or thank you emails.

---

## Analytics & Notifications Endpoints

- `GET /api/analytics/dashboard-summary`: Summary metrics, application funnel stages, match distribution, and timeline velocity.
- `GET /api/notifications`: Get notification list.
- `PUT /api/notifications/{id}/read`: Mark notification as read.
- `PUT /api/notifications/mark-all-read`: Mark all notifications as read.

---

## Admin Portal Endpoints

- `GET /api/admin/stats`: Platform-wide totals (users, jobs, resumes, matches, AI tokens, audit events).
- `GET /api/admin/users`: List all platform users with active status.
- `PUT /api/admin/users/{id}/toggle-status`: Enable or disable user account.
- `GET /api/admin/audit-logs`: View security audit log stream.
- `GET /api/admin/ai-usage`: Monitor AI execution token consumption, latency, and costs.
- `GET /api/admin/skills`: Global skill catalog.
- `POST /api/admin/skills`: Add skill to global taxonomy.
- `DELETE /api/admin/skills/{id}`: Remove skill from taxonomy.
