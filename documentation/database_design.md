# Knowvation — Database Schema (Updated for Phase 3)

## 1. Users Table (Appwrite Auth)
- id (string)
- name (string)
- email (string)
- password (handled securely by Appwrite)
- role (handled by Appwrite teams/labels)

## 2. Source Jobs Collection (Appwrite: `source_jobs`)
> Admin-entered jobs from external companies. Public data shown on mock board. HR data stored internally.

**Public Fields (shown on mock job board):**
- id (string)
- title (string) — e.g. "Senior Python Developer"
- company (string) — e.g. "TechCorp Solutions"
- location (string) — e.g. "Bengaluru, India / Remote"
- description (string, 5000 chars) — full job description for AI analysis

**Internal HR / Recruiter Intel Fields (NOT shown publicly):**
- hr_name (string) — e.g. "Priya Sharma"
- hr_designation (string) — e.g. "HR Manager"
- hr_email (string) — e.g. "priya@techcorp.com"
- hr_linkedin (string) — e.g. "https://linkedin.com/in/priya-sharma"
- hr_contact (string) — e.g. "+91 98765 43210"

## 3. Analyzed Jobs Collection (Appwrite: `analyzed_jobs`)
> AI-extracted structured data from scraped job descriptions.

- id (string)
- role (string) — extracted job title
- company (string) — extracted or matched company
- location (string) — carried over from source job
- skills (string array) — e.g. ["Python", "Django", "React", "AWS"]
- experience (string) — e.g. "2-4 years"
- hiring_trend (string) — "Aggressive" | "Moderate" | "Steady" | "Freeze"
- intelligence_score (integer, 0-100) — AI confidence/activity score
- raw_description (string) — original job description text
- hr_name (string) — carried over from source job
- hr_email (string) — carried over from source job
- hr_linkedin (string) — carried over from source job
- hr_contact (string) — carried over from source job

## 4. Companies Collection (Appwrite: `companies`)
> Planned for Phase 3+ (company-level aggregation)

- id (string)
- company_name (string)
- website (string)
- hiring_score (integer)
- trend (string)

## 5. Data Flow Architecture

```
Admin Form (two sections)
    │
    ├── [Section A] Job Info (public)
    │   → title, company, location, description
    │
    └── [Section B] HR Intel (private)
        → hr_name, hr_designation, hr_email, hr_linkedin, hr_contact
                │
                ▼
        Stored in source_jobs (Appwrite)
                │
                ▼
    Mock Job Board (/mock-jobs)
    Shows: title, company, location, description
    Hides: HR data (embedded as hidden data-* attrs for scraper)
                │
                ▼
    Playwright Scraper (Python backend)
    Extracts: all fields including hidden data-* attrs
                │
                ▼
    Gemini AI (extract_job_info)
    Extracts: role, skills, experience, hiring_trend, intelligence_score
                │
                ▼
    analyzed_jobs (Appwrite)
    Stores: AI results + location + HR fields carried over
                │
                ▼
    Dashboard (frontend)
    ├── /dashboard           → Overview charts
    ├── /dashboard/recruiters → HR contact directory
    └── /dashboard/reports   → Analytics + CSV/Excel export
```
