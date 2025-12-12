"""
Email service module for sending notifications to applicants.
Handles both application confirmations and status update notifications.
"""

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


def send_application_confirmation_email(applicant_data, job_title, applicant_email):
    """
    Send confirmation email when applicant submits application.
    
    Args:
        applicant_data: Dict with applicant info (name, email, etc.)
        job_title: Title of the job position
        applicant_email: Email address of the applicant
    """
    try:
        subject = f'Application Received - {job_title} Position'
        
        context = {
            'applicant_name': applicant_data.get('name', 'Applicant'),
            'job_title': job_title,
            'company_name': 'Nanthi Ventures',
        }
        
        # HTML email body
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #3b82f6; margin: 0;">Nanthi Ventures</h1>
                        <p style="color: #666; margin: 5px 0 0 0;">Talent Acquisition System</p>
                    </div>
                    
                    <h2>Thank You for Your Application!</h2>
                    
                    <p>Dear {context['applicant_name']},</p>
                    
                    <p>We have successfully received your application for the <strong>{context['job_title']}</strong> position at {context['company_name']}.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #3b82f6;">What Happens Next?</h3>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Our recruitment team will review your application</li>
                            <li>We will assess your qualifications and experience</li>
                            <li>If there's a match, we'll contact you for an interview</li>
                            <li>You can expect to hear back from us within 1-2 weeks</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions about your application, feel free to reach out to us at <strong>careers@nanthi.com</strong>.</p>
                    
                    <p>Best regards,<br/>
                    <strong>Nanthi Ventures Recruitment Team</strong></p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        This is an automated email. Please do not reply to this message.
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback
        message = f"""
Dear {context['applicant_name']},

Thank you for your application!

We have successfully received your application for the {context['job_title']} position at {context['company_name']}.

Our recruitment team will review your application and assess your qualifications. If there's a match, we will contact you for an interview. You can expect to hear back from us within 1-2 weeks.

If you have any questions, please contact us at careers@nanthi.com.

Best regards,
Nanthi Ventures Recruitment Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[applicant_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return {
            'success': True,
            'message': 'Confirmation email sent successfully'
        }
        
    except Exception as e:
        print(f"Error sending application confirmation email: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def send_status_update_email(applicant_name, applicant_email, job_title, new_status, notes=''):
    """
    Send status update email when applicant status is changed.
    
    Args:
        applicant_name: Name of the applicant
        applicant_email: Email address of the applicant
        job_title: Title of the job position
        new_status: New status (new, reviewed, shortlisted, rejected, hired)
        notes: Optional notes from recruiter
    """
    try:
        # Status-specific messaging
        status_messages = {
            'new': 'Your application has been received',
            'reviewed': 'Your application is being reviewed',
            'shortlisted': 'Congratulations! You have been shortlisted',
            'rejected': 'Thank you for applying, but we decided to move forward with other candidates',
            'hired': 'Congratulations! You have been selected for this position',
        }
        
        status_message = status_messages.get(new_status, 'Your application status has been updated')
        
        # Status colors for HTML
        status_colors = {
            'new': '#3b82f6',  # blue
            'reviewed': '#8b5cf6',  # purple
            'shortlisted': '#10b981',  # green
            'rejected': '#ef4444',  # red
            'hired': '#06b6d4',  # cyan
        }
        
        color = status_colors.get(new_status, '#3b82f6')
        
        subject = f'Application Status Update - {job_title} Position'
        
        # HTML email body
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="color: #3b82f6; margin: 0;">Nanthi Ventures</h1>
                        <p style="color: #666; margin: 5px 0 0 0;">Talent Acquisition System</p>
                    </div>
                    
                    <h2>Application Status Update</h2>
                    
                    <p>Dear {applicant_name},</p>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid {color}; margin: 20px 0; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: {color};">Status: <strong>{new_status.upper()}</strong></h3>
                        <p style="margin: 0;">{status_message}</p>
                    </div>
                    
                    <p><strong>Position:</strong> {job_title}</p>
                    
                    {f'<div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 4px;"><strong>Recruiter Notes:</strong><p>{notes}</p></div>' if notes else ''}
                    
                    <p>If you have any questions or need further information, please don't hesitate to reach out to us at <strong>careers@nanthi.com</strong>.</p>
                    
                    <p>Best regards,<br/>
                    <strong>Nanthi Ventures Recruitment Team</strong></p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        This is an automated email. Please do not reply to this message.
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback
        message = f"""
Dear {applicant_name},

We're writing to update you on your application for the {job_title} position.

Status: {new_status.upper()}
{status_message}

{f'Recruiter Notes:{notes}' if notes else ''}

If you have any questions, please contact us at careers@nanthi.com.

Best regards,
Nanthi Ventures Recruitment Team
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[applicant_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return {
            'success': True,
            'message': 'Status update email sent successfully'
        }
        
    except Exception as e:
        print(f"Error sending status update email: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
