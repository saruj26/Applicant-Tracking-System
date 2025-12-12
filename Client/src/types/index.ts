export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  application_count?: number;
  new_applications_count?: number;
}

export interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume: string;
  resume_url: string;
  resume_filename: string;
  cover_letter: string;
  job: number;
  job_title: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  notes: string;
  keywords: string;
  match_score: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_applicants: number;
  total_jobs: number;
  new_applicants: number;
  reviewed_applicants: number;
  shortlisted_applicants: number;
  rejected_applicants: number;
  hired_applicants: number;
  recent_applicants: Applicant[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}