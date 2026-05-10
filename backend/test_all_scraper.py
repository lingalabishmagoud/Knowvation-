import asyncio
import json
import sys
from scraper import scrape_jobs
from ai_engine import extract_job_info
from database import db, DATABASE_ID, ANALYZED_JOBS_COLLECTION
import uuid

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

SCRAPE_STATUS_FILE = "scrape_status.json"

async def run_scrape():
    status = {
        "total": 0,
        "success": 0,
        "rate_limited": 0,
        "errors": 0,
        "message": "",
        "quota_warning": False
    }
    
    print("Starting scraper for ALL jobs...")
    try:
        # Clear old analyzed jobs first
        try:
            old_jobs = db.list_documents(DATABASE_ID, ANALYZED_JOBS_COLLECTION)
            for doc in old_jobs['documents']:
                db.delete_document(DATABASE_ID, ANALYZED_JOBS_COLLECTION, doc['$id'])
            print(f"Cleared {len(old_jobs['documents'])} old analyzed jobs.")
        except Exception as e:
            print(f"Failed to clear old jobs: {e}")
            
        jobs = await scrape_jobs("https://lingalabishmagoud.github.io/Knowvation-/mock-jobs")
        status["total"] = len(jobs)
        print(f"Scraped {len(jobs)} jobs")
        
        for i, job in enumerate(jobs):
            print(f"\nProcessing Job {i+1}: {job['title']}")
            if i > 0:
                print("  [Wait] Delaying 4s to respect Gemini API rate limit...")
                await asyncio.sleep(4)
            
            analysis = extract_job_info(job['description'], job_title=job['title'])
            
            if analysis:
                used_fallback  = analysis.get("_used_fallback", False)
                was_rate_limit = analysis.get("_rate_limited", False)
                
                if was_rate_limit:
                    status["rate_limited"] += 1
                    status["quota_warning"] = True
                    print(f"  [!] Hard rate limit — placeholder saved")
                elif used_fallback:
                    status["success"] += 1
                    print(f"  [Fallback] Rule-based extraction used (Gemini quota)")
                else:
                    status["success"] += 1
                    print(f"  [Gemini] AI extraction successful")
                
                try:
                    clean_data = {k: v for k, v in analysis.items() if not k.startswith("_")}
                    clean_data["raw_description"] = job['description']
                    clean_data["location"]    = job.get("location", "")
                    clean_data["hr_name"]     = job.get("hr_name", "")
                    clean_data["hr_email"]    = job.get("hr_email", "")
                    clean_data["hr_linkedin"] = job.get("hr_linkedin", "")
                    clean_data["hr_contact"]  = job.get("hr_contact", "")
                    
                    # Override company from source job (more reliable than AI extraction)
                    if job.get("company"):
                        clean_data["company"] = job["company"]
                    
                    res = db.create_document(
                        database_id=DATABASE_ID,
                        collection_id=ANALYZED_JOBS_COLLECTION,
                        document_id=str(uuid.uuid4()),
                        data=clean_data
                    )
                    print(f"  DB Save: {res['$id'][:8]}...")
                except Exception as e:
                    print(f"  DB Save Failed: {e}")
                    status["errors"] += 1
            else:
                print(f"  [X] AI returned None")
                status["errors"] += 1
                
    except Exception as e:
        print(f"Scraping Error: {e}")
        status["message"] = str(e)

    # Build final status message
    if status["quota_warning"]:
        status["message"] = (
            f"Gemini API quota reached! "
            f"{status['success']}/{status['total']} jobs analyzed. "
            f"{status['rate_limited']} jobs hit rate limit."
        )
    else:
        status["message"] = f"All {status['success']} jobs successfully analyzed!"

    # Save status to file so the API can read it
    with open(SCRAPE_STATUS_FILE, "w") as f:
        json.dump(status, f)
        
    print(f"\n{'='*50}")
    print(f"FINAL STATUS: {status['message']}")
    print(f"{'='*50}")

if __name__ == "__main__":
    asyncio.run(run_scrape())
