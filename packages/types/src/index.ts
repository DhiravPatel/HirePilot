// Re-export all types from the web app types
// This package serves as a shared type definition layer for the monorepo

export type EmailTone = "professional" | "friendly" | "enthusiastic" | "formal" | "casual";
export type EmailStyle = "concise" | "detailed" | "storytelling" | "direct" | "persuasive";
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  headline: string;
  location: string;
  phone: string;
  years_of_experience: number;
  current_role: string;
  target_role: string;
  skills: string[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  bio: string;
  email_tone: EmailTone;
  email_style: EmailStyle;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  is_default: boolean;
  extracted_text: string;
  created_at: string;
  updated_at: string;
}

export interface AtsScan {
  id: string;
  user_id: string;
  resume_id: string;
  job_title: string;
  company_name: string;
  job_description: string;
  overall_score: number;
  keyword_score: number;
  format_score: number;
  experience_score: number;
  education_score: number;
  skills_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  created_at: string;
  updated_at: string;
}

export interface ColdEmail {
  id: string;
  user_id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_title: string;
  company_name: string;
  job_title: string;
  tone: EmailTone;
  style: EmailStyle;
  subject: string;
  body: string;
  follow_ups: FollowUp[];
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  cold_email_id: string;
  subject: string;
  body: string;
  day_offset: number;
  created_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  job_url: string;
  job_description: string;
  location: string;
  salary_range: string;
  status: ApplicationStatus;
  applied_at: string;
  notes: string;
  contact_name: string;
  contact_email: string;
  resume_id: string;
  created_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  job_url: string;
  location: string;
  salary_range: string;
  source: string;
  created_at: string;
}

export interface DashboardStats {
  total_applications: number;
  active_applications: number;
  interviews_scheduled: number;
  offers_received: number;
  resumes_uploaded: number;
  ats_scans_completed: number;
  cold_emails_generated: number;
  average_ats_score: number;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
}

export interface KeywordResult {
  job_title: string;
  optimized_keywords: KeywordItem[];
  missing_keywords: KeywordItem[];
  industry_keywords: KeywordItem[];
}

export interface KeywordItem {
  keyword: string;
  relevance: number;
  category: string;
  suggestion: string;
}

export interface ApiError {
  error: string;
  message: string;
  status_code: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
