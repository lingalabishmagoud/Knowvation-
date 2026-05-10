import sys
sys.stdout.reconfigure(encoding='utf-8')
from database import db, DATABASE_ID, ANALYZED_JOBS_COLLECTION
r = db.list_documents(DATABASE_ID, ANALYZED_JOBS_COLLECTION)
jobs = r['documents']
print(f"Analyzed jobs in DB: {len(jobs)}")
print("-" * 60)
for j in jobs:
    role     = j.get("role", "?")
    company  = j.get("company", "?")
    location = j.get("location", "(none)")
    hr_name  = j.get("hr_name", "(none)")
    score    = j.get("intelligence_score", 0)
    print(f"  Role: {role}")
    print(f"       Company: {company}  |  Location: {location}")
    print(f"       HR: {hr_name}  |  Score: {score}/100")
    print()
