# HirePilot — AI-Powered Resume & Job Application Platform

> **This README is a complete engineering specification and AI prompt. Feed the entire file to an AI code generator (Cursor, Copilot Workspace, Claude, etc.) and it will scaffold the full application from scratch.**

---

## 🧠 Project Overview

**HirePilot** is a full-stack, production-grade SaaS platform that helps job seekers:

1. **Score their resume** against ATS (Applicant Tracking Systems) with detailed AI-powered feedback
2. **Generate personalized cold emails** to recruiters based on job postings and their profile
3. **Track job applications** and manage their job search pipeline
4. **Optimize their LinkedIn/resume keywords** with market-relevant suggestions

The stack is intentionally **100% free-tier friendly**:

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js 14 (App Router) |
| Backend API | Go + Chi router |
| Auth | Google OAuth via NextAuth.js |
| AI | Groq AI (Llama 3 70B) via HTTP |
| Database | Supabase (PostgreSQL) + sqlc + golang-migrate |
| File Storage | Appwrite (resume PDFs) |
| Deployment — Frontend | Vercel (free tier) |
| Deployment — Backend | Render (free tier Web Service) |
| Email | Resend (free tier) |
| Styling | Tailwind CSS + shadcn/ui |

---

## 📁 Monorepo Structure

```
hirepilot/
├── apps/
│   ├── web/                          # Next.js 14 frontend (App Router)
│   └── api/                          # Go backend (Chi router)
│       ├── cmd/
│       │   └── server/
│       │       └── main.go           # Entry point
│       ├── internal/
│       │   ├── handler/              # HTTP route handlers
│       │   │   ├── auth.go
│       │   │   ├── users.go
│       │   │   ├── resumes.go
│       │   │   ├── ats.go
│       │   │   ├── coldemail.go
│       │   │   ├── keywords.go
│       │   │   ├── tracker.go
│       │   │   └── dashboard.go
│       │   ├── service/              # Business logic layer
│       │   │   ├── ats.go
│       │   │   ├── coldemail.go
│       │   │   ├── keywords.go
│       │   │   ├── resume.go
│       │   │   └── storage.go
│       │   ├── middleware/           # Auth, rate-limit, CORS, logging
│       │   │   ├── auth.go
│       │   │   ├── ratelimit.go
│       │   │   └── cors.go
│       │   ├── db/                   # sqlc-generated type-safe queries
│       │   │   ├── db.go
│       │   │   ├── models.go
│       │   │   └── queries/
│       │   │       ├── users.sql.go
│       │   │       ├── resumes.sql.go
│       │   │       ├── ats.sql.go
│       │   │       ├── coldemail.sql.go
│       │   │       └── tracker.sql.go
│       │   └── config/
│       │       └── config.go         # Env config via envconfig
│       ├── pkg/
│       │   ├── groq/                 # Groq HTTP client wrapper
│       │   │   └── client.go
│       │   ├── appwrite/             # Appwrite storage client
│       │   │   └── client.go
│       │   ├── pdf/                  # PDF text extraction
│       │   │   └── extract.go
│       │   └── respond/              # JSON response helpers
│       │       └── respond.go
│       ├── migrations/               # Raw SQL migration files
│       │   ├── 000001_create_users.up.sql
│       │   ├── 000001_create_users.down.sql
│       │   ├── 000002_create_resumes.up.sql
│       │   └── ...
│       ├── sqlc.yaml
│       ├── go.mod
│       ├── go.sum
│       ├── Makefile
│       └── render.yaml               # Render IaC config
├── packages/
│   ├── ui/                           # Shared shadcn/ui components
│   ├── config/                       # Shared ESLint, TypeScript configs
│   └── types/                        # Shared TypeScript types/interfaces
├── turbo.json
├── package.json                      # Root workspace config (JS/TS only)
└── README.md
```

> **Note:** The Go API (`apps/api`) is not part of the JS/TS workspace. It has its own `go.mod` and is managed independently. Turborepo orchestrates the frontend build only; the Go API is deployed separately to Render.

---

## 🔧 Environment Variables

### `apps/web/.env.local`
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000

APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key
APPWRITE_BUCKET_ID=your_appwrite_bucket_id
```

### `apps/api/.env`
```env
PORT=8080
ENV=development

DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

GROQ_API_KEY=your_groq_api_key

APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key
APPWRITE_BUCKET_ID=your_appwrite_bucket_id

RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here   # Same secret as web — used to verify NextAuth JWTs
```

---

## 🗄️ Database Schema (SQL Migrations)

Migrations live in `apps/api/migrations/`. Run with `golang-migrate`.

### `000001_create_enums.up.sql`
```sql
CREATE TYPE email_tone AS ENUM ('PROFESSIONAL', 'FRIENDLY', 'BOLD', 'HUMBLE');
CREATE TYPE email_style AS ENUM ('CONCISE', 'DETAILED', 'STORYTELLING');
CREATE TYPE application_status AS ENUM (
  'SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW',
  'OFFER', 'REJECTED', 'WITHDRAWN'
);
```

### `000002_create_users.up.sql`
```sql
CREATE TABLE users (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email               TEXT UNIQUE NOT NULL,
  name                TEXT,
  image               TEXT,
  google_id           TEXT UNIQUE,
  onboarding_done     BOOLEAN NOT NULL DEFAULT FALSE,
  headline            TEXT,
  current_role        TEXT,
  target_role         TEXT,
  years_of_experience INT,
  skills              TEXT[]  NOT NULL DEFAULT '{}',
  linkedin_url        TEXT,
  github_url          TEXT,
  portfolio_url       TEXT,
  phone               TEXT,
  location            TEXT,
  bio                 TEXT,
  email_tone          email_tone  NOT NULL DEFAULT 'PROFESSIONAL',
  email_style         email_style NOT NULL DEFAULT 'CONCISE',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### `000003_create_resumes.up.sql`
```sql
CREATE TABLE resumes (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  file_id       TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size     INT  NOT NULL,
  mime_type     TEXT NOT NULL DEFAULT 'application/pdf',
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### `000004_create_ats_scans.up.sql`
```sql
CREATE TABLE ats_scans (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id        TEXT REFERENCES resumes(id) ON DELETE SET NULL,
  job_title        TEXT,
  job_description  TEXT,
  overall_score    INT NOT NULL,
  formatting_score INT NOT NULL,
  keywords_score   INT NOT NULL,
  experience_score INT NOT NULL,
  education_score  INT NOT NULL,
  skills_score     INT NOT NULL,
  readability_score INT NOT NULL,
  strengths        TEXT[] NOT NULL DEFAULT '{}',
  weaknesses       TEXT[] NOT NULL DEFAULT '{}',
  suggestions      TEXT[] NOT NULL DEFAULT '{}',
  missing_keywords TEXT[] NOT NULL DEFAULT '{}',
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  raw_feedback     TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `000005_create_cold_emails.up.sql`
```sql
CREATE TABLE cold_emails (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_posting     TEXT NOT NULL,
  recruiter_name  TEXT,
  recruiter_email TEXT,
  company_name    TEXT,
  job_title       TEXT,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  follow_up_1     TEXT,
  follow_up_2     TEXT,
  tone            email_tone  NOT NULL,
  style           email_style NOT NULL,
  is_saved        BOOLEAN NOT NULL DEFAULT FALSE,
  label           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `000006_create_job_applications.up.sql`
```sql
CREATE TABLE job_applications (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title    TEXT NOT NULL,
  job_url      TEXT,
  status       application_status NOT NULL DEFAULT 'SAVED',
  applied_at   TIMESTAMPTZ,
  notes        TEXT,
  salary_min   INT,
  salary_max   INT,
  location     TEXT,
  is_remote    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### `000007_create_saved_jobs.up.sql`
```sql
CREATE TABLE saved_jobs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  url         TEXT,
  description TEXT,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## ⚙️ Go Backend — Full Setup

### `apps/api/go.mod`
```go
module github.com/yourusername/hirepilot/api

go 1.22

require (
  github.com/go-chi/chi/v5          v5.1.0
  github.com/go-chi/cors            v1.2.1
  github.com/jackc/pgx/v5           v5.6.0
  github.com/golang-jwt/jwt/v5      v5.2.1
  github.com/joho/godotenv          v1.5.1
  github.com/kelseyhightower/envconfig v1.4.0
  github.com/go-playground/validator/v10 v10.22.0
  golang.org/x/time                 v0.5.0
  github.com/ledongthuc/pdf         v0.0.0-20240201131950-da5b75280b06
  github.com/resendlabs/resend-go   v1.3.0
)
```

### `apps/api/internal/config/config.go`
```go
package config

import (
  "log"
  "github.com/joho/godotenv"
  "github.com/kelseyhightower/envconfig"
)

type Config struct {
  Port             string `envconfig:"PORT"              default:"8080"`
  Env              string `envconfig:"ENV"               default:"development"`
  DatabaseURL      string `envconfig:"DATABASE_URL"      required:"true"`
  GroqAPIKey       string `envconfig:"GROQ_API_KEY"      required:"true"`
  AppwriteEndpoint string `envconfig:"APPWRITE_ENDPOINT" required:"true"`
  AppwriteProject  string `envconfig:"APPWRITE_PROJECT_ID" required:"true"`
  AppwriteAPIKey   string `envconfig:"APPWRITE_API_KEY"  required:"true"`
  AppwriteBucket   string `envconfig:"APPWRITE_BUCKET_ID" required:"true"`
  ResendAPIKey     string `envconfig:"RESEND_API_KEY"`
  FrontendURL      string `envconfig:"FRONTEND_URL"      default:"http://localhost:3000"`
  JWTSecret        string `envconfig:"JWT_SECRET"        required:"true"`
  NextAuthSecret   string `envconfig:"NEXTAUTH_SECRET"   required:"true"`
}

func Load() *Config {
  _ = godotenv.Load()
  cfg := &Config{}
  if err := envconfig.Process("", cfg); err != nil {
    log.Fatalf("config: failed to process env vars: %v", err)
  }
  return cfg
}
```

### `apps/api/cmd/server/main.go`
```go
package main

import (
  "context"
  "fmt"
  "log"
  "net/http"
  "os"
  "os/signal"
  "syscall"
  "time"

  "github.com/go-chi/chi/v5"
  chimiddleware "github.com/go-chi/chi/v5/middleware"
  "github.com/go-chi/cors"
  "github.com/jackc/pgx/v5/pgxpool"

  "github.com/yourusername/hirepilot/api/internal/config"
  "github.com/yourusername/hirepilot/api/internal/db"
  "github.com/yourusername/hirepilot/api/internal/handler"
  "github.com/yourusername/hirepilot/api/internal/middleware"
  "github.com/yourusername/hirepilot/api/pkg/groq"
  appwritepkg "github.com/yourusername/hirepilot/api/pkg/appwrite"
)

func main() {
  cfg := config.Load()

  // Database connection pool
  pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
  if err != nil {
    log.Fatalf("db: unable to connect: %v", err)
  }
  defer pool.Close()

  if err := pool.Ping(context.Background()); err != nil {
    log.Fatalf("db: ping failed: %v", err)
  }
  log.Println("db: connected")

  // Init clients
  queries  := db.New(pool)
  groqClient := groq.NewClient(cfg.GroqAPIKey)
  storageClient := appwritepkg.NewClient(cfg.AppwriteEndpoint, cfg.AppwriteProject, cfg.AppwriteAPIKey, cfg.AppwriteBucket)

  // Router
  r := chi.NewRouter()

  // Global middleware
  r.Use(chimiddleware.Logger)
  r.Use(chimiddleware.Recoverer)
  r.Use(chimiddleware.RequestID)
  r.Use(chimiddleware.RealIP)
  r.Use(cors.Handler(cors.Options{
    AllowedOrigins:   []string{cfg.FrontendURL},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
    AllowCredentials: true,
    MaxAge:           300,
  }))

  // Health check
  r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"ok"}`))
  })

  // Handlers
  authHandler      := handler.NewAuthHandler(queries, cfg)
  userHandler      := handler.NewUserHandler(queries)
  resumeHandler    := handler.NewResumeHandler(queries, storageClient)
  atsHandler       := handler.NewAtsHandler(queries, groqClient, storageClient)
  emailHandler     := handler.NewColdEmailHandler(queries, groqClient)
  keywordHandler   := handler.NewKeywordHandler(groqClient)
  trackerHandler   := handler.NewTrackerHandler(queries)
  dashboardHandler := handler.NewDashboardHandler(queries)

  // Auth middleware
  authMiddleware := middleware.NewAuthMiddleware(cfg.NextAuthSecret, queries)

  // Routes
  r.Route("/api/v1", func(r chi.Router) {
    // Public
    r.Post("/auth/sync-user", authHandler.SyncUser)

    // Protected
    r.Group(func(r chi.Router) {
      r.Use(authMiddleware.Authenticate)

      r.Get("/users/me",             userHandler.GetMe)
      r.Put("/users/me",             userHandler.UpdateMe)
      r.Put("/users/me/onboarding",  userHandler.CompleteOnboarding)
      r.Delete("/users/me",          userHandler.DeleteMe)

      r.Post("/resumes/upload",      resumeHandler.Upload)
      r.Get("/resumes",              resumeHandler.List)
      r.Delete("/resumes/{id}",      resumeHandler.Delete)
      r.Put("/resumes/{id}/default", resumeHandler.SetDefault)

      r.Post("/ats/scan",            atsHandler.Scan)
      r.Get("/ats/scans",            atsHandler.List)
      r.Get("/ats/scans/{id}",       atsHandler.Get)
      r.Delete("/ats/scans/{id}",    atsHandler.Delete)

      r.Post("/cold-email/generate", emailHandler.Generate)
      r.Get("/cold-email",           emailHandler.List)
      r.Get("/cold-email/{id}",      emailHandler.Get)
      r.Put("/cold-email/{id}",      emailHandler.Update)
      r.Delete("/cold-email/{id}",   emailHandler.Delete)

      r.Post("/keywords/optimize",   keywordHandler.Optimize)
      r.Post("/keywords/check",      keywordHandler.Check)

      r.Get("/tracker",              trackerHandler.List)
      r.Post("/tracker",             trackerHandler.Create)
      r.Put("/tracker/{id}",         trackerHandler.Update)
      r.Delete("/tracker/{id}",      trackerHandler.Delete)
      r.Put("/tracker/{id}/status",  trackerHandler.UpdateStatus)

      r.Get("/dashboard/stats",      dashboardHandler.Stats)
      r.Get("/dashboard/activity",   dashboardHandler.Activity)
    })
  })

  // Server
  srv := &http.Server{
    Addr:         fmt.Sprintf(":%s", cfg.Port),
    Handler:      r,
    ReadTimeout:  30 * time.Second,
    WriteTimeout: 60 * time.Second,  // 60s for AI calls
    IdleTimeout:  120 * time.Second,
  }

  // Graceful shutdown
  go func() {
    log.Printf("server: listening on :%s", cfg.Port)
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
      log.Fatalf("server: %v", err)
    }
  }()

  quit := make(chan os.Signal, 1)
  signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
  <-quit

  log.Println("server: shutting down...")
  ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
  defer cancel()
  srv.Shutdown(ctx)
  log.Println("server: stopped")
}
```

---

## 🤖 Groq Client (Go)

```go
// apps/api/pkg/groq/client.go
package groq

import (
  "bytes"
  "context"
  "encoding/json"
  "fmt"
  "io"
  "net/http"
  "time"
)

const (
  baseURL        = "https://api.groq.com/openai/v1/chat/completions"
  ModelLlama70B  = "llama3-70b-8192"
  ModelMixtral   = "mixtral-8x7b-32768"
)

type Client struct {
  apiKey     string
  httpClient *http.Client
}

func NewClient(apiKey string) *Client {
  return &Client{
    apiKey: apiKey,
    httpClient: &http.Client{Timeout: 60 * time.Second},
  }
}

type Message struct {
  Role    string `json:"role"`
  Content string `json:"content"`
}

type request struct {
  Model          string            `json:"model"`
  Messages       []Message         `json:"messages"`
  Temperature    float64           `json:"temperature"`
  MaxTokens      int               `json:"max_tokens"`
  ResponseFormat map[string]string `json:"response_format"`
}

type response struct {
  Choices []struct {
    Message struct {
      Content string `json:"content"`
    } `json:"message"`
  } `json:"choices"`
  Error *struct {
    Message string `json:"message"`
  } `json:"error"`
}

// Complete sends a system + user prompt and returns the raw JSON string from Groq.
func (c *Client) Complete(ctx context.Context, system, user string) (string, error) {
  body := request{
    Model: ModelLlama70B,
    Messages: []Message{
      {Role: "system", Content: system},
      {Role: "user", Content: user},
    },
    Temperature:    0.4,
    MaxTokens:      4096,
    ResponseFormat: map[string]string{"type": "json_object"},
  }

  b, err := json.Marshal(body)
  if err != nil {
    return "", err
  }

  req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL, bytes.NewReader(b))
  if err != nil {
    return "", err
  }
  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("Authorization", "Bearer "+c.apiKey)

  resp, err := c.httpClient.Do(req)
  if err != nil {
    return "", err
  }
  defer resp.Body.Close()

  raw, err := io.ReadAll(resp.Body)
  if err != nil {
    return "", err
  }

  var gr response
  if err := json.Unmarshal(raw, &gr); err != nil {
    return "", err
  }
  if gr.Error != nil {
    return "", fmt.Errorf("groq: %s", gr.Error.Message)
  }
  if len(gr.Choices) == 0 {
    return "", fmt.Errorf("groq: empty response")
  }

  return gr.Choices[0].Message.Content, nil
}

// CompleteJSON is a generic helper that unmarshals the Groq JSON response into T.
func CompleteJSON[T any](ctx context.Context, c *Client, system, user string) (T, error) {
  var zero T
  raw, err := c.Complete(ctx, system, user)
  if err != nil {
    return zero, err
  }
  var result T
  if err := json.Unmarshal([]byte(raw), &result); err != nil {
    return zero, fmt.Errorf("groq: failed to parse response: %w", err)
  }
  return result, nil
}
```

---

## 📦 Appwrite Storage Client (Go)

```go
// apps/api/pkg/appwrite/client.go
package appwrite

import (
  "bytes"
  "context"
  "encoding/json"
  "fmt"
  "io"
  "mime/multipart"
  "net/http"
  "time"
)

type Client struct {
  endpoint  string
  projectID string
  apiKey    string
  bucketID  string
  http      *http.Client
}

func NewClient(endpoint, projectID, apiKey, bucketID string) *Client {
  return &Client{
    endpoint:  endpoint,
    projectID: projectID,
    apiKey:    apiKey,
    bucketID:  bucketID,
    http:      &http.Client{Timeout: 30 * time.Second},
  }
}

type UploadedFile struct {
  ID   string `json:"$id"`
  Name string `json:"name"`
  Size int    `json:"sizeOriginal"`
}

func (c *Client) UploadFile(ctx context.Context, fileID, filename string, content []byte, mimeType string) (*UploadedFile, error) {
  body := &bytes.Buffer{}
  writer := multipart.NewWriter(body)

  // File ID field
  _ = writer.WriteField("fileId", fileID)

  // File part
  part, err := writer.CreateFormFile("file", filename)
  if err != nil {
    return nil, err
  }
  if _, err = io.Copy(part, bytes.NewReader(content)); err != nil {
    return nil, err
  }
  writer.Close()

  url := fmt.Sprintf("%s/storage/buckets/%s/files", c.endpoint, c.bucketID)
  req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, body)
  if err != nil {
    return nil, err
  }
  req.Header.Set("Content-Type", writer.FormDataContentType())
  req.Header.Set("X-Appwrite-Project", c.projectID)
  req.Header.Set("X-Appwrite-Key", c.apiKey)

  resp, err := c.http.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()

  if resp.StatusCode >= 300 {
    b, _ := io.ReadAll(resp.Body)
    return nil, fmt.Errorf("appwrite upload failed: %s", string(b))
  }

  var file UploadedFile
  if err := json.NewDecoder(resp.Body).Decode(&file); err != nil {
    return nil, err
  }
  return &file, nil
}

func (c *Client) DeleteFile(ctx context.Context, fileID string) error {
  url := fmt.Sprintf("%s/storage/buckets/%s/files/%s", c.endpoint, c.bucketID, fileID)
  req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
  if err != nil {
    return err
  }
  req.Header.Set("X-Appwrite-Project", c.projectID)
  req.Header.Set("X-Appwrite-Key", c.apiKey)

  resp, err := c.http.Do(req)
  if err != nil {
    return err
  }
  defer resp.Body.Close()

  if resp.StatusCode >= 300 {
    b, _ := io.ReadAll(resp.Body)
    return fmt.Errorf("appwrite delete failed: %s", string(b))
  }
  return nil
}

func (c *Client) GetFileURL(fileID string) string {
  return fmt.Sprintf("%s/storage/buckets/%s/files/%s/view?project=%s",
    c.endpoint, c.bucketID, fileID, c.projectID)
}

func (c *Client) DownloadFile(ctx context.Context, fileID string) ([]byte, error) {
  url := fmt.Sprintf("%s/storage/buckets/%s/files/%s/download?project=%s",
    c.endpoint, c.bucketID, fileID, c.projectID)
  req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
  if err != nil {
    return nil, err
  }
  req.Header.Set("X-Appwrite-Key", c.apiKey)

  resp, err := c.http.Do(req)
  if err != nil {
    return nil, err
  }
  defer resp.Body.Close()
  return io.ReadAll(resp.Body)
}
```

---

## 🔐 Auth Middleware (Go)

NextAuth signs JWTs with `NEXTAUTH_SECRET`. The Go API verifies the same secret.

```go
// apps/api/internal/middleware/auth.go
package middleware

import (
  "context"
  "net/http"
  "strings"

  "github.com/golang-jwt/jwt/v5"
  "github.com/yourusername/hirepilot/api/internal/config"
  "github.com/yourusername/hirepilot/api/internal/db"
)

type contextKey string
const UserContextKey contextKey = "user"

type AuthMiddleware struct {
  secret  string
  queries *db.Queries
}

func NewAuthMiddleware(nextAuthSecret string, queries *db.Queries) *AuthMiddleware {
  return &AuthMiddleware{secret: nextAuthSecret, queries: queries}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
      http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
      return
    }

    tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
      if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, jwt.ErrSignatureInvalid
      }
      return []byte(m.secret), nil
    })
    if err != nil || !token.Valid {
      http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
      return
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
      http.Error(w, `{"error":"invalid claims"}`, http.StatusUnauthorized)
      return
    }

    email, _ := claims["email"].(string)
    if email == "" {
      http.Error(w, `{"error":"missing email in token"}`, http.StatusUnauthorized)
      return
    }

    user, err := m.queries.GetUserByEmail(r.Context(), email)
    if err != nil {
      http.Error(w, `{"error":"user not found"}`, http.StatusUnauthorized)
      return
    }

    ctx := context.WithValue(r.Context(), UserContextKey, user)
    next.ServeHTTP(w, r.WithContext(ctx))
  })
}
```

---

## 🚦 Rate Limiting (Go)

```go
// apps/api/internal/middleware/ratelimit.go
package middleware

import (
  "net/http"
  "sync"

  "golang.org/x/time/rate"
)

type RateLimiter struct {
  mu       sync.Mutex
  limiters map[string]*rate.Limiter
  r        rate.Limit
  b        int
}

func NewRateLimiter(requestsPerSecond float64, burst int) *RateLimiter {
  return &RateLimiter{
    limiters: make(map[string]*rate.Limiter),
    r:        rate.Limit(requestsPerSecond),
    b:        burst,
  }
}

func (rl *RateLimiter) getLimiter(key string) *rate.Limiter {
  rl.mu.Lock()
  defer rl.mu.Unlock()
  if l, ok := rl.limiters[key]; ok {
    return l
  }
  l := rate.NewLimiter(rl.r, rl.b)
  rl.limiters[key] = l
  return l
}

// Limits:
// ATS scan:         10/hour  → r=0.00278, b=10
// Cold email:       20/hour  → r=0.00556, b=20
// Keyword optimize: 30/hour  → r=0.00833, b=30
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    user := r.Context().Value(UserContextKey)
    key := r.RemoteAddr
    if user != nil {
      // Use user ID as the rate limit key (more accurate than IP)
      key = "user:" + fmt.Sprintf("%v", user)
    }

    if !rl.getLimiter(key).Allow() {
      http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
      return
    }
    next.ServeHTTP(w, r)
  })
}
```

---

## 📄 PDF Extraction (Go)

```go
// apps/api/pkg/pdf/extract.go
package pdf

import (
  "bytes"
  "fmt"
  "strings"

  "github.com/ledongthuc/pdf"
)

func ExtractText(content []byte) (string, error) {
  reader := bytes.NewReader(content)
  r, err := pdf.NewReader(reader, int64(len(content)))
  if err != nil {
    return "", fmt.Errorf("pdf: failed to open: %w", err)
  }

  var sb strings.Builder
  for i := 1; i <= r.NumPage(); i++ {
    page := r.Page(i)
    if page.V.IsNull() {
      continue
    }
    text, err := page.GetPlainText(nil)
    if err != nil {
      continue
    }
    sb.WriteString(text)
    sb.WriteString("\n")
  }

  result := strings.TrimSpace(sb.String())
  if result == "" {
    return "", fmt.Errorf("pdf: no text extracted — may be a scanned/image PDF")
  }
  return result, nil
}
```

---

## 🧠 sqlc Configuration

### `apps/api/sqlc.yaml`
```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/db/queries/"
    schema: "migrations/"
    gen:
      go:
        package: "db"
        out: "internal/db"
        emit_json_tags: true
        emit_prepared_queries: false
        emit_interface: true
        emit_exact_table_names: false
        emit_empty_slices: true
```

### Sample sqlc query — `internal/db/queries/users.sql`
```sql
-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (id, email, name, image, google_id)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateUser :one
UPDATE users SET
  name                = COALESCE($2, name),
  headline            = COALESCE($3, headline),
  current_role        = COALESCE($4, current_role),
  target_role         = COALESCE($5, target_role),
  years_of_experience = COALESCE($6, years_of_experience),
  skills              = COALESCE($7, skills),
  linkedin_url        = COALESCE($8, linkedin_url),
  github_url          = COALESCE($9, github_url),
  portfolio_url       = COALESCE($10, portfolio_url),
  phone               = COALESCE($11, phone),
  location            = COALESCE($12, location),
  bio                 = COALESCE($13, bio),
  email_tone          = COALESCE($14, email_tone),
  email_style         = COALESCE($15, email_style)
WHERE id = $1
RETURNING *;

-- name: CompleteOnboarding :one
UPDATE users SET onboarding_done = TRUE WHERE id = $1 RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
```

### Sample sqlc query — `internal/db/queries/ats.sql`
```sql
-- name: CreateAtsScan :one
INSERT INTO ats_scans (
  id, user_id, resume_id, job_title, job_description,
  overall_score, formatting_score, keywords_score, experience_score,
  education_score, skills_score, readability_score,
  strengths, weaknesses, suggestions, missing_keywords, matched_keywords, raw_feedback
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
) RETURNING *;

-- name: ListAtsScansByUser :many
SELECT * FROM ats_scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;

-- name: GetAtsScan :one
SELECT * FROM ats_scans WHERE id = $1 AND user_id = $2;

-- name: DeleteAtsScan :exec
DELETE FROM ats_scans WHERE id = $1 AND user_id = $2;

-- name: GetAvgAtsScore :one
SELECT COALESCE(AVG(overall_score), 0)::INT AS avg_score FROM ats_scans WHERE user_id = $1;
```

---

## 🤖 AI Prompts (Groq — Llama 3 70B)

### Prompt 1: ATS Resume Scorer

**System Prompt:**
```
You are an expert ATS (Applicant Tracking System) analyst and career coach with 15+ years of experience in technical recruiting. You specialize in analyzing resumes for ATS compatibility, keyword optimization, and human readability.

Your job is to analyze the provided resume text and return a detailed, structured JSON evaluation. Be brutally honest but constructive. Your analysis must be actionable — every weakness must have a corresponding suggestion.

RULES:
- Always return valid JSON, nothing else
- Scores are integers from 0 to 100
- Arrays must have at least 3 items where required
- Missing keywords should be specific technical skills, tools, certifications, or role-specific phrases
- Suggestions must be specific (not generic) and immediately actionable
- Consider the target job description heavily if provided
- If no job description is provided, analyze for general ATS compatibility for the apparent target role
```

**User Prompt Template:**
```
Analyze this resume for ATS compatibility.

RESUME TEXT:
{{resumeText}}

TARGET JOB TITLE: {{jobTitle || "Not specified — infer from resume"}}

JOB DESCRIPTION:
{{jobDescription || "Not provided — perform general ATS analysis"}}

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": <0-100>,
  "formattingScore": <0-100>,
  "keywordsScore": <0-100>,
  "experienceScore": <0-100>,
  "educationScore": <0-100>,
  "skillsScore": <0-100>,
  "readabilityScore": <0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": [
    "<specific actionable suggestion 1>",
    "<specific actionable suggestion 2>",
    "<specific actionable suggestion 3>",
    "<specific actionable suggestion 4>",
    "<specific actionable suggestion 5>"
  ],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "...up to 15"],
  "matchedKeywords": ["<keyword 1>", "<keyword 2>", "...up to 15"],
  "scoreSummary": "<2-3 sentence plain English summary of the overall assessment>",
  "topPriority": "<The single most important thing this person should fix right now>"
}
```

---

### Prompt 2: Cold Email Generator

**System Prompt:**
```
You are a world-class career coach and copywriter who specializes in writing cold outreach emails for job seekers. You have helped thousands of candidates land interviews at top companies including FAANG, startups, and Fortune 500 companies.

Your emails are:
- Personalized and specific to the company/role (never generic)
- Concise, confident, and compelling
- Free of clichés like "I hope this email finds you well" or "I am writing to express my interest"
- Structured to get a response within the first 3 lines
- Professional but human — they sound like a real person, not a bot

You always return a valid JSON object, nothing else.
```

**User Prompt Template:**
```
Write a personalized cold email for a job application using the following information.

CANDIDATE PROFILE:
- Name: {{user.name}}
- Current Role: {{user.currentRole || "Not specified"}}
- Target Role: {{user.targetRole || "Not specified"}}
- Years of Experience: {{user.yearsOfExperience}}
- Top Skills: {{user.skills[:8].join(", ")}}
- Bio: {{user.bio || "Not provided"}}
- LinkedIn: {{user.linkedinUrl || "Not provided"}}

EMAIL PREFERENCES:
- Tone: {{user.emailTone}} (PROFESSIONAL=formal yet warm, FRIENDLY=casual and approachable, BOLD=direct and confident, HUMBLE=grateful and eager)
- Style: {{user.emailStyle}} (CONCISE=3-4 sentences body, DETAILED=full 2 paragraph body, STORYTELLING=opens with a compelling narrative hook)

JOB POSTING:
{{jobPosting}}

RECRUITER INFO (if known):
- Name: {{recruiterName || "Unknown — address generically as Hiring Manager"}}
- Email: {{recruiterEmail || "Not provided"}}
- Company: {{companyName || "Extract from job posting"}}

INSTRUCTIONS:
1. Extract the company name, job title, and 3-5 key requirements from the job posting
2. Write the main email matching the tone and style
3. Write a Day 5 follow-up email (brief, 2-3 sentences)
4. Write a Day 10 follow-up email (brief, 2-3 sentences, slightly different angle)
5. The subject line should be specific, personalized, and under 60 characters

Return ONLY a valid JSON object:
{
  "extractedInfo": {
    "companyName": "<extracted company name>",
    "jobTitle": "<extracted job title>",
    "keyRequirements": ["<req 1>", "<req 2>", "<req 3>"]
  },
  "subject": "<email subject line>",
  "body": "<full email body — use \n for line breaks>",
  "followUp1": "<day 5 follow-up email body>",
  "followUp2": "<day 10 follow-up email body>",
  "usedProfileFields": ["<field 1>", "<field 2>"],
  "highlightedSkills": ["<skill from user profile that was mentioned in email>"]
}
```

---

### Prompt 3: Keyword Optimizer

**System Prompt:**
```
You are an expert technical recruiter and resume strategist. You know exactly what keywords, tools, frameworks, certifications, and action verbs ATS systems and human recruiters look for when hiring for any given role.
You always return valid JSON, nothing else.
```

**User Prompt Template:**
```
Generate a comprehensive list of ATS keywords and phrases for the following target role.

TARGET ROLE: {{targetRole}}
INDUSTRY: {{industry || "Technology — infer if not specified"}}
EXPERIENCE LEVEL: {{experienceLevel || "Mid-level"}}

Return ONLY a valid JSON object:
{
  "targetRole": "<normalized role title>",
  "keywords": [
    {
      "keyword": "<keyword or phrase>",
      "category": "<Technical Skills | Soft Skills | Tools | Certifications | Action Verbs | Industry Terms>",
      "importance": <1-10>,
      "tip": "<one sentence on how to naturally incorporate this in a resume>"
    }
  ],
  "summary": "<2 sentence overview of what recruiters look for in this role>"
}

Include 25-35 keywords. Prioritize by importance score descending.
```

---

### Prompt 4: Resume Section Rewriter

**System Prompt:**
```
You are an expert resume writer. You rewrite resume sections to be more impactful, ATS-friendly, and achievement-focused. You use the STAR method (Situation, Task, Action, Result) and strong action verbs. You quantify achievements wherever possible. You always return valid JSON.
```

**User Prompt Template:**
```
Rewrite the following resume section to be more impactful and ATS-friendly.

SECTION TYPE: {{sectionType}}
TARGET ROLE: {{targetRole}}
ORIGINAL CONTENT:
{{sectionContent}}

MISSING KEYWORDS TO INCORPORATE (if applicable):
{{missingKeywords}}

Return ONLY a valid JSON object:
{
  "rewrittenContent": "<the fully rewritten section>",
  "changesExplained": ["<change 1 and why>", "<change 2 and why>", "<change 3 and why>"],
  "keywordsAdded": ["<keyword added>"]
}
```

---

## 🏗️ API Routes

All routes prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <nextauth_jwt>`.

```
GET    /health                          # Health check (public)

POST   /api/v1/auth/sync-user           # Sync Google user to DB after OAuth

GET    /api/v1/users/me                 # Get current user profile
PUT    /api/v1/users/me                 # Update profile fields
PUT    /api/v1/users/me/onboarding      # Complete onboarding
DELETE /api/v1/users/me                 # Delete account

POST   /api/v1/resumes/upload           # Multipart upload → Appwrite + DB
GET    /api/v1/resumes                  # List user resumes
DELETE /api/v1/resumes/{id}             # Delete from Appwrite + DB
PUT    /api/v1/resumes/{id}/default     # Set default resume

POST   /api/v1/ats/scan                 # Run ATS scan (resumeId or raw text)
GET    /api/v1/ats/scans                # List scans (paginated)
GET    /api/v1/ats/scans/{id}           # Get single scan
DELETE /api/v1/ats/scans/{id}           # Delete scan

POST   /api/v1/cold-email/generate      # Generate cold email
GET    /api/v1/cold-email               # List saved emails
GET    /api/v1/cold-email/{id}          # Get single email
PUT    /api/v1/cold-email/{id}          # Update/save email
DELETE /api/v1/cold-email/{id}          # Delete email

POST   /api/v1/keywords/optimize        # Get keyword list for a role
POST   /api/v1/keywords/check           # Cross-reference resume with keywords

GET    /api/v1/tracker                  # List job applications
POST   /api/v1/tracker                  # Create application
PUT    /api/v1/tracker/{id}             # Update application
DELETE /api/v1/tracker/{id}             # Delete application
PUT    /api/v1/tracker/{id}/status      # Update status only (kanban drag)

GET    /api/v1/dashboard/stats          # Summary stats
GET    /api/v1/dashboard/activity       # Recent activity feed
```

---

## 🚀 Feature Specification

### 1. 🔐 Authentication (Google OAuth)

- Use `next-auth` v5 with Google provider in `apps/web`
- On first login → redirect to `/onboarding`
- On subsequent logins → redirect to `/dashboard`
- After Google OAuth, Next.js calls `POST /api/v1/auth/sync-user` to upsert the user in Supabase
- All subsequent API calls from the frontend send `Authorization: Bearer <session.token>` header

**Onboarding — 3 Steps:**

*Step 1 — Basic Info:* Name · Headline · Location · Phone · Years of experience

*Step 2 — Career Goals:* Current role · Target role · Skills (tag input, max 20) · LinkedIn · GitHub · Portfolio

*Step 3 — Email Preferences:* Tone (Professional / Friendly / Bold / Humble) · Style (Concise / Detailed / Storytelling) · Short bio (max 300 chars)

---

### 2. 📊 Dashboard (`/dashboard`)

- Stats row: Total ATS Scans · Average ATS Score · Cold Emails Generated · Applications Tracked
- Quick action cards: Scan Resume · Write Cold Email · Track Application
- Recent activity: Last 5 scans with score badges · Last 5 cold emails with company name
- Resume Score Trend: sparkline chart of ATS score over time (recharts)
- Active streak widget: "Active for X days in a row"

---

### 3. 📄 ATS Resume Scanner (`/resume-scan`)

1. Drag-and-drop PDF upload (stored in Appwrite)
2. Optional: paste job description for targeted scoring
3. Optional: specify target job title
4. API downloads PDF from Appwrite → extracts text → sends to Groq → stores result
5. Results page shows:
   - Animated circular score gauge (SVG)
   - Score breakdown bar chart (Formatting · Keywords · Experience · Education · Skills · Readability)
   - Tabs: Strengths · Weaknesses · Suggestions · Missing Keywords · Matched Keywords
   - "Improve with AI" → side panel with section rewriter (Prompt 4)
   - Download PDF report button
   - "Scan again with different JD" shortcut

**Resume Management (`/resumes`):**
Upload up to 5 resumes · Set default · Delete · View metadata

---

### 4. ✉️ Cold Email Generator (`/cold-email`)

1. Paste job posting (no character limit)
2. Optional: recruiter name · recruiter email · company name override
3. Tone and style pre-filled from profile (overridable)
4. Output:
   - Subject line with copy button
   - Main email body with copy button
   - Expandable follow-up section (Day 5 + Day 10)
   - "Regenerate" button · "Edit" inline mode · "Save" with label · "Copy All"
   - Character count + reading time estimate
5. Smart extraction: auto-detects company name, job title, recruiter name from pasted posting
6. Shows which profile fields influenced the email

---

### 5. 🧑‍💼 Profile Page (`/profile`)

Sections (each saves independently):
- Personal Info: Name · Headline · Location · Phone · Bio
- Career Details: Current role · Target role · Years of experience · Skills
- Links: LinkedIn · GitHub · Portfolio
- Email Preferences: Tone · Style
- Resume Management (link to `/resumes`)
- Danger Zone: Delete account

---

### 6. 📋 Job Application Tracker (`/tracker`)

Kanban board with columns: Saved → Applied → Phone Screen → Interview → Offer → Rejected → Withdrawn

- Drag-and-drop via `@dnd-kit/core`
- Add via modal: Company · Job Title · URL · Notes · Salary range · Remote flag
- Click card: expand with full details · notes editor · "Generate Cold Email" shortcut
- Stats bar: Total applied · In progress · Offers · Rejection rate

---

### 7. 🔍 Keyword Optimizer (`/keywords`)

- Input: target role
- Output: 25–35 ATS keywords with category, importance score, and usage tip
- Word cloud visualization + ranked list
- "Check my resume" → cross-references with default resume (Prompt 3 → scan keywords)
- "Copy Keywords" for easy pasting into resume editor

---

### 8. 📧 Email History (`/cold-email/history`)

- Filter: date range · company · tone · style
- Sort: newest · company name
- Stats: total emails · most common target role · favorite tone
- Each card: company · job title · date · tone badge · copy/view/delete

---

## 📱 Page Structure (Next.js App Router)

```
apps/web/src/app/
├── (auth)/
│   ├── layout.tsx
│   └── signin/page.tsx
├── (onboarding)/
│   ├── layout.tsx
│   └── onboarding/page.tsx
├── (app)/
│   ├── layout.tsx              # Sidebar nav layout
│   ├── dashboard/page.tsx
│   ├── resume-scan/
│   │   ├── page.tsx
│   │   ├── history/page.tsx
│   │   └── [id]/page.tsx
│   ├── resumes/page.tsx
│   ├── cold-email/
│   │   ├── page.tsx
│   │   ├── history/page.tsx
│   │   └── [id]/page.tsx
│   ├── keywords/page.tsx
│   ├── tracker/page.tsx
│   └── profile/page.tsx
└── page.tsx                    # Public landing page
```

---

## 🎨 UI/UX Design System

**Color Palette:**
```css
:root {
  --brand-primary:   #6366f1;   /* Indigo */
  --brand-secondary: #8b5cf6;   /* Violet */
  --brand-accent:    #06b6d4;   /* Cyan */
  --success:         #10b981;
  --warning:         #f59e0b;
  --danger:          #ef4444;
  --bg-base:         #0f0f12;   /* Near black */
  --bg-card:         #1a1a23;
  --bg-elevated:     #22222f;
  --text-primary:    #f1f5f9;
  --text-secondary:  #94a3b8;
  --border:          #2d2d3d;
}
```

**Typography:**
- Display: `Sora` (Google Fonts) — headings and hero text
- Body: `DM Sans` (Google Fonts) — UI and paragraphs
- Mono: `JetBrains Mono` — email previews, code

**Libraries:** shadcn/ui · sonner (toasts) · recharts (charts) · @dnd-kit/core (kanban) · react-dropzone · react-pdf

**Patterns:** Skeleton loading (no spinners) · Illustrated empty states · Animated SVG score gauges · Circular progress rings

---

## 📦 Frontend Package Setup

### Root `package.json`
```json
{
  "name": "hirepilot",
  "private": true,
  "workspaces": ["apps/web", "packages/*"],
  "scripts": {
    "dev":        "turbo dev",
    "build":      "turbo build",
    "lint":       "turbo lint",
    "type-check": "turbo type-check"
  },
  "devDependencies": {
    "turbo":      "^2.0.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev":        { "cache": false, "persistent": true },
    "lint":       {},
    "type-check": {}
  }
}
```

### `apps/web/package.json` (key deps)
```json
{
  "dependencies": {
    "next":            "14.2.0",
    "next-auth":       "^5.0.0-beta",
    "react":           "^18.3.0",
    "react-dom":       "^18.3.0",
    "react-dropzone":  "^14.2.0",
    "react-pdf":       "^9.0.0",
    "recharts":        "^2.12.0",
    "@dnd-kit/core":   "^6.1.0",
    "@dnd-kit/sortable":"^8.0.0",
    "sonner":          "^1.5.0",
    "zustand":         "^4.5.0",
    "zod":             "^3.23.0",
    "clsx":            "^2.1.0",
    "tailwind-merge":  "^2.3.0"
  }
}
```

---

## 🚢 Deployment

### Frontend → Vercel

Set environment variables in Vercel dashboard (same as `apps/web/.env.local` without the `NEXT_PUBLIC_API_URL` pointing to localhost — use your Render URL instead).

`NEXT_PUBLIC_API_URL=https://hirepilot-api.onrender.com`

### Backend → Render

**`render.yaml`** (place in `apps/api/`):

```yaml
services:
  - type: web
    name: hirepilot-api
    env: go
    region: oregon
    plan: free
    rootDir: apps/api
    buildCommand: go build -o bin/server ./cmd/server
    startCommand: ./bin/server
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 8080
      - key: ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: APPWRITE_ENDPOINT
        sync: false
      - key: APPWRITE_PROJECT_ID
        sync: false
      - key: APPWRITE_API_KEY
        sync: false
      - key: APPWRITE_BUCKET_ID
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
      - key: FRONTEND_URL
        value: https://hirepilot.vercel.app
```

> **Render Free Tier Note:** The free tier spins down after 15 minutes of inactivity with a ~30s cold start on the next request. To mitigate, add a lightweight keep-alive ping from the frontend or upgrade to Render Starter ($7/mo). For a portfolio project the free tier is perfectly fine.

### Supabase Setup
1. Create project at supabase.com
2. Copy the **Session pooler** connection string for `DATABASE_URL` (required for serverless/long-lived Go connections)
3. Run migrations: `make migrate-up`

### Appwrite Setup
1. Create project at cloud.appwrite.io
2. Create Storage bucket named `resumes`
3. Permissions: `create` for authenticated users, `read` + `delete` for document owner
4. Copy Project ID and generate API Key with `storage.files.read`, `storage.files.write`, `storage.files.delete` scopes

### Groq Setup
1. Sign up at console.groq.com
2. Generate API key — free tier gives 14,400 requests/day on Llama 3 70B

---

## 🛠️ Makefile

```makefile
# apps/api/Makefile

.PHONY: dev build migrate-up migrate-down sqlc lint

dev:
	go run ./cmd/server

build:
	go build -o bin/server ./cmd/server

migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

sqlc:
	sqlc generate

lint:
	golangci-lint run ./...

test:
	go test ./... -v -race

tidy:
	go mod tidy
```

---

## 🧪 Testing Strategy

```
apps/
├── web/
│   └── __tests__/
│       ├── components/          # React Testing Library
│       └── pages/               # Integration tests
└── api/
    ├── internal/
    │   ├── handler/
    │   │   └── *_test.go        # httptest-based handler tests
    │   └── service/
    │       └── *_test.go        # Unit tests with mocked Groq/Appwrite
    └── pkg/
        └── groq/
            └── client_test.go   # Groq client tests (mock HTTP)
```

Go test example:
```go
func TestAtsHandler_Scan(t *testing.T) {
  // Use httptest.NewRecorder() + chi router
  // Mock groq.Client to return fixture JSON
  // Assert response status + JSON fields
}
```

---

## 📈 Future Roadmap (Post-MVP)

- [ ] **LinkedIn Profile Analyzer** — paste LinkedIn URL, get optimization suggestions
- [ ] **Interview Prep AI** — generates likely interview questions from job posting
- [ ] **Cover Letter Generator** — full personalized cover letter (longer form than cold email)
- [ ] **Resume Builder** — template-based resume creator with PDF export
- [ ] **Job Board Integration** — fetch jobs from Indeed/LinkedIn via scraping or API
- [ ] **Chrome Extension** — one-click cold email generation from any job board page
- [ ] **Weekly Digest Email** — weekly tips + resume improvement suggestions via Resend
- [ ] **Team / Agency Mode** — career coaches managing multiple clients

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

**Commit Convention:** Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`)

---

## 📄 License

MIT License — see `LICENSE` for details.

---

*Built with ❤️ by the HirePilot team. Powered by Groq AI, Supabase, Appwrite, Go, and Vercel.*