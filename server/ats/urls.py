from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomAuthToken, register, current_user, JobViewSet, ApplicantViewSet,
    search_applicants, public_jobs, public_job_detail, public_application_create
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'applicants', ApplicantViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomAuthToken.as_view(), name='login'),
    path('auth/user/', current_user, name='current_user'),
    path('auth/register/', register, name='register'),
    path('search/', search_applicants, name='search'),

     # Public routes (no authentication required)
    path('public/jobs/', public_jobs, name='public_jobs'),
    path('public/jobs/<int:pk>/', public_job_detail, name='public_job_detail'),
    path('public/applications/', public_application_create, name='public_application_create'),
]