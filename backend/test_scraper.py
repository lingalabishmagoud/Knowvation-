import asyncio
from scraper import scrape_jobs
from ai_engine import extract_job_info

async def test():
    print("Starting scraper test...")
    try:
        jobs = await scrape_jobs("http://localhost:3000/mock-jobs")
        print(f"Scraped {len(jobs)} jobs")
        if jobs:
            print("Job 1:", jobs[0])
            print("Running AI on Job 1...")
            analysis = extract_job_info(jobs[0]['description'])
            print("AI Result:", analysis)
            
            from database import db, DATABASE_ID, ANALYZED_JOBS_COLLECTION
            import uuid
            print("Saving to DB...")
            try:
                res = db.create_document(
                    database_id=DATABASE_ID,
                    collection_id=ANALYZED_JOBS_COLLECTION,
                    document_id=str(uuid.uuid4()),
                    data={**analysis, "raw_description": jobs[0]['description']}
                )
                print("DB Save Success:", res['$id'])
            except Exception as e:
                print("DB Save Failed:", e)
        else:
            print("No jobs found on mock page. Have you added any via Admin panel?")
    except Exception as e:
        print("Error during scraping:", e)

if __name__ == "__main__":
    asyncio.run(test())
