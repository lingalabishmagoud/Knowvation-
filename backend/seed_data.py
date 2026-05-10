import sys
sys.stdout.reconfigure(encoding='utf-8')
import uuid
from database import db, DATABASE_ID, ANALYZED_JOBS_COLLECTION

# Clear old data first
try:
    old = db.list_documents(DATABASE_ID, ANALYZED_JOBS_COLLECTION)
    for doc in old['documents']:
        db.delete_document(DATABASE_ID, ANALYZED_JOBS_COLLECTION, doc['$id'])
    print(f"Cleared {len(old['documents'])} old records")
except Exception as e:
    print(f"Clear error: {e}")

# Realistic seed data matching your mock source jobs
seed_jobs = [
    {
        "role": "Python Developer & Tester",
        "company": "XYZ Corp",
        "skills": ["Python", "Pytest", "Selenium", "FastAPI", "REST APIs"],
        "experience": "1-3 years",
        "hiring_trend": "Aggressive",
        "intelligence_score": 82,
        "raw_description": "android dev, tester, java full stack, ai llms"
    },
    {
        "role": "Senior Python Developer",
        "company": "XYZ Solutions",
        "skills": ["Python", "Django", "FastAPI", "DSA", "PostgreSQL", "AWS"],
        "experience": "3-5 years",
        "hiring_trend": "Aggressive",
        "intelligence_score": 91,
        "raw_description": "python developer and python full stack, and dsa. btech undergraduates of 27,26,25 are eligible"
    },
    {
        "role": "Senior React Developer",
        "company": "Tech Solutions Inc",
        "skills": ["React", "Next.js", "Appwrite", "Tailwind CSS", "TypeScript", "REST APIs"],
        "experience": "4+ years",
        "hiring_trend": "Aggressive",
        "intelligence_score": 95,
        "raw_description": "We are urgently looking for a Senior React developer with 4 years of experience. Must know Next.js, Appwrite, and Tailwind. Fast-paced startup environment."
    },
    {
        "role": "QA & Automation Test Engineer",
        "company": "Testing Solutions",
        "skills": ["Selenium", "Automation Testing", "Security Testing", "Pytest", "JIRA"],
        "experience": "2-4 years",
        "hiring_trend": "Moderate",
        "intelligence_score": 74,
        "raw_description": "testing, automation testing, selenium testing, security testing"
    },
    {
        "role": "Full Stack Web Developer",
        "company": "Bishma Solutions",
        "skills": ["HTML", "CSS", "JavaScript", "React", "Python", "PostgreSQL", "MySQL", "Node.js", "Git"],
        "experience": "2-5 years",
        "hiring_trend": "Moderate",
        "intelligence_score": 88,
        "raw_description": "Web Developer responsible for designing, developing, and maintaining responsive websites and web applications using React, Python/Node.js, and PostgreSQL/MySQL."
    },
]

print(f"\nSeeding {len(seed_jobs)} jobs into database...")
for i, job in enumerate(seed_jobs):
    try:
        res = db.create_document(
            database_id=DATABASE_ID,
            collection_id=ANALYZED_JOBS_COLLECTION,
            document_id=str(uuid.uuid4()),
            data=job
        )
        print(f"  [{i+1}] Saved: {job['role']} @ {job['company']} -> {res['$id']}")
    except Exception as e:
        print(f"  [{i+1}] FAILED: {e}")

print("\nDone! All jobs seeded. Refresh your dashboard now.")
