import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.users import Users

load_dotenv()

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")

client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

db = Databases(client)
users = Users(client)

# Collection IDs (We will create these in Appwrite)
SOURCE_JOBS_COLLECTION = "source_jobs"
ANALYZED_JOBS_COLLECTION = "analyzed_jobs"
COMPANIES_COLLECTION = "companies"
DATABASE_ID = "hiring_intelligence"
