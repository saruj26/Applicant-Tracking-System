from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
import csv
from datetime import datetime, timedelta

from .models import Job, Applicant
from .serializers import (
    UserSerializer, LoginSerializer, JobSerializer, 
    ApplicantSerializer, ApplicantStatusUpdateSerializer,
    BulkStatusUpdateSerializer, DashboardStatsSerializer
)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            identifier = serializer.validated_data['username']
            password = serializer.validated_data['password']
            # First try direct username auth; fall back to email lookup
            user = authenticate(username=identifier, password=password)
            if not user:
                try:
                    user_obj = User.objects.get(email__iexact=identifier)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.pk,
                    'email': user.email,
                    'username': user.username
                })
        
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset
    
    @action(detail=False, methods=['get'])
    def with_stats(self, request):
        jobs = self.get_queryset()
        data = []
        for job in jobs:
            job_data = JobSerializer(job).data
            status_counts = Applicant.objects.filter(job=job).values('status').annotate(count=Count('id'))
            job_data['status_counts'] = {item['status']: item['count'] for item in status_counts}
            data.append(job_data)
        return Response(data)

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all().select_related('job')
    serializer_class = ApplicantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job', 'status']
    search_fields = ['name', 'email', 'cover_letter', 'keywords']
    ordering_fields = ['created_at', 'updated_at', 'match_score', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Applicant.objects.all().select_related('job')
        
        # Date range filter
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        # Score filter
        min_score = self.request.query_params.get('min_score')
        if min_score:
            queryset = queryset.filter(match_score__gte=int(min_score))
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        applicant = self.get_object()
        serializer = ApplicantStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            applicant.status = serializer.validated_data['status']
            if 'notes' in serializer.validated_data:
                applicant.notes = serializer.validated_data['notes']
            applicant.save()
            return Response(ApplicantSerializer(applicant, context={'request': request}).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        serializer = BulkStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            applicant_ids = serializer.validated_data['applicant_ids']
            status = serializer.validated_data['status']
            notes = serializer.validated_data.get('notes', '')
            
            applicants = Applicant.objects.filter(id__in=applicant_ids)
            updated_count = applicants.update(status=status)
            
            if notes:
                for applicant in applicants:
                    applicant.notes = notes
                    applicant.save()
            
            return Response({
                'message': f'Updated {updated_count} applicants to {status} status',
                'updated_count': updated_count
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="applicants.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Name', 'Email', 'Phone', 'Job', 'Status', 'Cover Letter Excerpt', 'Created At', 'Match Score'])
        
        queryset = self.filter_queryset(self.get_queryset())
        
        for applicant in queryset:
            cover_excerpt = applicant.cover_letter[:100] + '...' if len(applicant.cover_letter) > 100 else applicant.cover_letter
            writer.writerow([
                applicant.name,
                applicant.email,
                applicant.phone,
                applicant.job.title,
                applicant.get_status_display(),
                cover_excerpt,
                applicant.created_at.strftime('%Y-%m-%d %H:%M'),
                applicant.match_score
            ])
        
        return response
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_applicants = Applicant.objects.count()
        total_jobs = Job.objects.count()
        
        # Status counts
        status_counts = Applicant.objects.values('status').annotate(count=Count('id'))
        status_dict = {item['status']: item['count'] for item in status_counts}
        
        # Recent applicants (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_applicants = Applicant.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        data = {
            'total_applicants': total_applicants,
            'total_jobs': total_jobs,
            'new_applicants': status_dict.get('new', 0),
            'reviewed_applicants': status_dict.get('reviewed', 0),
            'shortlisted_applicants': status_dict.get('shortlisted', 0),
            'rejected_applicants': status_dict.get('rejected', 0),
            'hired_applicants': status_dict.get('hired', 0),
            'recent_applicants': ApplicantSerializer(recent_applicants, many=True, context={'request': request}).data
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_applicants(request):
    query = request.query_params.get('q', '')
    
    if not query:
        return Response([])
    
    applicants = Applicant.objects.filter(
        Q(name__icontains=query) |
        Q(email__icontains=query) |
        Q(cover_letter__icontains=query) |
        Q(keywords__icontains=query)
    ).select_related('job').order_by('-match_score')[:50]
    
    serializer = ApplicantSerializer(applicants, many=True, context={'request': request})
    return Response(serializer.data)



# public can add careers without authentication

@api_view(['GET'])
@permission_classes([AllowAny])
def public_jobs(request):
    """Get all active jobs for public view"""
    jobs = Job.objects.filter(is_active=True).order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_job_detail(request, pk):
    """Get single job details for public view"""
    try:
        job = Job.objects.get(pk=pk, is_active=True)
        serializer = JobSerializer(job)
        return Response(serializer.data)
    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found or inactive'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def public_application_create(request):
    """Create a public job application"""
    try:
        # Validate required fields
        required_fields = ['name', 'email', 'job', 'resume']
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {'error': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate job exists and is active
        try:
            job = Job.objects.get(pk=request.data['job'], is_active=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found or inactive'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate email format
        email = request.data['email']
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return Response(
                {'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if applicant already applied for this job
        if Applicant.objects.filter(email=email, job=job).exists():
            return Response(
                {'error': 'You have already applied for this position'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the application
        serializer = ApplicantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # Optional: Send confirmation email
            try:
                send_confirmation_email(
                    email=email,
                    name=request.data['name'],
                    job_title=job.title
                )
            except Exception:
                pass  # Don't fail if email sending fails
            
            return Response(
                {
                    'success': True,
                    'message': 'Application submitted successfully!',
                    'application_id': serializer.data['id']
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def send_confirmation_email(email, name, job_title):
    """Send confirmation email to applicant"""
    subject = f'Application Received - {job_title}'
    message = f"""
    Dear {name},
    
    Thank you for applying for the {job_title} position at Nanthi Ventures.
    
    We have received your application and will review it carefully. 
    If your qualifications match our requirements, we will contact you 
    for the next steps in the hiring process.
    
    Best regards,
    Nanthi Ventures Recruitment Team
    """
    
    # For production, use Django's email backend
    # from django.core.mail import send_mail
    # send_mail(subject, message, 'noreply@nanthiventures.com', [email])
    
    print(f"Email would be sent to: {email}")
    print(f"Subject: {subject}")
    print(f"Message: {message}")