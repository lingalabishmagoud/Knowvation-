import sys
sys.stdout.reconfigure(encoding='utf-8')
from database import db, DATABASE_ID, SOURCE_JOBS_COLLECTION
r = db.list_documents(DATABASE_ID, SOURCE_JOBS_COLLECTION)
jobs = r['documents']
print(f"Total source jobs in DB: {len(jobs)}")
print("-" * 70)
for j in jobs:
    title   = j.get("title", "?")
    company = j.get("company", "?")
    loc     = j.get("location", "(missing)")
    hr      = j.get("hr_name", "(missing)")
    email   = j.get("hr_email", "(missing)")
    print(f"  [{title}]")
    print(f"      Company  : {company}")
    print(f"      Location : {loc}")
    print(f"      HR Name  : {hr}  |  Email: {email}")
