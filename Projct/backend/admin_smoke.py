# -*- coding: utf-8 -*-
"""End-to-end smoke test of the ADMIN flows against the live backend.

Creates a temporary admin, a student, and a recruiter, then exercises:
user listing, student verification, recruiter approval/decline, job audit
(pending list / approve / reject / remove), banner + announcement CRUD,
role assignment, evaluation management, and ban/timeout endpoints.
Cleans up all created data afterwards.
"""
import sys
import time

import requests

from app.core.firebase import get_firebase_app, get_db

get_firebase_app()
from firebase_admin import auth  # noqa: E402

API = "http://localhost:8000/api/v1"
STAMP = "adminsmoke1021"
ADMIN_EMAIL = f"{STAMP}.admin@example.com"
STUDENT_EMAIL = f"{STAMP}.student@example.com"
RECRUITER_EMAIL = f"{STAMP}.recruiter@example.com"
PASSWORD = "AdminSmoke123!"
results = []


def check(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + (f" | {extra}" if extra and not cond else ""))


def reg(email, role):
    return requests.post(f"{API}/auth/register", json={
        "email": email, "password": PASSWORD, "displayName": "Admin Smoke", "role": role,
    }, timeout=30)


def login(email):
    return requests.post(f"{API}/auth/login", json={"email": email, "password": PASSWORD}, timeout=30)


db = get_db()

