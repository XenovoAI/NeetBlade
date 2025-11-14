-- Create test_series_pdfs table
CREATE TABLE IF NOT EXISTS test_series_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy to allow admins to manage test series
-- Note: This assumes you have a way to identify admins, e.g., via a custom claim.
-- You might need to adjust the RLS policy based on your authentication setup.
ALTER TABLE test_series_pdfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins full access"
ON test_series_pdfs
FOR ALL
USING (auth.jwt()->>'is_admin' = 'true')
WITH CHECK (auth.jwt()->>'is_admin' = 'true');

CREATE POLICY "Allow all users to read"
ON test_series_pdfs
FOR SELECT
USING (true);
