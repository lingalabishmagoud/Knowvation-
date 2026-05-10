import os
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

try:
    print("Testing connection...")
    doc = db.create_document(
        database_id="hiring_intelligence",
        collection_id="source_jobs",
        document_id=str(uuid.uuid4()),
        data={
            "title": "Test Title",
            "company": "Test Company",
            "description": "Test Description"
        }
    )
    print("Success! Document created:", doc['$id'])
except Exception as e:
    print("Appwrite Error:", e)
