import type {
  User,
  Resume,
  ColdEmail,
  DashboardStats,
  DashboardActivity,
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

// ─── Cold Email ────────────────────────────────────────────────────────────

export async function generateColdEmail(
  data: { jobPosting: string },
  token: string,
) {
  return request<ColdEmail>("POST", "/api/v1/cold-email/generate", token, data);
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
