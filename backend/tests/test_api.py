import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "ok"

def test_login_candidate_success():
    response = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == "alex@careermatch.ai"
    assert "access_token" in data["tokens"]
    assert "refresh_token" in data["tokens"]

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert "error" in data

def test_get_jobs():
    response = client.get("/api/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert isinstance(jobs, list)
    assert len(jobs) >= 5
    first_job = jobs[0]
    assert "title" in first_job
    assert "company" in first_job
    assert "required_skills" in first_job

def test_job_description_analyzer():
    sample_jd = """
    We are looking for a Senior Python Developer with 3+ years of experience in FastAPI, PostgreSQL, Docker, and AWS.
    Responsibilities include building REST APIs, managing database migrations, and collaborating with cross-functional teams.
    """
    response = client.post("/api/jobs/analyze-jd", json={"description": sample_jd})
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "required_skills" in data
    assert any("Python" in s for s in data["required_skills"])

def test_candidate_profile_and_match():
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "password123"
    })
    token = login_res.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Profile
    profile_res = client.get("/api/profile", headers=headers)
    assert profile_res.status_code == 200
    prof_data = profile_res.json()
    assert prof_data["user"]["full_name"] == "Alex Johnson"
    assert len(prof_data["skills"]) >= 5

    # 3. Get Resumes
    resumes_res = client.get("/api/resumes", headers=headers)
    assert resumes_res.status_code == 200
    resumes = resumes_res.json()
    assert len(resumes) >= 1
    resume_id = resumes[0]["id"]

    # 4. Trigger Match against a job
    jobs = client.get("/api/jobs").json()
    target_job = jobs[0]

    match_res = client.post("/api/matches", headers=headers, json={
        "job_id": target_job["id"],
        "resume_id": resume_id
    })
    assert match_res.status_code == 200
    match_data = match_res.json()
    assert "overall_score" in match_data
    assert match_data["overall_score"] >= 40
    assert len(match_data["matched_skills"]) > 0
    assert len(match_data["explanations"]) >= 4

    # 5. Check Skill Gap report
    gap_res = client.get("/api/matches/skill-gaps/summary", headers=headers)
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "matched_count" in gap_data
    assert "missing_count" in gap_data

def test_application_kanban_flow():
    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "password123"
    })
    token = login_res.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get apps
    apps_res = client.get("/api/applications", headers=headers)
    assert apps_res.status_code == 200
    apps = apps_res.json()
    assert len(apps) >= 4

    # Create new application
    new_app_res = client.post("/api/applications", headers=headers, json={
        "job_title": "AI Systems Engineer",
        "company": "DeepOrbit Labs",
        "status": "Saved",
        "notes": "Exciting LLM infrastructure role",
        "match_score": 87
    })
    assert new_app_res.status_code == 201
    created = new_app_res.json()
    assert created["job_title"] == "AI Systems Engineer"

    # Update status to Applied (drag and drop simulation)
    update_res = client.put(f"/api/applications/{created['id']}", headers=headers, json={
        "status": "Applied"
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Applied"

    # Delete application
    del_res = client.delete(f"/api/applications/{created['id']}", headers=headers)
    assert del_res.status_code == 200

def test_admin_authorization():
    # Login as candidate
    candidate_login = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "password123"
    })
    c_token = candidate_login.json()["tokens"]["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Candidate attempting admin endpoint should get 403 Forbidden
    forbidden_res = client.get("/api/admin/stats", headers=c_headers)
    assert forbidden_res.status_code == 403

    # Login as admin
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@careermatch.ai",
        "password": "admin123"
    })
    a_token = admin_login.json()["tokens"]["access_token"]
    a_headers = {"Authorization": f"Bearer {a_token}"}

    # Admin should succeed
    admin_res = client.get("/api/admin/stats", headers=a_headers)
    assert admin_res.status_code == 200
    stats = admin_res.json()
    assert stats["total_users"] >= 2
    assert stats["total_jobs"] >= 5

def test_resume_correction_and_docx_generation():
    # Login as candidate
    login_res = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "password123"
    })
    token = login_res.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get primary resume
    resumes_res = client.get("/api/resumes", headers=headers)
    assert resumes_res.status_code == 200
    resumes = resumes_res.json()
    assert len(resumes) > 0
    resume_id = resumes[0]["id"]

    # Get AI corrections
    corr_res = client.get(f"/api/resumes/{resume_id}/corrections", headers=headers)
    assert corr_res.status_code == 200
    data = corr_res.json()
    assert "corrections" in data
    assert "corrected_text" in data
    assert data["corrected_score"] >= data["original_score"]
    assert data["template_info"]["font_family"] == "Calibri"

    # Test download-corrected endpoint
    dl_res = client.get(f"/api/resumes/{resume_id}/download-corrected", headers=headers)
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

def test_resume_matched_jobs_and_direct_apply():
    # Login as candidate
    login_res = client.post("/api/auth/login", json={
        "email": "alex@careermatch.ai",
        "password": "password123"
    })
    token = login_res.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get primary resume
    resumes_res = client.get("/api/resumes", headers=headers)
    assert resumes_res.status_code == 200
    resume_id = resumes_res.json()[0]["id"]

    # Match jobs for resume
    match_res = client.get(f"/api/resumes/{resume_id}/matched-jobs", headers=headers)
    assert match_res.status_code == 200
    data = match_res.json()
    assert "detected_domain" in data
    assert "detected_experience_tier" in data
    assert "jobs" in data
    assert len(data["jobs"]) > 0

    first_job = data["jobs"][0]
    assert first_job["match_score"] > 50
    assert "job_url" in first_job
    assert first_job["job_url"].startswith("http")

    # Apply to job directly
    apply_res = client.post(f"/api/jobs/{first_job['job_id']}/apply", headers=headers)
    assert apply_res.status_code == 200
    apply_data = apply_res.json()
    assert apply_data["success"] is True
    assert "job_url" in apply_data