# ── Create the temporary admin (via Admin SDK — registration must not) ──
admin_auth = auth.create_user(email=ADMIN_EMAIL, password=PASSWORD, display_name="Smoke Admin")
db.collection("users").document(admin_auth.uid).set({
    "uid": admin_auth.uid, "email": ADMIN_EMAIL, "role": "admin",
    "displayName": "Smoke Admin", "phone": "", "preferredLanguage": "en",
    "isActive": True,
})
r = login(ADMIN_EMAIL)
check("admin login", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")
H = {"Authorization": f"Bearer {r.json().get('access_token', '')}"}
admin_uid = admin_auth.uid

# ── Create a student and a recruiter ────────────────────────────────────
r = reg(STUDENT_EMAIL, "student")
student_uid = r.json().get("user", {}).get("uid", "")
check("student registered", r.status_code == 201)

r = reg(RECRUITER_EMAIL, "recruiter")
recruiter_uid = r.json().get("user", {}).get("uid", "")
check("recruiter registered", r.status_code == 201)

# ── User listing ────────────────────────────────────────────────────────
r = requests.get(f"{API}/admin/users", headers=H, timeout=30)
check("GET /admin/users", r.status_code == 200 and isinstance(r.json(), list), f"got {r.status_code}")
check("admin sees student+recruiter", any(u.get("uid") == student_uid for u in r.json()) and any(u.get("uid") == recruiter_uid for u in r.json()))

# ── Student verification ────────────────────────────────────────────────
r = requests.post(f"{API}/admin/users/{student_uid}/verify-student", headers=H, timeout=30)
check("verify student", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")

# ── Recruiter approval / decline ────────────────────────────────────────
r = requests.post(f"{API}/admin/users/{recruiter_uid}/approve-recruiter", headers=H, timeout=30)
check("approve recruiter", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")
r = requests.post(f"{API}/admin/users/{recruiter_uid}/decline-recruiter", headers=H, params={"reason": "test"}, timeout=30)
check("decline recruiter", r.status_code == 200, f"got {r.status_code}")
r = requests.post(f"{API}/admin/users/{recruiter_uid}/approve-recruiter", headers=H, timeout=30)
check("re-approve recruiter", r.status_code == 200)

# ── Role assignment ─────────────────────────────────────────────────────
r = requests.put(f"{API}/admin/users/{student_uid}/role", params={"role": "recruiter"}, headers=H, timeout=30)
check("change role", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")
r = requests.put(f"{API}/admin/users/{student_uid}/role", params={"role": "student"}, headers=H, timeout=30)
check("change role back", r.status_code == 200)

# ── Job audit ───────────────────────────────────────────────────────────
STU = requests.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": PASSWORD}, timeout=30).json().get("access_token", "")
# recruiter posts a job
RHB = {"Authorization": f"Bearer {requests.post(f'{API}/auth/login', json={'email': RECRUITER_EMAIL, 'password': PASSWORD}, timeout=30).json().get('access_token', '')}"}
r = requests.post(f"{API}/recruiter/jobs", json={
    "title": "Smoke Job", "responsibilities": "x", "salary": "$1", "workingHours": "1h",
    "quota": 1, "location": "x", "skillRequirements": [], "duration": "1d",
}, headers=RHB, timeout=30)
job_id = r.json().get("id", "")
check("job posted by recruiter", r.status_code == 201)

r = requests.get(f"{API}/admin/jobs/pending", headers=H, timeout=30)
check("GET pending jobs", r.status_code == 200 and any(j.get("id") == job_id for j in r.json()), f"got {r.status_code}")

r = requests.post(f"{API}/admin/jobs/{job_id}/approve", headers=H, timeout=30)
check("approve job", r.status_code == 200, f"got {r.status_code} {r.text[:100]}")

# second job for reject/remove flows
r = requests.post(f"{API}/recruiter/jobs", json={
    "title": "Smoke Job 2", "responsibilities": "x", "salary": "$1", "workingHours": "1h",
    "quota": 1, "location": "x", "skillRequirements": [], "duration": "1d",
}, headers=RHB, timeout=30)
job2_id = r.json().get("id", "")
r = requests.post(f"{API}/admin/jobs/{job2_id}/reject", headers=H, params={"notes": "spam"}, timeout=30)
check("reject job", r.status_code == 200, f"got {r.status_code}")
r = requests.post(f"{API}/admin/jobs/{job2_id}/remove", headers=H, timeout=30)
check("remove job", r.status_code == 200)

# ── Banner CRUD ─────────────────────────────────────────────────────────
r = requests.post(f"{API}/admin/banners", json={"title": "Smoke Banner", "link": "/jobs", "order": 1, "isActive": True, "imageUrl": ""}, headers=H, timeout=30)
check("create banner", r.status_code == 201, f"got {r.status_code} {r.text[:120]}")
banner_id = r.json().get("id", "")
r = requests.get(f"{API}/admin/banners", headers=H, timeout=30)
check("list banners", r.status_code == 200 and any(b.get("id") == banner_id for b in r.json()))
r = requests.put(f"{API}/admin/banners/{banner_id}", json={"title": "Smoke Banner v2"}, headers=H, timeout=30)
check("update banner", r.status_code == 200)
r = requests.delete(f"{API}/admin/banners/{banner_id}", headers=H, timeout=30)
check("delete banner", r.status_code == 200)

# ── Announcement CRUD ───────────────────────────────────────────────────
r = requests.post(f"{API}/admin/announcements", json={"title": "Smoke News", "content": "x", "type": "announcement", "isActive": True, "priority": 1}, headers=H, timeout=30)
check("create announcement", r.status_code == 201, f"got {r.status_code} {r.text[:120]}")
ann_id = r.json().get("id", "")
r = requests.put(f"{API}/admin/announcements/{ann_id}", json={"content": "y"}, headers=H, timeout=30)
check("update announcement", r.status_code == 200)
r = requests.delete(f"{API}/admin/announcements/{ann_id}", headers=H, timeout=30)
check("delete announcement", r.status_code == 200)

# ── Evaluations management ──────────────────────────────────────────────
r = requests.get(f"{API}/admin/evaluations", headers=H, timeout=30)
check("list evaluations", r.status_code == 200, f"got {r.status_code}")
r = requests.delete(f"{API}/admin/evaluations/nonexistent-id", headers=H, timeout=30)
check("delete missing evaluation -> 404", r.status_code == 404, f"got {r.status_code}")

# ── Ban / timeout / unban ───────────────────────────────────────────────
r = requests.post(f"{API}/admin/users/{student_uid}/ban", headers=H, params={"reason": "test"}, timeout=30)
check("ban user", r.status_code == 200, f"got {r.status_code}")
r = requests.post(f"{API}/admin/users/{student_uid}/unban", headers=H, timeout=30)
check("unban user", r.status_code == 200)
r = requests.post(f"{API}/admin/users/{student_uid}/timeout", headers=H, params={"minutes": 5}, timeout=30)
check("timeout user", r.status_code == 200)

# ── Cleanup ─────────────────────────────────────────────────────────────
for email, uid in (
    (ADMIN_EMAIL, admin_uid), (STUDENT_EMAIL, student_uid), (RECRUITER_EMAIL, recruiter_uid),
):
    try:
        auth.delete_user(uid)
    except Exception:
        pass
    for coll in ("users", "students", "recruiters"):
        db.collection(coll).document(uid).delete()
for coll, filt in (
    ("jobs", lambda d: d.get("recruiterUid") in (student_uid, recruiter_uid)),
    ("notifications", lambda d: d.get("userId") in (admin_uid, student_uid, recruiter_uid)),
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
