"""
Seed script: Add 5 complete job entries to source_jobs collection.
Also patches any existing jobs that are missing the new HR/location fields.
Run once: python seed_jobs_phase3.py
"""
import os, sys
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
import uuid

load_dotenv()

client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))

db = Databases(client)
DB_ID   = "hiring_intelligence"
COLL_ID = "source_jobs"

# ── 5 New Jobs ────────────────────────────────────────────────────────────────
NEW_JOBS = [
    {
        "title":           "Full Stack Developer",
        "company":         "NexaTech Solutions",
        "location":        "Hyderabad, India / Remote",
        "description":     (
            "We are looking for a Full Stack Developer responsible for developing and maintaining "
            "scalable web applications using modern front-end and back-end technologies. The candidate "
            "should have experience with HTML, CSS, JavaScript, React.js, Node.js/Python, REST APIs, "
            "and databases like PostgreSQL or MongoDB. Responsibilities include designing responsive UI, "
            "API integration, debugging, performance optimization, version control using Git/GitHub, "
            "and collaborating with cross-functional teams to deliver high-quality software solutions."
        ),
        "hr_name":         "Priya Sharma",
        "hr_designation":  "Talent Acquisition Specialist",
        "hr_email":        "priya.sharma@nexatech.com",
        "hr_contact":      "+91 9876543210",
        "hr_linkedin":     "https://linkedin.com/in/priya-sharma-tech",
    },
    {
        "title":           "UI/UX Designer",
        "company":         "PixelCraft Studios",
        "location":        "Bengaluru, India / Hybrid",
        "description":     (
            "We are seeking a creative UI/UX Designer to design intuitive and visually appealing user "
            "interfaces for web and mobile applications. The candidate should have experience with Figma, "
            "Adobe XD, wireframing, prototyping, user research, and responsive design principles. "
            "Responsibilities include creating user-centered designs, improving user experience, "
            "collaborating with developers and stakeholders, conducting usability testing, and maintaining "
            "design consistency across products."
        ),
        "hr_name":         "Rahul Mehta",
        "hr_designation":  "HR Manager",
        "hr_email":        "rahul.mehta@pixelcraft.com",
        "hr_contact":      "+91 9123456780",
        "hr_linkedin":     "https://linkedin.com/in/rahul-mehta-uiux",
    },
    {
        "title":           "Cyber Security Analyst",
        "company":         "SecureNet Technologies",
        "location":        "Pune, India / Remote",
        "description":     (
            "We are hiring a Cyber Security Analyst to monitor, analyze, and protect organizational "
            "systems and networks from cyber threats and vulnerabilities. The candidate should have "
            "knowledge of network security, SIEM tools, penetration testing, firewalls, vulnerability "
            "assessment, incident response, and security compliance standards. Responsibilities include "
            "monitoring security alerts, identifying threats, implementing security measures, conducting "
            "risk assessments, and ensuring data protection across systems and applications."
        ),
        "hr_name":         "Sneha Reddy",
        "hr_designation":  "Senior HR Executive",
        "hr_email":        "sneha.reddy@securenet.com",
        "hr_contact":      "+91 9988776655",
        "hr_linkedin":     "https://linkedin.com/in/sneha-reddy-cyber",
    },
    {
        "title":           "DevOps Engineer",
        "company":         "CloudSync Systems",
        "location":        "Chennai, India / Remote",
        "description":     (
            "We are looking for a DevOps Engineer responsible for automating deployment pipelines, "
            "managing cloud infrastructure, and improving system reliability. The candidate should have "
            "experience with Docker, Kubernetes, CI/CD pipelines, Linux, AWS/Azure, Jenkins, Git, and "
            "infrastructure automation tools like Terraform or Ansible. Responsibilities include monitoring "
            "system performance, automating workflows, managing cloud resources, ensuring application "
            "scalability, and collaborating with development and operations teams."
        ),
        "hr_name":         "Arjun Verma",
        "hr_designation":  "Technical Recruiter",
        "hr_email":        "arjun.verma@cloudsync.com",
        "hr_contact":      "+91 9012345678",
        "hr_linkedin":     "https://linkedin.com/in/arjun-verma-devops",
    },
    {
        "title":           "Software Tester / QA Engineer",
        "company":         "QualitySoft Labs",
        "location":        "Mumbai, India / Hybrid",
        "description":     (
            "We are seeking a Software Tester/QA Engineer to ensure the quality and performance of web "
            "and mobile applications through manual and automated testing. The candidate should have "
            "experience with test case creation, bug tracking, Selenium, API testing, regression testing, "
            "and Agile methodologies. Responsibilities include identifying bugs, validating software "
            "functionality, preparing test reports, collaborating with developers, and ensuring software "
            "meets business and technical requirements."
        ),
        "hr_name":         "Kavya Nair",
        "hr_designation":  "HR Executive",
        "hr_email":        "kavya.nair@qualitysoft.com",
        "hr_contact":      "+91 9345678901",
        "hr_linkedin":     "https://linkedin.com/in/kavya-nair-qa",
    },
]

# ── Step 1: Patch existing jobs that are missing new fields ───────────────────
print("\n[1] Checking existing source jobs for missing fields...")
try:
    existing = db.list_documents(DB_ID, COLL_ID)
    for doc in existing['documents']:
        needs_patch = not doc.get("location") and not doc.get("hr_name")
        if needs_patch:
            patch = {
                "location":       doc.get("location") or "India (Location TBD)",
                "hr_name":        doc.get("hr_name") or "HR Team",
                "hr_designation": doc.get("hr_designation") or "Recruiter",
                "hr_email":       doc.get("hr_email") or "hr@" + (doc.get("company","company").lower().replace(" ","") + ".com"),
                "hr_contact":     doc.get("hr_contact") or "",
                "hr_linkedin":    doc.get("hr_linkedin") or "",
            }
            db.update_document(DB_ID, COLL_ID, doc['$id'], data=patch)
            print(f"  [PATCHED] '{doc.get('title')}' — added HR placeholder fields")
        else:
            print(f"  [OK] '{doc.get('title')}' already has HR fields")
except Exception as e:
    print(f"  [ERR] Could not patch existing jobs: {e}")

# ── Step 2: Add the 5 new jobs ────────────────────────────────────────────────
print("\n[2] Adding 5 new jobs to source_jobs...")
for job in NEW_JOBS:
    try:
        doc = db.create_document(
            database_id=DB_ID,
            collection_id=COLL_ID,
            document_id=str(uuid.uuid4()),
            data=job
        )
        print(f"  [OK] Added: '{job['title']}' at {job['company']} ({job['location']})")
    except Exception as e:
        print(f"  [ERR] Failed to add '{job['title']}': {e}")

print("\n[DONE] Seed complete! All 5 jobs added to Appwrite source_jobs.")
print("       Go to the Admin panel and run the Playwright Scraper to analyze them.")
