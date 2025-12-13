from django.db import models
from django.contrib.auth.models import User
import os

STATUS_CHOICES = [
    ("new", "New"),
    ("reviewed", "Reviewed"),
    ("shortlisted", "Shortlisted"),
    ("rejected", "Rejected"),
    ("hired", "Hired"),
]

class Recruiter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200, default="Nanthi Ventures")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.company_name}"

class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    @property
    def application_count(self):
        return self.applicant_set.count()
    
    @property
    def new_applications_count(self):
        return self.applicant_set.filter(status='new').count()

class Applicant(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)
    keywords = models.TextField(blank=True, help_text="Extracted keywords from resume and cover letter")
    match_score = models.IntegerField(default=0, help_text="Match score based on keywords")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.job.title}"
    
    def get_resume_filename(self):
        return os.path.basename(self.resume.name)
    
    # Note: ATS scoring is now handled in views.py using ats_scorer.py
    # This ensures resume file processing happens correctly