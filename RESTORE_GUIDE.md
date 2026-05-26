# 🔄 Knowvation — Complete Restore Guide

This guide explains how to bring back the **entire Knowvation project** from scratch
after deleting the Appwrite project and removing the code from your local machine.

Everything you need is saved in this GitHub repository.

---

## 📋 What Was Saved in This Repo

| What | Where | Status |
|------|-------|--------|
| Frontend code (Next.js) | `frontend/` | ✅ Saved |
| Backend code (FastAPI) | `backend/` | ✅ Saved |
| Database schema (all 25 attributes) | `backend/setup_appwrite.py` | ✅ Saved |
| Database document data | `database/backup_data/*.json` | ⚠️ Run `backup_data.py` first! |
| Render deployment config | `render.yaml` + `backend/build.sh` | ✅ Saved |
| Deployment guide | `DEPLOYMENT.md` | ✅ Saved |
| Environment variable template | `backend/.env.template` | ✅ Saved |

---

## 🚀 Full Restore Steps (Start to Finish)

### Step 1: Clone the Repo

```bash
git clone https://github.com/lingalabishmagoud/Knowvation-.git
cd Knowvation-
```

---

### Step 2: Create a New Appwrite Project

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io/)
2. Click **Create Project** → give it any name (e.g. "Knowvation")
3. Note down the **Project ID** from the project settings
4. Go to **Settings → API Keys** → Create a new API key with these scopes:
   - `databases.read`, `databases.write`
   - `collections.read`, `collections.write`
   - `attributes.read`, `attributes.write`
   - `documents.read`, `documents.write`
   - `users.read`, `users.write`
5. Note down the **API Key**
6. Note down the **Endpoint** (e.g. `https://fra.cloud.appwrite.io/v1`)

---

### Step 3: Set Up Backend Environment

```bash
cd backend
```

Create a `.env` file (copy from template):

```bash
copy .env.template .env
```

Edit `.env` with your new Appwrite credentials:

```
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<your_new_project_id>
APPWRITE_API_KEY=<your_new_api_key>
GEMINI_API_KEY=<your_gemini_api_key>
```

---

### Step 4: Restore the Database

Install Python dependencies first:

```bash
pip install -r requirements.txt
```

Then run the restore script:

```bash
python restore_data.py
```

This will automatically:
- ✅ Create the `hiring_intelligence` database
- ✅ Create 3 collections: `source_jobs`, `analyzed_jobs`, `companies`
- ✅ Create all 25 attributes with correct types, sizes, and requirements
- ✅ Wait for Appwrite to process all attributes
- ✅ Upload all backed-up documents with original IDs

---

### Step 5: Update Frontend Appwrite Config

Edit `frontend/src/lib/appwrite.ts` — update the **endpoint** and **project ID**:

```typescript
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')  // Your new endpoint
    .setProject('<your_new_project_id>');               // Your new Project ID
```

Also go to **Appwrite Console → Settings → Platforms** and add your frontend URLs:
- `http://localhost:3000` (for local dev)
- `https://lingalabishmagoud.github.io` (for GitHub Pages)

---

### Step 6: Run Locally

**Backend** (Terminal 1):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev
```

---

### Step 7: Redeploy to Render (Backend)

Your Render configuration is already saved in `render.yaml` and `backend/build.sh`.

**Option A — Reconnect the same Render service:**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. If the old service exists, update its **Environment Variables**:
   - `APPWRITE_PROJECT_ID` → new project ID
   - `APPWRITE_API_KEY` → new API key
   - `APPWRITE_ENDPOINT` → your endpoint
   - `GEMINI_API_KEY` → your Gemini key
3. Trigger a manual deploy

**Option B — Create a new Render service:**
1. Go to [Render](https://render.com/) → **New** → **Web Service**
2. Connect your GitHub repo: `lingalabishmagoud/Knowvation-`
3. Configure:
   - **Name**: `knowvation-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `bash ./build.sh`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables (same as Step 3)
5. Deploy!

After Render gives you the URL (e.g. `https://knowvation-api.onrender.com`):
- Update any hardcoded backend URLs in the frontend code
- Rebuild and redeploy the frontend

---

### Step 8: Redeploy Frontend to GitHub Pages

```bash
cd frontend
npm run build
npm run deploy
```

---

## 🔑 Important Notes

### Environment Variables You Need to Save Separately
The `.env` file is **not** pushed to GitHub (for security). Save these keys somewhere safe:
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_ENDPOINT`
- `GEMINI_API_KEY`

### Render Free Tier
- Render free tier services **spin down after 15 minutes of inactivity** and take ~30-60 seconds to cold-start.
- Your existing Render service will **stop working** once you delete the Appwrite project (because the env vars point to the old project).
- You can either delete the old Render service or just update its environment variables when you restore.

### Appwrite Auth Users
- **User accounts (login/registration data) cannot be backed up** via the API on the free tier.
- When you restore, users will need to **register again**.
- The backup covers database documents only (jobs, analyzed data, companies).

### Frontend Hardcoded Project ID
- The file `frontend/src/lib/appwrite.ts` contains a **hardcoded** Appwrite Project ID.
- You MUST update this file when you create a new Appwrite project.

---

## 📁 File Reference

```
Knowvation/
├── backend/
│   ├── .env.template          ← Template for environment variables
│   ├── setup_appwrite.py      ← Complete database schema (source of truth)
│   ├── backup_data.py         ← Download all data from Appwrite → JSON
│   ├── restore_data.py        ← Recreate schema + upload data from JSON
│   ├── main.py                ← FastAPI backend server
│   ├── database.py            ← Appwrite client configuration
│   ├── scraper.py             ← Playwright web scraper
│   ├── ai_engine.py           ← Gemini AI analysis engine
│   ├── test_all_scraper.py    ← Full scrape + analyze pipeline
│   ├── build.sh               ← Render build script
│   └── requirements.txt       ← Python dependencies
├── frontend/
│   └── src/lib/appwrite.ts    ← Frontend Appwrite client (UPDATE PROJECT ID!)
├── database/
│   ├── schema.md              ← Human-readable schema docs
│   └── backup_data/           ← JSON backup files (after running backup)
├── render.yaml                ← Render deployment config
├── DEPLOYMENT.md              ← Original deployment guide
└── RESTORE_GUIDE.md           ← THIS FILE
```
