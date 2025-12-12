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
    
    def save(self, *args, **kwargs):
        # Simple keyword extraction and scoring logic
        if self.cover_letter or self.resume:
            job_desc = self.job.description.lower() if self.job else ""
            content = (self.cover_letter or "").lower()
            
            # Simple keyword matching
            important_keywords = ['python', 'django', 'react', 'javascript', 'experience', 
                                  'project', 'team', 'development', 'software']
            found_keywords = []
            for keyword in important_keywords:
                if keyword in content or keyword in job_desc:
                    found_keywords.append(keyword)
            
            self.keywords = ", ".join(found_keywords)
            self.match_score = len(found_keywords) * 10
            
        super().save(*args, **kwargs)