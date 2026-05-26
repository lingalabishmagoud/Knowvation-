"""
restore_data.py — Knowvation Appwrite Full Restore
═══════════════════════════════════════════════════════
Recreates the entire Appwrite database (schema + data) from local backup files.

This script:
  1. Runs setup_appwrite.py to create the database, collections, and attributes.
  2. Waits for all attributes to be ready.
  3. Reads the JSON backup files from database/backup_data/.
  4. Uploads every document back to Appwrite, preserving original document IDs.

Prerequisites:
  - Create a NEW Appwrite project in the console.
  - Update your backend/.env with the new APPWRITE_PROJECT_ID and APPWRITE_API_KEY.
  - Ensure backup files exist in database/backup_data/

Usage:
    python restore_data.py
"""

import os
import json
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID

from setup_appwrite import setup as setup_schema, SCHEMA, DATABASE_ID

load_dotenv()

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "database", "backup_data")


def _wait_for_all_attributes_ready(databases, db_id, coll_id, expected_attrs, max_wait=60):
    """
    Wait until every attribute in a collection is in 'available' status.
    Appwrite processes attributes asynchronously after creation; we must
    wait before inserting documents or we'll get validation errors.
    """
    print(f"    ⏳  Waiting for attributes in '{coll_id}' to become available...")
    for attempt in range(max_wait):
        try:
            attrs_resp = databases.list_attributes(db_id, coll_id)
            attrs = attrs_resp.get("attributes", []) if isinstance(attrs_resp, dict) else getattr(attrs_resp, "attributes", [])
            statuses = {}
            for a in attrs:
                a_dict = a if isinstance(a, dict) else a.__dict__
                statuses[a_dict.get("key", "")] = a_dict.get("status", "")

            all_ready = all(statuses.get(attr["key"]) == "available" for attr in expected_attrs)
            if all_ready:
                print(f"    ✅  All {len(expected_attrs)} attributes ready.")
                return True
        except Exception:
            pass
        time.sleep(1)

    print(f"    ⚠️  Timed out waiting for attributes — proceeding anyway.")
    return False


def restore():
    """Main restore routine."""
    print("=" * 60)
    print("  Knowvation — Appwrite Full Restore")
    print("=" * 60)

    # Check backup directory exists
    if not os.path.exists(BACKUP_DIR):
        print(f"\n❌  Backup directory not found: {os.path.abspath(BACKUP_DIR)}")
        print("   Run 'python backup_data.py' first to create backups.")
        return

    # Show backup metadata if available
    meta_path = os.path.join(BACKUP_DIR, "_backup_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        print(f"\n  Backup taken on: {meta.get('backup_time', 'Unknown')}")
        print(f"  Original project: {meta.get('project_id', 'Unknown')}")
        for coll_id, info in meta.get("collections", {}).items():
            print(f"    • {coll_id}: {info.get('document_count', '?')} documents")
        print()

    # ── Step 1: Create database schema ───────────────────────────────────────
    print("─" * 60)
    print("  Step 1: Creating database schema...")
    print("─" * 60)
    setup_schema()

    # ── Step 2: Set up Appwrite client ───────────────────────────────────────
    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
    client.set_key(os.getenv("APPWRITE_API_KEY"))
    databases = Databases(client)

    # ── Step 3: Wait for attributes, then restore data ───────────────────────
    print()
    print("─" * 60)
    print("  Step 2: Restoring document data...")
    print("─" * 60)

    total_restored = 0
    total_errors   = 0

    for coll_id, coll_def in SCHEMA.items():
        file_path = os.path.join(BACKUP_DIR, f"{coll_id}.json")
        if not os.path.exists(file_path):
            print(f"\n⚠️  No backup file for '{coll_id}' — skipping.")
            continue

        # Wait for attributes to be ready before inserting
        _wait_for_all_attributes_ready(databases, DATABASE_ID, coll_id, coll_def["attributes"])

        with open(file_path, "r", encoding="utf-8") as f:
            documents = json.load(f)

        print(f"\n📥  Restoring {len(documents)} documents to '{coll_id}'...")

        success = 0
        errors  = 0

        for doc in documents:
            # Use the original document ID if available, otherwise generate new
            original_id = doc.pop("_original_id", None)
            doc_id = original_id if original_id else ID.unique()

            try:
                databases.create_document(
                    database_id=DATABASE_ID,
                    collection_id=coll_id,
                    document_id=doc_id,
                    data=doc,
                )
                success += 1
            except Exception as e:
                errors += 1
                # Show first few errors for debugging, then summarize
                if errors <= 3:
                    preview = str(doc.get("title") or doc.get("role") or doc.get("company_name") or list(doc.values())[0] if doc else "unknown")
                    print(f"    ❌  Failed: '{preview[:40]}' — {e}")
                elif errors == 4:
                    print(f"    ... (suppressing further error details)")

        total_restored += success
        total_errors   += errors
        print(f"    ✅  {success} restored, {errors} errors")

    print(f"\n{'=' * 60}")
    print(f"  ✅  Restore complete!")
    print(f"     {total_restored} documents restored successfully.")
    if total_errors:
        print(f"     ⚠️  {total_errors} documents had errors.")
    print(f"{'=' * 60}")
    print()
    print("  Your Knowvation project is back to its original state!")
    print("  Start the backend:  uvicorn main:app --reload")


if __name__ == "__main__":
    restore()
