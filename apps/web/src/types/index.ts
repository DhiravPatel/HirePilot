// Enum types matching Go backend
export type EmailTone = "PROFESSIONAL" | "FRIENDLY" | "BOLD" | "HUMBLE";
export type EmailStyle = "CONCISE" | "DETAILED" | "STORYTELLING";
export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "PHONE_SCREEN"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

// User - matches Go db.User JSON tags
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  googleId: string | null;
  onboardingDone: boolean;
  headline: string | null;
  currentRole: string | null;
  targetRole: string | null;
  yearsOfExperience: number | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  emailTone: string;
  emailStyle: string;
  createdAt: string;
  updatedAt: string;
}

// Resume - matches Go db.Resume JSON tags
export interface Resume {
  id: string;
  userId: string;
  name: string;
  fileId: string;
  fileUrl: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ATS Scan - matches Go db.AtsScan JSON tags
export interface AtsScan {
  id: string;
  userId: string;
  resumeId: string | null;
  jobTitle: string | null;
  jobDescription: string | null;
  overallScore: number;
  formattingScore: number;
  keywordsScore: number;
  experienceScore: number;
  educationScore: number;
  skillsScore: number;
  readabilityScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  rawFeedback: string;
  createdAt: string;
}

// Cold Email - matches Go db.ColdEmail JSON tags
export interface ColdEmail {
  id: string;
  userId: string;
  jobPosting: string;
  recruiterName: string | null;
  recruiterEmail: string | null;
  companyName: string | null;
  jobTitle: string | null;
  subject: string;
  body: string;
  followUp1: string | null;
  followUp2: string | null;
  tone: string;
  style: string;
  isSaved: boolean;
  label: string | null;
  createdAt: string;
}

// Job Application - matches Go db.JobApplication JSON tags
export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  status: string;
  appliedAt: string | null;
  notes: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  isRemote: boolean;
  createdAt: string;
  updatedAt: string;
}

// Saved Job
export interface SavedJob {
  id: string;
  userId: string;
  title: string;
  company: string;
  url: string | null;
  description: string | null;
  savedAt: string;
}

// Dashboard - matches Go handler dashboardStats JSON tags
export interface DashboardStats {
  totalResumes: number;
  totalAtsScans: number;
  avgAtsScore: number;
  totalColdEmails: number;
  totalApplications: number;
  applicationsByStatus: StatusCount[];
}

export interface StatusCount {
  status: string;
  count: number;
}

// Dashboard Activity - matches Go handler activityItem JSON tags
export interface DashboardActivity {
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

// Keywords - matches Go service keyword response
export interface KeywordResult {
  targetRole: string;
  keywords: KeywordItem[];
  summary: string;
}

export interface KeywordItem {
  keyword: string;
  category: string;
  importance: number;
  tip: string;
}

// Keyword Check result
export interface KeywordCheckResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  score: number;
}

// API Error
export interface ApiError {
  error: string;
  message?: string;
  status_code?: number;
}
