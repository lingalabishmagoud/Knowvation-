"""
Migration script: Add location + HR recruiter fields to Appwrite collections.
Run this ONCE to upgrade your existing Appwrite schema.
Safe to run multiple times — errors on existing attributes are ignored.
"""
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

load_dotenv()

client = Client()
client.set_endpoint(os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
client.set_key(os.getenv("APPWRITE_API_KEY"))

db = Databases(client)
DB_ID = "hiring_intelligence"

def add_attr(fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
        print("  [OK] Added attribute")
    except Exception as e:
        msg = str(e)
        if "already exists" in msg.lower() or "409" in msg:
            print("  [SKIP] Already exists")
        else:
            print(f"  [ERR] {e}")

print("\n[+] Migrating source_jobs collection...")
add_attr(db.create_string_attribute, DB_ID, "source_jobs", "location",    255, False)
add_attr(db.create_string_attribute, DB_ID, "source_jobs", "hr_name",      255, False)
add_attr(db.create_string_attribute, DB_ID, "source_jobs", "hr_designation",255, False)
add_attr(db.create_string_attribute, DB_ID, "source_jobs", "hr_email",     255, False)
add_attr(db.create_string_attribute, DB_ID, "source_jobs", "hr_linkedin",  512, False)
add_attr(db.create_string_attribute, DB_ID, "source_jobs", "hr_contact",   100, False)

print("\n[+] Migrating analyzed_jobs collection...")
add_attr(db.create_string_attribute, DB_ID, "analyzed_jobs", "location",   255, False)
add_attr(db.create_string_attribute, DB_ID, "analyzed_jobs", "hr_name",    255, False)
add_attr(db.create_string_attribute, DB_ID, "analyzed_jobs", "hr_email",   255, False)
add_attr(db.create_string_attribute, DB_ID, "analyzed_jobs", "hr_linkedin",512, False)
add_attr(db.create_string_attribute, DB_ID, "analyzed_jobs", "hr_contact", 100, False)

print("\n[DONE] Migration complete! New fields are ready in Appwrite.")
