"""
backup_data.py — Knowvation Appwrite Full Backup
═══════════════════════════════════════════════════
Downloads EVERY document from every collection in the
'hiring_intelligence' database and saves them as local JSON files.

Run this BEFORE deleting your Appwrite project.

Usage:
    python backup_data.py

Output:
    database/backup_data/source_jobs.json
    database/backup_data/analyzed_jobs.json
    database/backup_data/companies.json
    database/backup_data/_backup_metadata.json   (timestamp + stats)
"""

import os
import json
import datetime
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

# Import the single-source-of-truth schema so we know which collections exist
from setup_appwrite import SCHEMA, DATABASE_ID

load_dotenv()

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "database", "backup_data")


def _fetch_all_documents(databases, db_id, collection_id):
    """
    Paginate through ALL documents in a collection.
    Appwrite returns max 100 documents per request, so we use cursor-based
    pagination to fetch everything.
    """
    all_docs = []
    limit = 100
    cursor = None

    while True:
        queries = [Query.limit(limit)]
        if cursor:
            queries.append(Query.cursor_after(cursor))

        response = databases.list_documents(
            database_id=db_id,
            collection_id=collection_id,
            queries=queries,
        )

        docs = []
        if isinstance(response, dict):
            docs = response.get("documents", [])
        elif hasattr(response, "documents"):
            docs = getattr(response, "documents")

        if not docs:
            break

        for doc in docs:
            d = doc if isinstance(doc, dict) else doc.__dict__

            # Preserve the original Appwrite $id so restore can recreate
            # the same document ID (keeps references intact).
            doc_id = d.get("$id", "")

            # Strip all other Appwrite system keys ($createdAt, $updatedAt,
            # $permissions, $collectionId, $databaseId) — they are regenerated.
            clean = {k: v for k, v in d.items() if not k.startswith("$")}
            clean["_original_id"] = doc_id  # saved for restore
            all_docs.append(clean)

        if len(docs) < limit:
            break
        cursor = docs[-1].get("$id") if isinstance(docs[-1], dict) else getattr(docs[-1], "$id", None)

    return all_docs


def backup():
    """Main backup routine."""
    print("=" * 60)
    print("  Knowvation — Appwrite Full Backup")
    print("=" * 60)

    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
    client.set_key(os.getenv("APPWRITE_API_KEY"))

    databases = Databases(client)

    os.makedirs(BACKUP_DIR, exist_ok=True)

    metadata = {
        "backup_time": datetime.datetime.now().isoformat(),
        "project_id": os.getenv("APPWRITE_PROJECT_ID"),
        "database_id": DATABASE_ID,
        "collections": {},
    }

    total_docs = 0

    for coll_id in SCHEMA:
        print(f"\n📦  Backing up collection: {coll_id}")
        try:
            docs = _fetch_all_documents(databases, DATABASE_ID, coll_id)
            file_path = os.path.join(BACKUP_DIR, f"{coll_id}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(docs, f, indent=2, ensure_ascii=False)
            count = len(docs)
            total_docs += count
            metadata["collections"][coll_id] = {"document_count": count}
            print(f"    ✅  {count} documents saved → {file_path}")
        except Exception as e:
            print(f"    ❌  Error: {e}")
            metadata["collections"][coll_id] = {"error": str(e)}

    # Save metadata
    meta_path = os.path.join(BACKUP_DIR, "_backup_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"  ✅  Backup complete!  {total_docs} total documents saved.")
    print(f"  📁  Backup folder: {os.path.abspath(BACKUP_DIR)}")
    print(f"{'=' * 60}")
    print()
    print("  Next steps:")
    print("  1. Commit these backup files to your Git repository.")
    print("  2. You can now safely delete the Appwrite project.")
    print("  3. When ready to restore, run:  python restore_data.py")


if __name__ == "__main__":
    backup()
