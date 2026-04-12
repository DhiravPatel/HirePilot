import type {
  User,
  Resume,
  AtsScan,
  ColdEmail,
  JobApplication,
  DashboardStats,
  DashboardActivity,
  KeywordResult,
  KeywordCheckResult,
  ApiError,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function request<T>(
  method: string,
  path: string,
  token?: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, config);

  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        error: `Request failed with status ${response.status}`,
      };
    }
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

async function requestFormData<T>(
  path: string,
  formData: FormData,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        error: `Upload failed with status ${response.status}`,
      };
    }
    throw error;
  }

  return response.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function syncUser(
  data: { email: string; name: string; image: string; googleId: string },
  token?: string,
) {
  return request<User>("POST", "/api/v1/auth/sync-user", token, data);
}

// ─── User ──────────────────────────────────────────────────────────────────

export async function getMe(token: string) {
  return request<User>("GET", "/api/v1/users/me", token);
}

export async function updateMe(data: Partial<User>, token: string) {
  return request<User>("PUT", "/api/v1/users/me", token, data);
}

export async function completeOnboarding(token: string) {
  return request<User>("PUT", "/api/v1/users/me/onboarding", token);
}

export async function deleteAccount(token: string) {
  return request<void>("DELETE", "/api/v1/users/me", token);
}

// ─── Resumes ───────────────────────────────────────────────────────────────

export async function uploadResume(formData: FormData, token: string) {
  return requestFormData<Resume>("/api/v1/resumes/upload", formData, token);
}

export async function listResumes(token: string) {
  return request<Resume[]>("GET", "/api/v1/resumes", token);
}

export async function deleteResume(id: string, token: string) {
  return request<void>("DELETE", `/api/v1/resumes/${id}`, token);
}

export async function setDefaultResume(id: string, token: string) {
  return request<Resume>("PUT", `/api/v1/resumes/${id}/default`, token);
}

// ─── ATS Scanner ───────────────────────────────────────────────────────────

export async function scanAts(
  data: {
    resumeId?: string;
    resumeText?: string;
    jobTitle?: string;
    jobDescription?: string;
  },
  token: string,
) {
  return request<AtsScan>("POST", "/api/v1/ats/scan", token, data);
}

export async function listAtsScans(token: string, limit = 20, offset = 0) {
  return request<AtsScan[]>(
    "GET",
    `/api/v1/ats/scans?limit=${limit}&offset=${offset}`,
    token,
  );
}

export async function getAtsScan(id: string, token: string) {
  return request<AtsScan>("GET", `/api/v1/ats/scans/${id}`, token);
}

export async function deleteAtsScan(id: string, token: string) {
  return request<void>("DELETE", `/api/v1/ats/scans/${id}`, token);
}

// ─── Cold Email ────────────────────────────────────────────────────────────

export async function generateColdEmail(
  data: {
    jobPosting: string;
    recruiterName?: string;
    recruiterEmail?: string;
    companyName?: string;
  },
  token: string,
) {
  return request<ColdEmail>("POST", "/api/v1/cold-email/generate", token, data);
}

export async function listColdEmails(token: string, limit = 20, offset = 0) {
  return request<ColdEmail[]>(
    "GET",
    `/api/v1/cold-email?limit=${limit}&offset=${offset}`,
    token,
  );
}

export async function getColdEmail(id: string, token: string) {
  return request<ColdEmail>("GET", `/api/v1/cold-email/${id}`, token);
}

export async function updateColdEmail(
  id: string,
  data: { subject?: string; body?: string; isSaved?: boolean; label?: string },
  token: string,
) {
  return request<ColdEmail>("PUT", `/api/v1/cold-email/${id}`, token, data);
}

export async function deleteColdEmail(id: string, token: string) {
  return request<void>("DELETE", `/api/v1/cold-email/${id}`, token);
}

// ─── Keywords ──────────────────────────────────────────────────────────────

export async function optimizeKeywords(
  data: { targetRole: string; industry?: string; experienceLevel?: string },
  token: string,
) {
  return request<KeywordResult>(
    "POST",
    "/api/v1/keywords/optimize",
    token,
    data,
  );
}

export async function checkKeywords(
  data: { resumeText: string; targetKeywords: string[] },
  token: string,
) {
  return request<KeywordCheckResult>(
    "POST",
    "/api/v1/keywords/check",
    token,
    data,
  );
}

// ─── Job Applications (Tracker) ────────────────────────────────────────────

export async function listApplications(token: string, limit = 50, offset = 0) {
  return request<JobApplication[]>(
    "GET",
    `/api/v1/tracker?limit=${limit}&offset=${offset}`,
    token,
  );
}

export async function createApplication(
  data: {
    companyName: string;
    jobTitle: string;
    jobUrl?: string;
    notes?: string;
    salaryMin?: number;
    salaryMax?: number;
    location?: string;
    isRemote?: boolean;
  },
  token: string,
) {
  return request<JobApplication>("POST", "/api/v1/tracker", token, data);
}

export async function updateApplication(
  id: string,
  data: Partial<JobApplication>,
  token: string,
) {
  return request<JobApplication>("PUT", `/api/v1/tracker/${id}`, token, data);
}

export async function deleteApplication(id: string, token: string) {
  return request<void>("DELETE", `/api/v1/tracker/${id}`, token);
}

export async function updateApplicationStatus(
  id: string,
  status: string,
  token: string,
) {
  return request<JobApplication>(
    "PUT",
    `/api/v1/tracker/${id}/status`,
    token,
    { status },
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export async function getDashboardStats(token: string) {
  return request<DashboardStats>("GET", "/api/v1/dashboard/stats", token);
}

export async function getDashboardActivity(token: string) {
  return request<DashboardActivity[]>(
    "GET",
    "/api/v1/dashboard/activity",
    token,
  );
}
