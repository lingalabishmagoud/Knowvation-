# Knowvation - Full Stack AI Hiring Intelligence Web Application

## Overview
Knowvation is a premium full-stack AI-powered hiring intelligence platform. It aggregates raw job postings from mock public sources, uses the Gemini AI model to extract structured data (skills, experience, and hiring trends), and visualizes the aggregated intelligence through a dynamic and interactive 3D-inspired dashboard. It allows recruiters to gain actionable insights into tech hiring demand and competitor hiring velocity.

## Technology Stack
- **Frontend**: Next.js, React, TailwindCSS, Chart.js, Recharts, Framer Motion (for 3D visual effects).
- **Backend**: Python, FastAPI.
- **Scraper**: Playwright (for scraping mock external job boards).
- **AI Integration**: Google Gemini API (for NLP and data extraction).
- **Database & Auth**: Appwrite.
- **Deployment**: Vercel/GitHub Pages (Frontend), Render (Backend).

## Core Functionalities
1. **Authentication**: Secure login and signup via Appwrite.
2. **Mock Source Management**: Admin panel to manage mock external job listings, embedding private HR details invisibly.
3. **Automated Scraping**: Playwright-based scraper to fetch active job listings.
4. **AI Analysis**: Gemini API analyzes descriptions to identify required skills, experience levels, hiring trends (e.g., Aggressive, Freeze), and scores confidence.
5. **Interactive Dashboards**: Visual charts for technology demand, company hiring trends, and location analysis.
6. **Recruiter Intelligence**: A hidden directory of HR contacts scraped from the job postings.
7. **Reporting & Export**: Capabilities to export analyzed hiring data as CSV or Excel files.
