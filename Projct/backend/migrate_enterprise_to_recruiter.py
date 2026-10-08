"""
One-time Firebase data migration: "enterprise" -> "recruiter".

Aligns existing Firestore data with the renamed role model:
  1. users:        role "enterprise"      -> "recruiter" + recruiterType "enterprise"
  2. enterprises:  collection docs copied -> "recruiters" (originals deleted)
  3. jobs:         field enterpriseUid    -> recruiterUid

Idempotent: re-running finds nothing left to change.

Usage:
    python migrate_enterprise_to_recruiter.py           # dry run (default)
    python migrate_enterprise_to_recruiter.py --apply   # perform the writes
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))


def migrate(apply: bool) -> None:
    from app.core.firebase import get_db

    db = get_db()
    changes = []

    # 1. Users: role rename ------------------------------------------------
    users = list(db.collection("users").limit(1000).stream())
    user_updates = 0
    for doc in users:
        data = doc.to_dict() or {}
        if data.get("role") == "enterprise":
            changes.append(("users", doc.id, "role enterprise -> recruiter"))
            if apply:
                db.collection("users").document(doc.id).update(
                    {"role": "recruiter", "recruiterType": "enterprise"}
                )
            user_updates += 1
    print(f"users to update: {user_updates}")

    # 2. Enterprises collection -> recruiters ------------------------------
    ent_docs = list(db.collection("enterprises").limit(1000).stream())
    print(f"enterprise profile docs found: {len(ent_docs)}")
    for doc in ent_docs:
        data = doc.to_dict() or {}
        data.setdefault("recruiterType", "enterprise")
        target = db.collection("recruiters").document(doc.id).get()
        if not target.exists:
            changes.append(("enterprises->recruiters", doc.id, "copy profile"))
            if apply:
                db.collection("recruiters").document(doc.id).set(data)
                db.collection("enterprises").document(doc.id).delete()
        else:
            print(f"  skip {doc.id}: recruiters doc already exists")

    # 3. Jobs: enterpriseUid -> recruiterUid -------------------------------
    jobs = list(db.collection("jobs").limit(1000).stream())
    job_updates = 0
    for doc in jobs:
        data = doc.to_dict() or {}
        if "enterpriseUid" in data:
            changes.append(("jobs", doc.id, "enterpriseUid -> recruiterUid"))
            if apply:
                data["recruiterUid"] = data.pop("enterpriseUid")
                db.collection("jobs").document(doc.id).set(data)
            job_updates += 1
    print(f"jobs to update: {job_updates}")

    # Summary --------------------------------------------------------------
    print()
    print(f"{'APPLIED' if apply else 'DRY RUN'}: {len(changes)} change(s)")
    for coll, doc_id, what in changes:
        print(f"  [{coll}] {doc_id}: {what}")
    if not apply and changes:
        print("\nRe-run with --apply to perform these writes.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate enterprise role data to recruiter.")
    parser.add_argument("--apply", action="store_true", help="Perform the writes (default is dry run).")
    args = parser.parse_args()
    migrate(apply=args.apply)
