import os
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

load_dotenv()

# ─── Complete Schema Definition ──────────────────────────────────────────────
# This is the SINGLE SOURCE OF TRUTH for every database, collection, and
# attribute used by Knowvation.  Both backup_data.py and restore_data.py
# import SCHEMA from here so changes propagate automatically.
# ─────────────────────────────────────────────────────────────────────────────

DATABASE_ID   = "hiring_intelligence"
DATABASE_NAME = "Hiring Intelligence"

SCHEMA = {
    # ── Collection: source_jobs ──────────────────────────────────────────────
    "source_jobs": {
        "name": "Source Jobs",
        "attributes": [
            # --- Public fields (shown on mock job board) ---
            {"key": "title",          "type": "string", "size": 255,  "required": True},
            {"key": "company",        "type": "string", "size": 255,  "required": True},
            {"key": "location",       "type": "string", "size": 255,  "required": False},
            {"key": "description",    "type": "string", "size": 5000, "required": True},
            # --- Internal HR / Recruiter intel (NOT shown publicly) ---
            {"key": "hr_name",        "type": "string", "size": 255,  "required": False},
            {"key": "hr_designation", "type": "string", "size": 255,  "required": False},
            {"key": "hr_email",       "type": "string", "size": 255,  "required": False},
            {"key": "hr_linkedin",    "type": "string", "size": 500,  "required": False},
            {"key": "hr_contact",     "type": "string", "size": 255,  "required": False},
        ],
    },

    # ── Collection: analyzed_jobs ────────────────────────────────────────────
    "analyzed_jobs": {
        "name": "Analyzed Jobs",
        "attributes": [
            {"key": "role",               "type": "string",  "size": 255,  "required": True},
            {"key": "company",            "type": "string",  "size": 255,  "required": True},
            {"key": "location",           "type": "string",  "size": 255,  "required": False},
            {"key": "skills",             "type": "string",  "size": 1000, "required": True,  "array": True},
            {"key": "experience",         "type": "string",  "size": 255,  "required": True},
            {"key": "hiring_trend",       "type": "string",  "size": 50,   "required": True},
            {"key": "intelligence_score", "type": "integer",               "required": True},
            {"key": "raw_description",    "type": "string",  "size": 5000, "required": False},
            # --- HR fields carried over from source_jobs ---
            {"key": "hr_name",            "type": "string",  "size": 255,  "required": False},
            {"key": "hr_email",           "type": "string",  "size": 255,  "required": False},
            {"key": "hr_linkedin",        "type": "string",  "size": 500,  "required": False},
            {"key": "hr_contact",         "type": "string",  "size": 255,  "required": False},
        ],
    },

    # ── Collection: companies (Phase 3 placeholder) ──────────────────────────
    "companies": {
        "name": "Companies",
        "attributes": [
            {"key": "company_name",  "type": "string",  "size": 255, "required": True},
            {"key": "website",       "type": "string",  "size": 500, "required": False},
            {"key": "hiring_score",  "type": "integer",              "required": False},
            {"key": "trend",         "type": "string",  "size": 50,  "required": False},
        ],
    },
}


def _wait_for_attribute(databases, db_id, coll_id, attr_key, max_wait=30):
    """Poll until an attribute leaves the 'processing' status."""
    for _ in range(max_wait):
        try:
            attr = databases.get_attribute(db_id, coll_id, attr_key)
            status = attr.get("status", "") if isinstance(attr, dict) else getattr(attr, "status", "")
            if status != "processing":
                return
        except Exception:
            pass
        time.sleep(1)


def setup():
    """Create the Knowvation database and all collections + attributes."""
    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
    client.set_key(os.getenv("APPWRITE_API_KEY"))

    databases = Databases(client)

    # ── 1. Create Database ───────────────────────────────────────────────────
    try:
        print(f"Creating database '{DATABASE_NAME}' ({DATABASE_ID})...")
        databases.create(database_id=DATABASE_ID, name=DATABASE_NAME)
        print(f"  ✅ Database created.")
    except Exception as e:
        print(f"  ⚠️  Database might already exist: {e}")

    # ── 2. Create Collections & Attributes ───────────────────────────────────
    for coll_id, coll_def in SCHEMA.items():
        coll_name = coll_def["name"]
        try:
            print(f"\nCreating collection '{coll_name}' ({coll_id})...")
            databases.create_collection(
                database_id=DATABASE_ID,
                collection_id=coll_id,
                name=coll_name,
            )
            print(f"  ✅ Collection created.")
        except Exception as e:
            print(f"  ⚠️  Collection might already exist: {e}")

        for attr in coll_def["attributes"]:
            key      = attr["key"]
            atype    = attr["type"]
            required = attr.get("required", False)
            is_array = attr.get("array", False)

            try:
                if atype == "string":
                    size = attr["size"]
                    databases.create_string_attribute(
                        DATABASE_ID, coll_id, key, size, required, array=is_array
                    )
                elif atype == "integer":
                    databases.create_integer_attribute(
                        DATABASE_ID, coll_id, key, required, array=is_array
                    )
                print(f"    + {key} ({atype}, size={attr.get('size','—')}, req={required}, arr={is_array})")
            except Exception as e:
                print(f"    ⚠️  Attribute '{key}' might already exist: {e}")

            # Appwrite processes attributes asynchronously — wait before next one
            _wait_for_attribute(databases, DATABASE_ID, coll_id, key)

    print("\n" + "=" * 50)
    print("✅  Appwrite Setup Complete!")
    print("=" * 50)


if __name__ == "__main__":
    setup()
