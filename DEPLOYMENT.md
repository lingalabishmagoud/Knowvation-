# Knowvation Deployment Guide (Module 8)

This guide covers deploying the **Knowvation Hiring Intelligence Platform** to the cloud.

The application is split into a **Next.js Frontend** and a **FastAPI Python Backend**.
We recommend deploying the Frontend to **Vercel** and the Backend to **Render** or **Railway**. Appwrite is already hosted on the cloud.

---

## 🚀 1. Deploying the Frontend (GitHub Pages)

Since our Next.js frontend is configured as a static site, you can host it **100% for free on GitHub Pages** directly from your repository!

*(Note: GitHub Pages can **only** host static frontend files. It **cannot** run Python or host the FastAPI backend. You must still use a service like Render for the backend.)*

### Steps:
1. **Configure Next.js for GitHub Pages**:
   Open `frontend/next.config.ts` and ensure it has `output: 'export'`:
   ```typescript
   import type { NextConfig } from "next";
   const nextConfig: NextConfig = {
     output: "export",
   };
   export default nextConfig;
   ```
2. **Set Environment Variables**:
   Create a `.env.local` inside the `frontend` folder containing your Appwrite keys:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID=69fde9920010a87547f3`
3. **Build the Project**:
   Run the build command:
   ```bash
   npm run build
   ```
   *This generates an `out` folder containing your static HTML/JS/CSS.*
4. **Deploy to GitHub Pages**:
   - Install the `gh-pages` package: `npm install -D gh-pages`
   - Open `frontend/package.json` and add this script:
     `"deploy": "gh-pages -d out"`
   - Run the deployment:
     ```bash
     npm run deploy
     ```
   - Go to your GitHub repository -> Settings -> Pages. Ensure the source is set to the `gh-pages` branch.
   - Your site will be live at `https://<your-username>.github.io/<repository-name>/`.
5. **Update API URLs** (Post-Backend Deployment):
   Search your frontend codebase and replace all instances of `http://localhost:8000` with your deployed Render backend URL. **You must run `npm run build` and `npm run deploy` again after doing this.**

---

## 🐍 2. Deploying the Backend (Render)

Render is a great platform for hosting Python FastAPI backends.

### Steps:
1. **Push to GitHub**:
   Ensure your `backend` folder is committed to your repository.
2. **Create Web Service**:
   - Go to [Render](https://render.com/) and sign in.
   - Click **New** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure the Service**:
   - Name: `knowvation-api`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
4. **Environment Variables**:
   Add the variables from your local `.env` file into Render's Environment Variables section:
   - `APPWRITE_ENDPOINT`
   - `APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY`
   - `GEMINI_API_KEY`
5. **Install Playwright Browsers (Important!)**:
   Because the backend uses Playwright to scrape, you need Playwright to install the Chromium browser during the build process.
   Change the Build Command in Render to:
   `pip install -r requirements.txt && playwright install chromium`
6. **Deploy**:
   - Click **Create Web Service**. Wait for the build and deployment to complete. Render will provide a URL like `https://knowvation-api.onrender.com`.

---

## 🔧 3. Post-Deployment Steps

1. **Update Frontend API Calls**:
   Change `http://localhost:8000` or `http://127.0.0.1:8000` in the frontend code to your live Render URL. Push the changes to GitHub, which will auto-trigger a new Vercel build.
2. **CORS Configuration**:
   Ensure the FastAPI backend in `main.py` has your Vercel URL added to its CORS origins list.
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "https://your-vercel-app-url.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. **Appwrite Platform Rules**:
   Go to your Appwrite Console > Project Settings > Platforms. Add your live Vercel URL as a recognized Web platform. Without this, Appwrite will reject requests from the live site for security reasons.

## 🎉 Congratulations!
Once these steps are completed, your Knowvation platform is fully live and accessible globally!
