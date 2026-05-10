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

try:
    databases = db.list()
    print("Existing databases:")
    for d in databases['databases']:
        print("-", d['$id'], d['name'])
except Exception as e:
    print("Error listing databases:", e)
