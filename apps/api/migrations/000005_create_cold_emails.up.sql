CREATE TABLE IF NOT EXISTS cold_emails (
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
