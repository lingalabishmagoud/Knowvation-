import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

load_dotenv()

def setup():
    client = Client()
    client.set_endpoint(os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"))
    client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
    client.set_key(os.getenv("APPWRITE_API_KEY"))

    db = Databases(client)
    db_id = "hiring_intelligence"
    
    try:
        # Create Database
        print(f"Creating database {db_id}...")
        db.create(database_id=db_id, name="Hiring Intelligence")
    except Exception as e:
        print(f"Database might already exist: {e}")
        
    try:
        
        # Create Collections
        collections = [
            {"id": "source_jobs", "name": "Source Jobs"},
            {"id": "analyzed_jobs", "name": "Analyzed Jobs"},
            {"id": "companies", "name": "Companies"}
        ]
        
        for coll in collections:
            print(f"Creating collection {coll['name']}...")
            db.create_collection(database_id=db_id, collection_id=coll['id'], name=coll['name'])
            
            # Add Attributes (columns)
            if coll['id'] == "source_jobs":
                db.create_string_attribute(db_id, coll['id'], "title", 255, True)
                db.create_string_attribute(db_id, coll['id'], "company", 255, True)
                db.create_string_attribute(db_id, coll['id'], "description", 5000, True)
            
            elif coll['id'] == "analyzed_jobs":
                db.create_string_attribute(db_id, coll['id'], "role", 255, True)
                db.create_string_attribute(db_id, coll['id'], "company", 255, True)
                db.create_string_attribute(db_id, coll['id'], "skills", 1000, True, array=True)
                db.create_string_attribute(db_id, coll['id'], "experience", 255, True)
                db.create_string_attribute(db_id, coll['id'], "hiring_trend", 50, True)
                db.create_integer_attribute(db_id, coll['id'], "intelligence_score", True)
                db.create_string_attribute(db_id, coll['id'], "raw_description", 5000, False)

        print("✅ Appwrite Setup Complete!")
        
    except Exception as e:
        print(f"Note: {e} (It might already exist, which is fine)")

if __name__ == "__main__":
    setup()
