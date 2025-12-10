-- Create table to store ATS evaluations
CREATE TABLE IF NOT EXISTS ats_reports (
  report_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  gaps JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  keywords_to_add JSONB DEFAULT '[]'::jsonb,
  breakdown JSONB DEFAULT '{}'::jsonb,
  model_used TEXT,
  raw_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ats_reports_user_id ON ats_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_reports_created_at ON ats_reports(created_at DESC);

