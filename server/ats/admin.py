from django.contrib import admin
from .models import Recruiter, Job, Applicant

@admin.register(Recruiter)
class RecruiterAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'created_at')
    search_fields = ('user__username', 'user__email', 'company_name')

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'is_active', 'created_at', 'application_count')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description', 'location')
    readonly_fields = ('application_count', 'new_applications_count')
    
    fieldsets = (
        ('Job Information', {
            'fields': ('title', 'description', 'requirements', 'location', 'salary_range', 'is_active')
        }),
        ('Statistics', {
            'fields': ('application_count', 'new_applications_count'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'job', 'status', 'match_score', 'created_at')
    list_filter = ('status', 'job', 'created_at')
    search_fields = ('name', 'email', 'cover_letter')
    readonly_fields = ('match_score', 'keywords', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'phone', 'resume')
        }),
        ('Application Details', {
            'fields': ('job', 'cover_letter', 'status', 'notes')
        }),
        ('Matching Information', {
            'fields': ('keywords', 'match_score'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_reviewed', 'mark_as_shortlisted', 'mark_as_rejected']
    
    def mark_as_reviewed(self, request, queryset):
        queryset.update(status='reviewed')
        self.message_user(request, f"{queryset.count()} applicants marked as reviewed.")
    
    def mark_as_shortlisted(self, request, queryset):
        queryset.update(status='shortlisted')
        self.message_user(request, f"{queryset.count()} applicants marked as shortlisted.")
    
    def mark_as_rejected(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} applicants marked as rejected.")
    
    mark_as_reviewed.short_description = "Mark selected as Reviewed"
    mark_as_shortlisted.short_description = "Mark selected as Shortlisted"
    mark_as_rejected.short_description = "Mark selected as Rejected"