# API Documentation

## Base URL
Backend is hosted at `http://localhost:8000` (local) or via Render deployment link.

## Endpoints

### 1. Health Check
- **`GET /`**
  - Returns API health status.

### 2. Admin Source Jobs
- **`GET /admin/source-jobs`**
  - Retrieves all mock source jobs.
- **`POST /admin/add-job`**
  - Adds a new job listing to the source collection.
  - Body: `SourceJob` model (title, company, location, description, hr_name, etc.)
- **`PUT /admin/source-jobs/{job_id}`**
  - Updates a specific source job.
- **`DELETE /admin/source-jobs/{job_id}`**
  - Deletes a specific source job.

### 3. Recruiter Directory
- **`GET /admin/recruiters`**
  - Retrieves HR contact details extracted from source jobs.

### 4. Scraping & AI Engine
- **`POST /scrape`**
  - Triggers the Playwright scraper and Gemini AI analysis pipeline.
- **`GET /scrape-status`**
  - Returns the status of the last scraping job.
- **`GET /api/quota-status`**
  - Checks the Gemini API key quota and status.

### 5. Analytics & Dashboard
- **`GET /analytics/jobs`**
  - Retrieves all AI-analyzed jobs with extracted insights.
- **`GET /reports/summary`**
  - Returns aggregated analytics data for dashboard charts (skill demand, trend distribution).

### 6. Export
- **`GET /reports/export/csv`**
  - Downloads the analyzed jobs data as a CSV file.
- **`GET /reports/export/excel`**
  - Downloads the analyzed jobs data as an Excel file.
