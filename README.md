# CareerMatch AI — AI-Powered Resume & Job Matching Platform

> **"Know Your Fit Before You Apply."**  
> A production-quality, feature-rich full-stack platform that helps students, fresh graduates, and job seekers understand how well their profile matches a job, identify missing skills, improve their resume, and manage their entire job search lifecycle.

---

## 🌟 The Core Problem

Candidates often submit hundreds of generic resumes into Applicant Tracking Systems (ATS) without knowing how well their profile matches the role or which skills they are missing.

**CareerMatch AI solves this with transparent, explainable matching**:
- Decomposes job fit into component-level metrics: **Skills Alignment**, **Experience Fit**, **Project Relevance**, **Education**, and **Semantic Cosine Similarity**.
- Categorizes missing skills with strict safety: labels unevidenced skills as *"No evidence found in your current profile"* rather than making subjective assumptions.
- Generates structured learning paths with concrete, practical project recommendations.
- Provides a Kanban application tracker, AI interview simulator, and tailored cover letter/email drafters.

---

## 🚀 Live Demo Accounts

The database comes pre-seeded with rich, realistic demo profiles and tech jobs:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Demo Candidate** | `alex@careermatch.ai` | `password123` | Complete candidate dashboard, verified resume, 13 skills, 6 applications in Kanban, interview prep, skill gaps |
| **Demo Admin** | `admin@careermatch.ai` | `admin123` | Admin operations portal, user governance, catalog jobs, skill taxonomy, audit trail, AI token usage |

*(One-click demo login buttons are provided on the login page for effortless portfolio evaluation).*

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS (v4) with modern SaaS palette & Inter typography
- **State & Server Cache**: TanStack React Query & Context API
- **Visualizations**: Recharts (Funnel, Match Distributions, Pipeline Trend, Pie status)
- **Icons**: Lucide React
- **Routing**: React Router DOM (with `ProtectedRoute` & `AdminRoute`)

### Backend
- **Framework**: Python 3.13 + FastAPI (Asynchronous REST API)
- **Validation**: Pydantic v2 & Pydantic Settings
- **ORM & Database**: SQLAlchemy 2.0 (PostgreSQL in Docker / SQLite zero-setup local fallback)
- **Security**: Bcrypt password hashing & JWT Access / Refresh token rotation
- **Document Processing**: PyMuPDF (`fitz`) for PDF and `python-docx` for DOCX

### AI & NLP Architecture
- **Abstraction Layer**: `BaseAIProvider` polymorphic interface.
- **Providers Supported**:
  - `MockAIProvider` (Default): Built-in NLP heuristic & skill extraction engine. Zero external API keys needed.
  - `GeminiAIProvider`: Google Gemini generative integration.
  - `OpenAIProvider`: OpenAI GPT generative integration.
- **Safety Guardrails**: Strict enforcement against skill hallucination and false qualification claims.

---

## 📂 Monorepo Application Structure

```
career-match-ai/
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API client with auto-refresh token handling
│   │   ├── components/      # Common UI (Button, Modal, Badge, StatCard, ProgressBar)
│   │   ├── context/         # AuthContext (session, login, register, demo switchers)
│   │   ├── layouts/         # DashboardLayout, Sidebar, Navbar
│   │   ├── pages/           # 15+ production pages (Dashboard, Matching, Kanban, etc.)
│   │   ├── routes/          # Protected and Admin routes
│   │   └── types/           # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── ai/              # AI providers (Base, Mock, Gemini, OpenAI, Service)
│   │   ├── api/             # 12 REST API routers (auth, profile, resumes, jobs, matches, etc.)
│   │   ├── core/            # Config, Database, Security
│   │   ├── models/          # SQLAlchemy entity models
│   │   ├── parsers/         # PyMuPDF and DOCX resume extraction
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── security/        # Security headers middleware & audit logging
│   │   ├── main.py          # FastAPI application entrypoint
│   │   └── seed_data.py     # Database seeder with realistic test data
│   ├── tests/               # Pytest automated test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── docs/                    # Architecture, API, Database, and Security specs
├── docker-compose.yml       # Production multi-container orchestration
├── .env.example             # Environment variable template
└── README.md
```

---

## ⚡ Quickstart & Running Locally

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Start Backend API Server
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

# Run migrations & seed demo database
python -m app.seed_data

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend SPA
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🐳 Docker Deployment

To launch the complete containerized stack (PostgreSQL + Redis + FastAPI Backend + Nginx Frontend):

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/api/docs`

---

## 🧪 Automated Testing

Run the comprehensive pytest suite covering authentication, authorization, profile management, resume parsing, job matching, and Kanban flows:

```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

All 8 test suites validate the platform's core workflows:
- `test_health_check`
- `test_login_candidate_success`
- `test_login_invalid_password`
- `test_get_jobs`
- `test_job_description_analyzer`
- `test_candidate_profile_and_match`
- `test_application_kanban_flow`
- `test_admin_authorization`

---

## 🔒 Security & Privacy Features

- **Zero Plaintext Passwords**: Bcrypt salted hashing with 12 computational rounds.
- **Strict RBAC**: Candidate, Admin, and extensible Recruiter authorization guards.
- **MIME & File Magic Validation**: Protects against malicious payload uploads.
- **Persistent Audit Trail**: Records security-critical user actions without logging credentials.
- **GDPR-Style Privacy Rights**: 1-click full JSON profile export and permanent account deletion.

---

## 📄 License
This project is licensed under the MIT License.
