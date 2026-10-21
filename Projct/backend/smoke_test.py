# -*- coding: utf-8 -*-
"""End-to-end smoke test of the full webapp flow against the live backend.

Covers: registration (student + individual recruiter), profile, ID
verification, detailed resume, saved jobs, job posting/approval,
application lifecycle (pending -> reviewing -> interview -> hired ->
completed), mutual evaluation, duplicate evaluation blocking, received
evaluations, and notifications. Cleans up all created data afterwards.
"""
import sys
import time
from datetime import datetime, timezone

import requests

from app.core.firebase import get_firebase_app, get_db

get_firebase_app()
from firebase_admin import auth  # noqa: E402

API = "http://localhost:8000/api/v1"
STAMP = "smoke20261021"
EMAIL_A = f"{STAMP}.student@example.com"
EMAIL_B = f"{STAMP}.recruiter@example.com"
PASSWORD = "SmokeTest123!"
results = []


def check(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + (f" | {extra}" if extra and not cond else ""))


def reg(email, role, recruiter_type=None):
    payload = {"email": email, "password": PASSWORD, "displayName": "Smoke User", "role": role}
    if recruiter_type:
        payload["recruiterType"] = recruiter_type
    return requests.post(f"{API}/auth/register", json=payload, timeout=30)


def login(email):
    return requests.post(f"{API}/auth/login", json={"email": email, "password": PASSWORD}, timeout=30)


db = get_db()

# ── 1. Registration ───────────────────────────────────────────────────
r = reg(EMAIL_A, "student")
check("register student", r.status_code == 201, f"got {r.status_code} {r.text[:100]}")
tok_a = r.json().get("access_token", "")
uid_a = r.json().get("user", {}).get("uid", "")
HA = {"Authorization": f"Bearer {tok_a}"}

r = reg(EMAIL_B, "recruiter", "individual")
check("register individual recruiter", r.status_code == 201, f"got {r.status_code} {r.text[:100]}")
tok_b = r.json().get("access_token", "")
uid_b = r.json().get("user", {}).get("uid", "")
HB = {"Authorization": f"Bearer {tok_b}"}
check("recruiterType stored", r.json().get("user", {}).get("recruiterType") == "individual")

# ── 2. Student profile + ID verification ──────────────────────────────
r = requests.put(f"{API}/students/profile", json={"major": "CS", "grade": "Junior", "year": 3}, headers=HA, timeout=30)
check("update student profile", r.status_code == 200, f"got {r.status_code}")

