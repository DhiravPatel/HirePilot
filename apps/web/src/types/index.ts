// Enum types matching Go backend
export type EmailTone = "PROFESSIONAL" | "FRIENDLY" | "BOLD" | "HUMBLE";
export type EmailStyle = "CONCISE" | "DETAILED" | "STORYTELLING";

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

// Dashboard - simplified
export interface DashboardStats {
  totalResumes: number;
  totalColdEmails: number;
}

// Dashboard Activity - matches Go handler activityItem JSON tags
export interface DashboardActivity {
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

// API Error
export interface ApiError {
  error: string;
  message?: string;
  status_code?: number;
}
