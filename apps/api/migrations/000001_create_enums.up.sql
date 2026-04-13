DO $$ BEGIN
  CREATE TYPE email_tone AS ENUM ('PROFESSIONAL', 'FRIENDLY', 'BOLD', 'HUMBLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE email_style AS ENUM ('CONCISE', 'DETAILED', 'STORYTELLING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW',
    'OFFER', 'REJECTED', 'WITHDRAWN'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;
