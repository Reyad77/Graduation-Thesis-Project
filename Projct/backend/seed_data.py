"""
Data seeding script for testing and development.

Populates Firestore with sample users, students, enterprises, jobs,
applications, banners, and announcements.

Usage:
    python seed_data.py          # seed all collections
    python seed_data.py --clear  # delete all seed data first
"""

import argparse
from datetime import datetime, timedelta, timezone

# ── Ensure we can import from the backend package ────────────────────
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))


def seed_all(clear: bool = False) -> None:
    """Run all seeders in order."""
    from app.core.firebase import get_db
    db = get_db()

    if clear:
        print("Clearing existing data...")
        for coll in [
            "users", "students", "enterprises", "jobs",
            "applications", "resumes", "notifications",
            "announcements", "banners",
        ]:
            docs = list(db.collection(coll).limit(500).stream())
            for doc in docs:
                doc.reference.delete()
            print(f"  Deleted {len(docs)} documents from '{coll}'")
        print("Done clearing.\n")

    now = datetime.now(timezone.utc)

    # ── Users ────────────────────────────────────────────────────────
    print("Seeding users...")
    users = [
        {
            "uid": "seed-student-1", "email": "alice@university.edu",
            "role": "student", "displayName": "Alice Johnson",
            "phone": "+1234567890", "preferredLanguage": "en",
            "isActive": True, "createdAt": now, "updatedAt": now,
        },
        {
            "uid": "seed-student-2", "email": "bob@college.edu",
            "role": "student", "displayName": "Bob Chen",
            "phone": "+1987654321", "preferredLanguage": "zh",
            "isActive": True, "createdAt": now, "updatedAt": now,
        },
        {
            "uid": "seed-enterprise-1", "email": "hr@techcorp.com",
            "role": "enterprise", "displayName": "TechCorp HR",
            "phone": "+1122334455", "preferredLanguage": "en",
            "isActive": True, "createdAt": now, "updatedAt": now,
        },
        {
            "uid": "seed-enterprise-2", "email": "jobs@cafeshop.com",
            "role": "enterprise", "displayName": "Cafe Shop",
            "phone": "+1555666777", "preferredLanguage": "en",
            "isActive": True, "createdAt": now, "updatedAt": now,
        },
        {
            "uid": "seed-admin-1", "email": "admin@platform.com",
            "role": "admin", "displayName": "Platform Admin",
            "phone": "+1000000000", "preferredLanguage": "en",
            "isActive": True, "createdAt": now, "updatedAt": now,
        },
    ]
    for u in users:
        db.collection("users").document(u["uid"]).set(u)
    print(f"  Created {len(users)} users.")

    # ── Students ─────────────────────────────────────────────────────
    print("Seeding students...")
    students = [
        {
            "uid": "seed-student-1", "studentId": "STU2024001",
            "major": "Computer Science", "grade": "Junior", "year": 3,
            "idCardPhoto": None, "isVerified": True,
            "verifiedAt": now, "verifiedBy": "seed-admin-1",
            "skills": ["Python", "JavaScript", "React", "SQL"],
            "availability": "Weekends, Weekday evenings",
            "createdAt": now, "updatedAt": now,
        },
        {
            "uid": "seed-student-2", "studentId": "STU2024002",
            "major": "Business Administration", "grade": "Sophomore", "year": 2,
            "idCardPhoto": None, "isVerified": True,
            "verifiedAt": now, "verifiedBy": "seed-admin-1",
            "skills": ["Communication", "Microsoft Office", "Social Media"],
            "availability": "Weekdays afternoon",
            "createdAt": now, "updatedAt": now,
        },
    ]
    for s in students:
        db.collection("students").document(s["uid"]).set(s)
    print(f"  Created {len(students)} students.")

    # ── Enterprises ──────────────────────────────────────────────────
    print("Seeding enterprises...")
    enterprises = [
        {
            "uid": "seed-enterprise-1", "companyName": "TechCorp Inc.",
            "businessLicense": None, "storePhotos": [],
            "description": "Leading technology solutions provider.",
            "contactPerson": "Sarah Manager", "contactPhone": "+1122334455",
            "address": "123 Tech Street, Silicon Valley, CA",
            "website": "https://techcorp.example.com",
            "isApproved": True, "approvedAt": now, "approvedBy": "seed-admin-1",
            "isBanned": False, "banReason": "",
            "createdAt": now, "updatedAt": now,
        },
        {
            "uid": "seed-enterprise-2", "companyName": "Campus Cafe",
            "businessLicense": None, "storePhotos": [],
            "description": "Cozy cafe near campus serving students.",
            "contactPerson": "Mike Owner", "contactPhone": "+1555666777",
            "address": "456 College Ave, University District",
            "website": "https://campuscafe.example.com",
            "isApproved": True, "approvedAt": now, "approvedBy": "seed-admin-1",
            "isBanned": False, "banReason": "",
            "createdAt": now, "updatedAt": now,
        },
    ]
    for e in enterprises:
        db.collection("enterprises").document(e["uid"]).set(e)
    print(f"  Created {len(enterprises)} enterprises.")

    # ── Jobs ─────────────────────────────────────────────────────────
    print("Seeding jobs...")
    jobs = [
        {
            "enterpriseUid": "seed-enterprise-1", "title": "Junior Web Developer",
            "responsibilities": "Build and maintain web applications using React and Node.js.",
            "salary": "$20/hour", "workingHours": "Flexible, 15-20 hours/week",
            "quota": 2, "location": "Remote",
            "skillRequirements": ["JavaScript", "React", "Node.js"],
            "duration": "6 months", "status": "active",
            "views": 45, "applicationsCount": 3,
            "postedAt": now, "expiresAt": now + timedelta(days=30),
            "updatedAt": now,
        },
        {
            "enterpriseUid": "seed-enterprise-1", "title": "Data Entry Assistant",
            "responsibilities": "Enter and organize data in spreadsheets and databases.",
            "salary": "$15/hour", "workingHours": "9 AM - 2 PM, Mon-Fri",
            "quota": 1, "location": "On-site",
            "skillRequirements": ["Microsoft Office", "Typing"],
            "duration": "3 months", "status": "active",
            "views": 28, "applicationsCount": 5,
            "postedAt": now - timedelta(days=5),
            "expiresAt": now + timedelta(days=25),
            "updatedAt": now,
        },
        {
            "enterpriseUid": "seed-enterprise-2", "title": "Barista / Cafe Staff",
            "responsibilities": "Prepare beverages, serve customers, maintain cleanliness.",
            "salary": "$16/hour + tips", "workingHours": "Shifts between 7 AM - 8 PM",
            "quota": 3, "location": "On-site",
            "skillRequirements": ["Customer Service", "Communication"],
            "duration": "Ongoing", "status": "active",
            "views": 62, "applicationsCount": 8,
            "postedAt": now - timedelta(days=2),
            "expiresAt": now + timedelta(days=28),
            "updatedAt": now,
        },
        {
            "enterpriseUid": "seed-enterprise-2", "title": "Social Media Intern",
            "responsibilities": "Manage social media accounts and create content.",
            "salary": "$18/hour", "workingHours": "10-15 hours/week, flexible",
            "quota": 1, "location": "Remote",
            "skillRequirements": ["Social Media", "Content Creation", "Canva"],
            "duration": "4 months", "status": "pending",
            "views": 10, "applicationsCount": 0,
            "postedAt": now,
            "expiresAt": now + timedelta(days=30),
            "updatedAt": now,
        },
    ]
    job_ids = []
    for j in jobs:
        ref = db.collection("jobs").document()
        ref.set(j)
        job_ids.append(ref.id)
        j["id"] = ref.id  # type: ignore[index]
    print(f"  Created {len(jobs)} jobs.")

    # ── Resumes ──────────────────────────────────────────────────────
    print("Seeding resumes...")
    resumes = [
        {
            "studentUid": "seed-student-1", "major": "Computer Science",
            "grade": "Junior", "skills": ["Python", "JavaScript", "React", "SQL"],
            "availableHours": "20 hours/week", "experience": "Summer internship at a startup.",
            "certificates": [], "isDefault": True,
            "createdAt": now, "updatedAt": now,
        },
        {
            "studentUid": "seed-student-2", "major": "Business Administration",
            "grade": "Sophomore", "skills": ["Communication", "Microsoft Office"],
            "availableHours": "Weekends only",
            "experience": "Volunteer at campus events.",
            "certificates": [], "isDefault": True,
            "createdAt": now, "updatedAt": now,
        },
    ]
    resume_ids = []
    for r in resumes:
        ref = db.collection("resumes").document()
        ref.set(r)
        resume_ids.append(ref.id)
    print(f"  Created {len(resumes)} resumes.")

    # ── Applications ─────────────────────────────────────────────────
    print("Seeding applications...")
    applications = [
        {
            "jobId": job_ids[0], "studentUid": "seed-student-1",
            "resumeId": resume_ids[0], "status": "reviewing",
            "interviewSchedule": None,
            "appliedAt": now - timedelta(days=3), "updatedAt": now,
            "notes": "", "hiredAt": None, "completedAt": None,
        },
        {
            "jobId": job_ids[1], "studentUid": "seed-student-1",
            "resumeId": resume_ids[0], "status": "pending",
            "interviewSchedule": None,
            "appliedAt": now - timedelta(days=1), "updatedAt": now,
            "notes": "", "hiredAt": None, "completedAt": None,
        },
        {
            "jobId": job_ids[2], "studentUid": "seed-student-2",
            "resumeId": resume_ids[1], "status": "interview",
            "interviewSchedule": {
                "date": now + timedelta(days=3),
                "location": "Campus Cafe, Downtown",
                "notes": "Bring your resume.",
                "sentAt": now,
            },
            "appliedAt": now - timedelta(days=7), "updatedAt": now,
            "notes": "", "hiredAt": None, "completedAt": None,
        },
    ]
    for a in applications:
        db.collection("applications").document().set(a)
    print(f"  Created {len(applications)} applications.")

    # ── Announcements ────────────────────────────────────────────────
    print("Seeding announcements...")
    announcements = [
        {
            "title": "Welcome to StudentJob Hub!",
            "content": "We are excited to launch our platform. Start browsing jobs today!",
            "type": "announcement", "bannerImage": None,
            "isActive": True, "priority": 10,
            "createdAt": now, "createdBy": "seed-admin-1", "updatedAt": now,
        },
        {
            "title": "Tips for a Great Resume",
            "content": "Keep it concise, highlight your skills, and tailor it to each job.",
            "type": "article", "bannerImage": None,
            "isActive": True, "priority": 5,
            "createdAt": now, "createdBy": "seed-admin-1", "updatedAt": now,
        },
    ]
    for a in announcements:
        db.collection("announcements").document().set(a)
    print(f"  Created {len(announcements)} announcements.")

    # ── Banners ──────────────────────────────────────────────────────
    print("Seeding banners...")
    banners = [
        {
            "imageUrl": "", "link": "/jobs", "title": "Find Part-Time Jobs",
            "order": 1, "isActive": True,
            "createdAt": now, "updatedAt": now,
        },
        {
            "imageUrl": "", "link": "/register", "title": "Join as Employer",
            "order": 2, "isActive": True,
            "createdAt": now, "updatedAt": now,
        },
    ]
    for b in banners:
        db.collection("banners").document().set(b)
    print(f"  Created {len(banners)} banners.")

    print("\nSeeding complete!")
    print(f"   Users:         {len(users)}")
    print(f"   Students:      {len(students)}")
    print(f"   Enterprises:   {len(enterprises)}")
    print(f"   Jobs:          {len(jobs)}")
    print(f"   Resumes:       {len(resumes)}")
    print(f"   Applications:  {len(applications)}")
    print(f"   Announcements: {len(announcements)}")
    print(f"   Banners:       {len(banners)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Firestore with test data.")
    parser.add_argument(
        "--clear", action="store_true",
        help="Delete all existing data before seeding.",
    )
    args = parser.parse_args()
    seed_all(clear=args.clear)
