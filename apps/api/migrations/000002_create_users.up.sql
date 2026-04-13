CREATE TABLE IF NOT EXISTS users (
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

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
