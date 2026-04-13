CREATE TABLE IF NOT EXISTS saved_jobs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  url         TEXT,
  description TEXT,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
