📄 Applicant Tracking System (ATS)

A minimal yet powerful Applicant Tracking System (ATS) built as a take-home assignment to help recruiters efficiently manage, review, and shortlist job applications at scale.

🔗 Live Frontend: https://applicant-tracking-system-nanthi.vercel.app/

🔗 Backend API: https://ats-production-server.up.railway.app

🚀 Project Overview

Recruiters often handle hundreds of applications per job, making manual screening slow and error-prone.
This project focuses on fast candidate triaging by providing:

Centralized job & applicant management

Resume upload and preview

Smart filtering & bulk actions

Automatic resume scoring based on job description & technical skills

The system is intentionally minimal yet practical, optimized for speed, clarity, and real recruiter workflows.

🧰 Tech Stack
Backend

Django

Django REST Framework

PostgreSQL

django-cors-headers

Python Resume Parsing (PDF/Text)

Frontend

React + TypeScript

Vite

Axios

Tailwind CSS

Deployment

Backend: Railway

Frontend: Vercel

File Storage: Local (dev), platform storage (production)

✨ Features Implemented (MVP)
🔐 Authentication

Recruiter login using email & password

Token-based authentication for APIs

💼 Job Management

Create, view, update, and delete job postings

Each applicant is linked to a specific job

📥 Applicant Management

Upload applicant details:

Name, email, phone

Resume (PDF)

Cover letter

Applied job

Resume download & preview

📊 Application Listing & Filters

Filter by:

Job

Status (New, Reviewed, Shortlisted, Rejected, Hired)

Keyword (name/email)

Date range

Fast list optimized for scanning

🔄 Status Workflow

Update applicant status individually

Bulk status update for multiple applicants

📤 CSV Export

Export filtered applicants to CSV for offline review

🧠 Resume Auto-Scoring (Key Highlight)

A resume scoring system is implemented to assist recruiters in ranking candidates.

How it works:

Resume text is automatically extracted (PDF/Text)

Job description and required technical skills are analyzed

Candidate resume is scored based on:

Keyword matches with job description

Technical skill overlap

Frequency & relevance

A numeric score is calculated and displayed

Top-scoring candidates are highlighted for quick review

Why this approach:

Lightweight (no heavy NLP libraries)

Transparent and explainable

Suitable for a take-home assignment time limit

🧱 Data Model
class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Applicant(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("reviewed", "Reviewed"),
        ("shortlisted", "Shortlisted"),
        ("rejected", "Rejected"),
        ("hired", "Hired"),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    resume = models.FileField(upload_to="resumes/")
    cover_letter = models.TextField(blank=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

🔗 API Endpoints
Authentication

POST /api/auth/login/

Jobs

GET /api/jobs/

POST /api/jobs/

GET /api/jobs/{id}/

PUT /api/jobs/{id}/

DELETE /api/jobs/{id}/

Applicants

GET /api/applicants/?job=&status=&search=

POST /api/applicants/ (multipart/form-data)

GET /api/applicants/{id}/

POST /api/applicants/{id}/status/

POST /api/applicants/bulk-status/

GET /api/applicants/export/?job=

🖥️ Frontend Pages

Login page

Dashboard with application counts

Job listing & create job modal

Applicant list with filters & bulk actions

Applicant detail panel:

Resume preview/download

Status update

Resume score display

🎨 UX & Design Decisions

Recruiters scan faster than they read → compact list view

Bulk actions are critical for real-world usage

Resume preview/download should be instant

Minimal authentication to reduce friction

Simple, explainable scoring instead of complex AI

⚙️ Local Setup
Backend
python -m venv venv
source venv/bin/activate
pip install django djangorestframework django-cors-headers python-dotenv
django-admin startproject backend
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev

🚢 Deployment
Backend (Railway)

PostgreSQL configured via env vars

DEBUG=False

CORS & CSRF configured for Vercel frontend

Frontend (Vercel)

Environment variable:

VITE_API_URL=https://ats-production-server.up.railway.app

📌 Assumptions

Single recruiter or small team

Resume files are mostly PDFs

Keyword-based ranking is sufficient for MVP

No candidate login required

🤖 AI Tools Used

Used AI assistance for:

API structure planning

Resume scoring logic refinement

README documentation clarity

All logic reviewed and implemented manually

🛣️ Future Improvements

Resume NLP parsing & embeddings

Email notifications to candidates

Recruiter comments & notes

Role-based access

Analytics dashboard

📦 Deliverables

✅ Live deployed application

✅ REST API backend

✅ GitHub repository with full README

✅ Resume scoring implementation

👤 Author

Sarujanan Ganeshwaran
Software Engineer Intern Candidate
📍 Sri Lanka