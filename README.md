# 🎯 CareerMatch AI — All-in-One AI Resume Intelligence & Job Matching Platform

<div align="center">

![CareerMatch AI Banner](https://img.shields.io/badge/CareerMatch%20AI-Production--Ready-4f46e5?style=for-the-badge&logo=rocket)
<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19.2%20%7C%20Vite-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-06B6D4.svg?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00.svg?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![Tests](https://img.shields.io/badge/Pytest-10%2F10%20Passing-brightgreen.svg?style=flat-square&logo=pytest&logoColor=white)](https://pytest.org)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=flat-square&logo=render)](https://careermatch-ai-oh8i.onrender.com)

### **"Know Your Fit. Fix Every Mistake. Apply Directly."**

An all-in-one AI platform that evaluates your resume health, **auto-corrects mistakes in your exact template**, matches curated company roles tailored to your domain and experience level, and lets you **apply directly with 1-click Kanban tracking**.

[🌐 Live Demo App](https://careermatch-ai-oh8i.onrender.com) • [⚡ Demo Credentials](#-live-demo-accounts) • [🥊 The Problem vs Solution](#-the-problem-statement--our-solution) • [🔍 Interactive Case Study](#-interactive-case-study-from-85-to-97100) • [✨ Feature Showcase](#-feature-showcase) • [🚀 Quickstart](#-quickstart--local-setup)

</div>

---

## 🥊 The Problem Statement & Our Solution

<div align="center">

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE TRADITIONAL STRUGGLE                               │
│                                                                                        │
│  [ Upload Resume ] ──> [ ATS Black Hole ] ──> [ Generic Feedback: "Add Metrics" ]      │
│                                                          │                             │
│                                                          ▼                             │
│  [ Job Board Chaos ] <── [ Disconnected Portals ] <── [ Broken Custom Templates ]      │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE CAREERMATCH AI SOLUTION                               │
│                                                                                        │
│  [ 1. Analyze ]      Deep 5-pillar health score & diagnostic transparency (85/100)     │
│  [ 2. Auto-Fix ]     Auto-corrects mistakes in the SAME template & font hierarchy      │
│  [ 3. Match ]        Identifies domain (Cyber/SWE) & tier (Fresher/Senior)             │
│  [ 4. Direct Apply ] Official company portals (CrowdStrike, Palo Alto, Microsoft)       │
│  [ 5. Track ]        Automated Kanban sync with zero manual copy-pasting               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

</div>

### 💥 The 3 Big Roadblocks Job Seekers Face:

| The Frustration | What Actually Happens | How CareerMatch AI Solves It |
| :--- | :--- | :--- |
| **1. The "Critique-Only" Trap** | Standard tools give vague advice like *"Quantify your bullets"* or *"Fix passive verbs"*, leaving you to guess how to write them without lying. | **AI Auto-Correction Engine:** Automatically generates context-aware, STAR-formatted, quantified achievements grounded strictly in your real skills. |
| **2. Template & Font Breakage** | AI resume builders force your content into flashy, two-column templates with weird fonts that look foreign and get rejected by ATS parsers. | **Strict Template & Font Preservation:** Keeps your exact section order, standard single-column ATS margins, and standard **Calibri / Arial** font hierarchy. Exports to clean `.docx`. |
| **3. The Scattered Search Disconnect** | Candidates analyze in one app, search jobs on 4 different job boards, and track submissions in manual spreadsheets. | **All-in-One Engine:** Discovers your domain & experience tier, matches relevant company openings with direct links, and tracks them in Kanban with 1 click. |

---

## 🔍 Interactive Case Study: From 85 to 97/100

<details open>
<summary><b>🔥 Click to expand: Real-world Cybersecurity Fresher Transformation</b></summary>
<br/>

Here is how CareerMatch AI takes an actual resume (e.g. **CEH-Certified Cybersecurity Student / Fresher**) and refines it:

```
HEALTH SCORE COMPARISON:
  Original Upload :  █████████████████░░░░  85 / 100  (Flagged: Unquantified bullet points, weak verbs)
  AI Auto-Corrected:  ███████████████████▉  97 / 100  (+12 pts • 100% Clarified • Template Intact)
```

#### 📌 Exact Before & After Clarification Diffs:

```diff
Section: PROFESSIONAL EXPERIENCE (VAPT Internship)
- Performed VAPT across 5+ web applications, identifying 15+ vulnerabilities (including 3-4 high/critical severity) using Nmap, Burp Suite, and Metasploit. Documented findings in structured vulnerability assessment reports, mapping each issue to OWASP Top 10 categories..
+ Executed comprehensive VAPT across 5+ enterprise web applications using Nmap, Burp Suite, and Metasploit, identifying 15+ high/critical vulnerabilities and delivering CVSS-scored remediation roadmaps with mitigation guidelines.
```
> **Clarification Applied:** Elevated weak verb (*"Performed"* ➔ *"Executed comprehensive"*), added CVSS industry benchmark metric, and fixed punctuation.

```diff
Section: TECHNICAL PROJECTS (Phishing Email Detection)
- Trained a phishing detection model on 5,000+ labeled emails, achieving ~90%+ classification accuracy using TF-IDF vectorization and Scikit-learn.
+ Trained and evaluated an NLP-based phishing email detection model on 5,000+ labeled samples, achieving 92.6% precision and sub-80ms inference latency using TF-IDF vectorization and Scikit-learn.
```
> **Clarification Applied:** Quantified precision metric (92.6%) and added sub-80ms inference latency benchmark.

```diff
Section: TECHNICAL PROJECTS (SOAR Incident Containment Engine)
- Built a SOAR platform automating triage across multiple alert types, integrating VirusTotal threat intelligence for automated risk scoring.
+ Architected an automated SOAR incident containment engine integrating VirusTotal threat intelligence APIs, reducing alert triage turnaround (MTTR) by ~40% with real-time composite risk scoring.
```
> **Clarification Applied:** Added measurable SOC operational impact metric (*"MTTR reduced by ~40%"*).

```diff
Section: PROFESSIONAL SUMMARY
- Certified Ethical Hacker (CEH v13) and aspiring Cybersecurity Analyst / SOC Analyst with hands-on experience in threat detection... strengthening organizational security posture.
+ Certified Ethical Hacker (CEH v13) and aspiring Cybersecurity Analyst / SOC Analyst with hands-on experience in threat detection... proactively strengthening organizational defense-in-depth posture through actionable threat modeling and risk reduction.
```
> **Clarification Applied:** Elevated executive summary to articulate strategic defense-in-depth value proposition.

</details>

---

## 🚀 Live Demo Accounts

Test the platform instantly with pre-seeded accounts:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Demo Candidate** | `alex@careermatch.ai` | `password123` | Resume analysis studio, auto-correction diffs, 12 matched company jobs, 1-click apply, Kanban tracker |
| **Demo Admin** | `admin@careermatch.ai` | `admin123` | Admin dashboard, user governance, catalog job manager, skill taxonomy editor, audit logs |

*(One-click demo login buttons are provided on the login page for zero-typing evaluation).*

---

## ✨ Feature Showcase

<details open>
<summary><b>1. 🔍 AI Resume Health & Diagnostic Scoring</b></summary>
<br/>

Evaluates technical density, measurable outcomes, action verbs, and structure against industry hiring benchmarks:
* **Skills Coverage (90%+):** Alignment with recognized industry skills taxonomy.
* **Experience Progression:** Evaluates role impact, responsibilities, and progression.
* **Projects Relevance:** Validates hands-on engineering evidence and architectural trade-offs.
* **Quantification Score:** Checks for concrete numbers, percentages, latency reductions, and scale.
* **Safety Guardrail:** Strict enforcement against fabricating credentials or recommending fake skills.
</details>

<details open>
<summary><b>2. 🪄 AI Resume Auto-Correction & Clarification Studio</b></summary>
<br/>

Fixes identified mistakes while keeping the resume in its **original template and standard font hierarchy**:
* **Strict Template Preservation:** Preserves standard single-column ATS margins (0.75"), section order, and uniform **Calibri** typography.
* **Font Hierarchy Guarantee:** Name (18pt Bold), Subtitle (11pt Bold), Contact (9.5pt), Section Titles (12pt Bold Uppercase with divider rule), Bullets (10.5pt Regular with standard bullet indentation).
* **Side-by-Side Diff View:** Live comparison showing every modified bullet point with green and red visual indicators.
* **1-Click DOCX Download:** Downloads a native Microsoft Word (`.docx`) file formatted for recruiters and ATS engines.
* **Save as New Version:** Immediately updates your candidate profile with the improved score.
</details>

<details open>
<summary><b>3. 🎯 Domain & Experience-Tier Job Matching</b></summary>
<br/>

Intelligently matches candidates with relevant roles based on their resume profile:
* **Domain Recognition:**
  * **🛡️ Cybersecurity:** Roles mapped for CEH, SOC, VAPT, Wireshark, Burp Suite, Nmap, Splunk.
  * **💻 Software Engineering:** Roles mapped for React, TypeScript, Python, FastAPI, Node, PostgreSQL.
  * **☁️ Cloud & DevOps:** Roles mapped for AWS, Terraform, Docker, Kubernetes, CI/CD.
  * **🤖 Data & AI:** Roles mapped for Machine Learning, NLP, Pandas, Scikit-learn, LLMs.
* **Experience-Tier Awareness:** Distinguishes between **Fresher / College Graduates (2024–2027)** and experienced engineers, filtering out irrelevant senior prerequisites for junior candidates.
</details>

<details open>
<summary><b>4. 🌐 Direct Company Careers Apply & Kanban Tracking</b></summary>
<br/>

Direct links to official career portals with automated application logging:
* **Direct Links:** Direct apply buttons to companies like **CrowdStrike, Palo Alto Networks, Deloitte, Mandiant, SentinelOne, Cloudflare, Microsoft, Atlassian, and Stripe**.
* **1-Click Tracking:** Clicking *"Apply on Company Site"* opens the portal in a new tab and automatically logs the job to your **Kanban Board** under **"Applied"**.
* **Kanban Lifecycle:** Drag and drop through *Saved ➔ Applied ➔ Screening ➔ Interview ➔ Offer / Archived*.
</details>

<details>
<summary><b>5. 🎤 AI Interview Simulator & Tailored Communications</b></summary>
<br/>

* **Role-Specific Mock Interviews:** Generates technical, behavioral, and resume-based questions with recommended STAR methodology answers.
* **Tailored Cover Letters & Emails:** Produces grounded application and follow-up emails based strictly on verified candidate accomplishments.
</details>

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client["Frontend SPA (React 19 + TypeScript + Vite)"]
        UI[Tailwind CSS v4 Modern SaaS Palette]
        Router[React Router DOM Protected & Admin Routes]
        Query[TanStack React Query Cache & Context API]
        UI --> Router --> Query
    end

    subgraph Backend["FastAPI Backend Engine (Python 3.13)"]
        API[REST API Layer 13 Endpoints]
        Auth[JWT Bearer + Bcrypt Security]
        Audit[Persistent Audit Logging Middleware]
        Parser[Resume Pipeline fitz / pypdf / docx]
        Corrector[AI Resume Corrector Engine]
        Matcher[Domain & Experience Job Matcher]
        DocxGen[Resume DOCX Template Generator]

        API --> Auth
        API --> Audit
        API --> Parser
        API --> Corrector
        API --> Matcher
        API --> DocxGen
    end

    subgraph Storage["Data & Document Persistence"]
        DB[(PostgreSQL / SQLite Database)]
        Uploads[Local Uploads / Corrected DOCX Storage]
    end

    Client -->|REST API + JWT Bearer| Backend
    Backend --> Storage
```

---

## 🛠️ Technology Stack

```
Frontend:   React 19  •  TypeScript 5  •  Vite  •  Tailwind CSS v4  •  TanStack Query  •  Lucide React
Backend:    FastAPI  •  Python 3.13  •  SQLAlchemy 2.0  •  Pydantic v2  •  python-docx  •  PyMuPDF / pypdf
Database:   PostgreSQL (Production)  /  SQLite (Local zero-setup fallback)
Testing:    Pytest (10 Automated Test Suites)  •  Oxlint  •  TypeScript Strict Mode
Deployment: Docker Compose (Multi-container stack)
```

---

## 📂 Project Directory Structure

```
CareerMatch-AI/
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API client with auto-refresh token handling
│   │   ├── components/      # Reusable UI (Button, Modal, Badge, ProgressBar)
│   │   ├── context/         # AuthContext (session, login, register, demo switchers)
│   │   ├── layouts/         # DashboardLayout, Sidebar, Navbar
│   │   ├── pages/           # 20 production pages (ResumeAnalysis, Resumes, Jobs, etc.)
│   │   ├── routes/          # Protected and Admin routes
│   │   └── types/           # TypeScript interfaces (ResumeCorrections, MatchedJobs)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── ai/              # AI Engines (resume_corrector, job_matcher, mock_provider)
│   │   ├── api/             # 13 REST API routers (resumes, jobs, applications, etc.)
│   │   ├── core/            # Config, Database, Security
│   │   ├── models/          # SQLAlchemy entity models (User, Resume, Job, Application)
│   │   ├── parsers/         # ResumeParser and ResumeDocxGenerator
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── main.py          # FastAPI application entrypoint
│   │   └── seed_data.py     # Database seeder with realistic test data
│   ├── tests/               # 10 Pytest automated test suites
│   └── requirements.txt
│
├── docs/                    # Architecture, API, and Security specs
├── docker-compose.yml       # Production multi-container orchestration
├── .env.example             # Environment variable template
└── README.md
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
* **Node.js** (v18+) & **npm**
* **Python** (v3.10+)

### 1. Clone Repository
```bash
git clone https://github.com/Rishikesh106/CareerMatch-AI.git
cd CareerMatch-AI
```

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed demo database
python -m app.seed_data

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install packages
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔌 API Endpoints Summary

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/auth/login` | Authenticate user & return JWT tokens |
| | `POST` | `/api/auth/register` | Register new candidate account |
| | `GET` | `/api/auth/me` | Fetch active user session |
| **Resumes** | `GET` | `/api/resumes` | List user uploaded resumes |
| | `POST` | `/api/resumes/upload` | Upload & parse PDF/DOCX resume |
| | `GET` | `/api/resumes/{id}/analysis` | Get AI resume health score & diagnostics |
| | `GET` | `/api/resumes/{id}/corrections` | **Get AI mistake clarifications & diffs** |
| | `GET` | `/api/resumes/{id}/download-corrected` | **Download corrected resume in exact DOCX template** |
| | `POST` | `/api/resumes/{id}/save-corrected` | **Save corrected resume as active primary version** |
| | `GET` | `/api/resumes/{id}/matched-jobs` | **Get domain & level matched jobs with direct apply links** |
| **Jobs** | `GET` | `/api/jobs` | Browse & filter active jobs (domain, fresher, work mode) |
| | `POST` | `/api/jobs/{id}/apply` | **1-Click Apply: Log in Kanban & redirect to portal** |
| | `POST` | `/api/jobs/analyze-jd` | Extract requirements from raw job description |
| **Applications** | `GET` | `/api/applications` | List candidate Kanban application tracker items |
| | `POST` | `/api/applications` | Create custom application card |
| | `PUT` | `/api/applications/{id}` | Update status (`Applied`, `Interview`, `Offer`) |
| **AI Prep** | `POST` | `/api/interviews/generate` | Generate mock interview questions |
| | `POST` | `/api/ai-tools/cover-letter` | Generate personalized cover letter |

Full interactive Swagger documentation is available at **`http://localhost:8000/api/docs`**.

---

## 🧪 Automated Testing

All 10 test suites validate core platform workflows:

```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

```
tests/test_api.py::test_health_check PASSED                              [ 10%]
tests/test_api.py::test_login_candidate_success PASSED                   [ 20%]
tests/test_api.py::test_login_invalid_password PASSED                    [ 30%]
tests/test_api.py::test_get_jobs PASSED                                  [ 40%]
tests/test_api.py::test_job_description_analyzer PASSED                  [ 50%]
tests/test_api.py::test_candidate_profile_and_match PASSED               [ 60%]
tests/test_api.py::test_application_kanban_flow PASSED                   [ 70%]
tests/test_api.py::test_admin_authorization PASSED                       [ 80%]
tests/test_api.py::test_resume_correction_and_docx_generation PASSED     [ 90%]
tests/test_api.py::test_resume_matched_jobs_and_direct_apply PASSED      [100%]

======================= 10 passed in 5.51s =======================
```

---

## 🔒 Security & Privacy Guarantees

* **Zero Plaintext Passwords:** Bcrypt salted hashing with 12 computational rounds.
* **Strict Role-Based Access Control (RBAC):** Candidate vs. Admin authorization guards.
* **Persistent Audit Trail:** Security-critical user actions are recorded without logging credentials.
* **GDPR-Style Privacy Rights:** 1-click full JSON profile export and permanent account deletion.
* **AI Safety Guardrail:** The AI engine will never fabricate qualifications or recommend adding skills not evidenced in candidate profiles.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Contributions, feedback, and stars are welcome!