r = requests.post(f"{API}/students/verify-id", params={"id_card_photo": "https://example.com/id.jpg"}, headers=HA, timeout=30)
check("submit student ID for verification", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")

# ── 3. Detailed resume ────────────────────────────────────────────────
r = requests.post(f"{API}/resumes/", json={
    "summary": "Motivated CS student.", "university": "Taizhou University",
    "major": "CS", "grade": "Junior", "skills": ["Python", "React"],
    "availableHours": "Weekends",
    "experiences": [{"title": "Tutor", "company": "Li Family", "startDate": "2025-09", "endDate": "2026-01", "description": "Math tutoring."}],
    "projects": [{"name": "Job Platform", "description": "Full-stack.", "link": "https://example.com"}],
    "languages": [{"language": "English", "level": "Fluent"}],
}, headers=HA, timeout=30)
check("create detailed resume", r.status_code == 201, f"got {r.status_code} {r.text[:100]}")
resume_id = r.json().get("id", "")
check("resume keeps new fields", bool(r.json().get("experiences")) and r.json().get("university") == "Taizhou University")

# ── 4. Recruiter profile (individual) ─────────────────────────────────
r = requests.put(f"{API}/recruiter/profile", json={
    "recruiterType": "individual", "contactPerson": "Mr. Li", "contactPhone": "+123", "description": "Family hiring a tutor",
}, headers=HB, timeout=30)
check("update individual recruiter profile", r.status_code == 200, f"got {r.status_code} {r.text[:120]}")
check("profile recruiterType", r.json().get("recruiterType") == "individual")

# ── 5. Job posting + approval ─────────────────────────────────────────
r = requests.post(f"{API}/recruiter/jobs", json={
    "title": "Private Math Tutor", "responsibilities": "Tutor a student.", "salary": "$25/hour",
    "workingHours": "2 evenings", "quota": 1, "location": "Home", "skillRequirements": ["Math"], "duration": "Semester",
}, headers=HB, timeout=30)
check("post job", r.status_code == 201, f"got {r.status_code} {r.text[:120]}")
job_id = r.json().get("id", "")
check("job has recruiterUid", r.json().get("recruiterUid") == uid_b)

# Approve directly (no admin credentials available for the smoke test)
db.collection("jobs").document(job_id).update({"status": "active"})
time.sleep(1)

# ── 6. Saved jobs (the un-shadowed routes) ────────────────────────────
r = requests.post(f"{API}/jobs/{job_id}/save", headers=HA, timeout=30)
check("save job", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")
r = requests.get(f"{API}/jobs/saved", headers=HA, timeout=30)
check("get saved jobs (route not shadowed)", r.status_code == 200 and isinstance(r.json(), list) and len(r.json()) == 1, f"got {r.status_code} {r.text[:100]}")
r = requests.delete(f"{API}/jobs/{job_id}/save", headers=HA, timeout=30)
check("unsave job", r.status_code == 200)

# ── 7. Application lifecycle ──────────────────────────────────────────
r = requests.post(f"{API}/jobs/{job_id}/apply", json={"resumeId": resume_id}, headers=HA, timeout=30)
check("apply to job", r.status_code == 201, f"got {r.status_code} {r.text[:100]}")
app_id = r.json().get("id", "")

r = requests.get(f"{API}/recruiter/applications", headers=HB, timeout=30)
check("recruiter sees application", r.status_code == 200 and any(a.get("id") == app_id for a in r.json()), f"got {r.status_code}")

for status in ("reviewing", "interview", "hired", "completed"):
    r = requests.put(f"{API}/recruiter/applications/{app_id}/status", json={"status": status}, headers=HB, timeout=30)
    check(f"status -> {status}", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")

# ── 8. Mutual evaluation ──────────────────────────────────────────────
r = requests.post(f"{API}/evaluations", json={"applicationId": app_id, "rating": 5, "comment": "Paid on time."}, headers=HA, timeout=30)
check("student evaluates recruiter", r.status_code == 201, f"got {r.status_code} {r.text[:120]}")
check("evaluation toRole=recruiter", r.json().get("toRole") == "recruiter")

r = requests.post(f"{API}/evaluations", json={"applicationId": app_id, "rating": 4, "comment": "Punctual worker."}, headers=HB, timeout=30)
check("recruiter evaluates student", r.status_code == 201, f"got {r.status_code} {r.text[:120]}")

r = requests.post(f"{API}/evaluations", json={"applicationId": app_id, "rating": 5, "comment": ""}, headers=HA, timeout=30)
check("duplicate evaluation blocked", r.status_code == 400, f"got {r.status_code}")

r = requests.get(f"{API}/evaluations/received", headers=HA, timeout=30)
check("student received evaluation", r.status_code == 200 and len(r.json()) == 1)
r = requests.get(f"{API}/evaluations/received", headers=HB, timeout=30)
check("recruiter received evaluation", r.status_code == 200 and len(r.json()) == 1)

# ── 9. Notifications were created ─────────────────────────────────────
r = requests.get(f"{API}/notifications/", headers=HA, timeout=30)
check("student notifications exist", r.status_code == 200 and r.json().get("unread_count", 0) >= 1)

# ── Cleanup ────────────────────────────────────────────────────────────
for uid in (uid_a, uid_b):
    try:
        auth.delete_user(uid)
    except Exception:
        pass
    db.collection("users").document(uid).delete()
    db.collection("students").document(uid).delete()
    db.collection("recruiters").document(uid).delete()
for coll, filt in (
    ("resumes", lambda d: d.get("studentUid") in (uid_a, uid_b)),
    ("jobs", lambda d: d.get("recruiterUid") in (uid_a, uid_b)),
    ("applications", lambda d: d.get("studentUid") in (uid_a, uid_b)),
    ("evaluations", lambda d: d.get("fromUid") in (uid_a, uid_b)),
    ("notifications", lambda d: d.get("userId") in (uid_a, uid_b)),
):
    for doc in db.collection(coll).limit(500).stream():
        try:
            if filt(doc.to_dict() or {}):
                db.collection(coll).document(doc.id).delete()
        except Exception:
            pass
print("cleanup done")

failed = [n for n, ok in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
sys.exit(1 if failed else 0)
