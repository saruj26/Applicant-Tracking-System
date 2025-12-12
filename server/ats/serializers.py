from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import STATUS_CHOICES, Recruiter, Job, Applicant

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True, 'required': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)
        Recruiter.objects.create(user=user)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class JobSerializer(serializers.ModelSerializer):
    application_count = serializers.IntegerField(read_only=True)
    new_applications_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Job
        fields = '__all__'

class ApplicantSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    resume_url = serializers.SerializerMethodField()
    resume_filename = serializers.SerializerMethodField()
    
    class Meta:
        model = Applicant
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'match_score', 'keywords')
    
    def get_resume_url(self, obj):
        request = self.context.get('request')
        if obj.resume and request:
            return request.build_absolute_uri(obj.resume.url)
        return None
    
    def get_resume_filename(self, obj):
        return obj.get_resume_filename()

class ApplicantStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)

class BulkStatusUpdateSerializer(serializers.Serializer):
    applicant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    status = serializers.ChoiceField(choices=STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)

class DashboardStatsSerializer(serializers.Serializer):
    total_applicants = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    new_applicants = serializers.IntegerField()
    reviewed_applicants = serializers.IntegerField()
    shortlisted_applicants = serializers.IntegerField()
    rejected_applicants = serializers.IntegerField()
    hired_applicants = serializers.IntegerField()
    recent_applicants = ApplicantSerializer(many=True)