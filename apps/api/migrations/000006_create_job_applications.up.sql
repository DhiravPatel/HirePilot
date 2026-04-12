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
