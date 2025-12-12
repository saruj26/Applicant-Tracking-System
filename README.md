# Applicant Tracking System — Take-home Assignment

**Goal:** Create and deploy a minimal, usable Applicant Tracking System (ATS) for a recruiter who needs to sort and review hundreds of applications quickly.

---

## 1) Tech choices & rationale

**Recommended stack (fast to implement + familiar):**

* **Backend:** Django + Django REST Framework (Python)
* **Frontend:** React (TypeScript) — can deploy on Vercel
* **Database:** Postgre Sql
* **File storage:** Local for dev; use S3-compatible or platform storage for production
* **Deployment:** Railway for backend; Vercel for frontend

**Why:** You already have Django experience , Django REST makes APIs quick; React+TypeScript gives a pleasant UI and is standard for take-home tasks.

---

## 2) Minimal viable feature list (MVP)

These features will demonstrate your understanding and can be completed quickly:

1. **User (recruiter) authentication** — simple email/password based login (Django admin + token-based for API).
2. **Jobs management** — create/edit/delete job postings.
3. **Applicants upload** — upload applications (name, email, phone, resume file, cover letter text, job applied to).
4. **Application list & filtering** — list applications with filters: job, status, keyword (name/email), date range.
5. **Application detail view** — view applicant info and download resume.
6. **Status update & shortlisting** — change application status (New, Reviewed, Shortlisted, Rejected, Hired).
7. **Bulk actions** — bulk change status or export CSV for selected applications.
8. **Search / ranking aid** — basic keyword match + simple score highlighting top matches (client-side).
9. **README with design decisions and deployment steps** (must include assumptions and AI tools used).

Optional / stretch features if time permits:

* Email templates + send candidate replies
* Import applicants from CSV
* Role-based access (multiple recruiters)
* Comments/notes per application
* Simple dashboard with counts (New, Shortlisted, Rejected)

---

## 3) Data model (Django models)

```python
class Recruiter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Applicant(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

STATUS_CHOICES = [
    ("new","New"),
    ("reviewed","Reviewed"),
    ("shortlisted","Shortlisted"),
    ("rejected","Rejected"),
    ("hired","Hired"),
]
```

---

## 4) Key API endpoints (Django REST Framework)

* `POST /api/auth/login/` — get token
* `GET /api/jobs/` — list jobs
* `POST /api/jobs/` — create job
* `GET /api/jobs/{id}/` — job detail
* `GET /api/applicants/?job=1&status=shortlisted&search=alice` — list + filters
* `POST /api/applicants/` — create applicant (multipart/form-data for resume)
* `GET /api/applicants/{id}/` — details
* `POST /api/applicants/{id}/status/` — update status
* `POST /api/applicants/bulk-status/` — bulk update
* `GET /api/applicants/export/?job=1` — export CSV

---

## 5) Frontend pages (React + TypeScript)

* Login page
* Dashboard (counts: New / Reviewed / Shortlisted)
* Jobs list + create job modal
* Applications list with filters, search, bulk select checkbox
* Application detail panel (right side) showing resume preview and status buttons

---

## 6) UX & design decisions (short)

* Prioritize fast scanning: list shows name, email, applied job, status, date, short excerpt of cover letter.
* Bulk actions because recruiters need to triage many apps at once.
* File download/preview must be immediate; prefer PDF resumes.
* Minimal authentication — recruiters only; no candidate accounts required for the take-home.
* Search + filter first (most used), then add ranking later.

Assumptions:

* Recruiter is a single user or a small team; no need to support thousands of concurrent users.
* Resume parsing / NLP ranking is *nice-to-have* but not required — use simple keyword scoring.

---

## 7) Local setup (developer instructions)

### Backend (Django)

1. Create venv and install:

   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install django djangorestframework django-cors-headers python-dotenv
   ```
2. Start project and app:

   ```bash
   django-admin startproject backend
   cd backend
   python manage.py startapp ats
   ```
3. Add `rest_framework` and `corsheaders` to `INSTALLED_APPS`, setup media settings for `resumes/`.
4. Run migrations and create superuser:

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
5. Run server:

   ```bash
   python manage.py runserver
   ```

### Frontend (React + TypeScript)

1. Create app (use Vite):

   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   npm run dev
   ```
2. Use fetch/axios to call backend endpoints. Use form with `enctype=multipart/form-data` to upload resumes.
3. Deploy frontend to Vercel; backend to Render/Heroku.

---

## 8) Deployment checklist

1. Use environment variables for DB, secret key, allowed hosts.
2. Configure static/media storage for resumes (S3 or platform storage).
3. Set `DEBUG=False` in production and configure allowed hosts.
4. Create CI or use manual push to platforms (Render/Vercel).
5. Add a quick README with public URL and instructions.

---

## 9) README contents to include in your repo (must-have)

* Project overview & purpose
* Tech stack and why chosen
* Features implemented (MVP + stretch)
* Assumptions
* How to run locally (both backend & frontend commands)
* API endpoints list
* How you deployed (public URL) and deployment steps
* Notes on design decisions and trade-offs
* Any AI tools used and for what purpose

---

## 10) Suggested timeline (if you need to finish fast)

**Day 1 (4–6 hours):** Django models, serializers, basic endpoints, admin; applicant upload and list with filters.

**Day 2 (4–6 hours):** Frontend list + detail view, file upload, status update, bulk actions.

**Day 3 (2–4 hours):** Polish UI, add CSV export, prepare README, deploy backend + frontend, final testing.

If you only have 1 day, deliver backend APIs + README + a very simple frontend page that demonstrates upload and listing.

---

## 11) Example commit checklist (for git)

* `feat(api): add Job and Applicant models`
* `feat(api): implement applicant upload endpoint`
* `feat(frontend): add applicant upload form`
* `feat(frontend): add application list and filters`
* `chore: deploy backend to Render`
* `docs: add README and deployment URL`

---

## 12) What to put in README's "Design decisions" section (example text)

* **Choice of Django:** fastest to implement secure backend with file handling and admin interface. Django REST Framework provides serializers and viewsets that reduce boilerplate.
* **File handling:** store resumes as files on the server's media folder in dev, but use object storage (S3) in production to avoid disk limits.
* **Search / ranking:** implemented a simple keyword match scoring system (count matches in name, cover letter, resume text if parsed) to avoid integrating heavy NLP within the take-home time-limit.

---

## 13) Deliverables you should submit to the recruiter

1. Public URL to the deployed app (frontend) and API base URL (if separate).
2. GitHub repo link with clear README.
3. Short note listing what features you implemented and what you would add with more time.
4. (Optional) Short video or GIF walkthrough highlighting upload, filter, shortlist — helps recruiters.

