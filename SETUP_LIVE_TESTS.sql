-- COMPLETE LIVE TEST SYSTEM SETUP
-- Run this entire script in Supabase SQL Editor

-- ========================================
-- 1. CREATE TEST SYSTEM TABLES
-- ========================================

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out')),
  time_spent_seconds INTEGER,
  score INTEGER,
  total_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id) -- Prevent duplicate attempts
);

-- Create test_answers table
CREATE TABLE IF NOT EXISTS test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option INTEGER CHECK (selected_option BETWEEN 0 AND 3),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER,
  UNIQUE(attempt_id, question_id) -- One answer per question per attempt
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  active_participants INTEGER DEFAULT 0,
  completed_participants INTEGER DEFAULT 0,
  session_status TEXT NOT NULL DEFAULT 'waiting' CHECK (session_status IN ('waiting', 'active', 'ended')),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id) -- One session per test
);

-- ========================================
-- 2. CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_tests_scheduled_start ON tests(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);

CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(test_id, order_index);

CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_test_attempts_created_at ON test_attempts(created_at);

CREATE INDEX IF NOT EXISTS idx_test_answers_attempt_id ON test_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_question_id ON test_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_test_sessions_test_id ON test_sessions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_status ON test_sessions(session_status);

-- ========================================
-- 3. ENABLE RLS
-- ========================================

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. DROP EXISTING POLICIES
-- ========================================

-- Tests policies
DROP POLICY IF EXISTS "tests_select_policy" ON tests;
DROP POLICY IF EXISTS "tests_insert_policy" ON tests;
DROP POLICY IF EXISTS "tests_update_policy" ON tests;
DROP POLICY IF EXISTS "tests_delete_policy" ON tests;

-- Questions policies
DROP POLICY IF EXISTS "questions_select_policy" ON questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON questions;
DROP POLICY IF EXISTS "questions_update_policy" ON questions;
DROP POLICY IF EXISTS "questions_delete_policy" ON questions;

-- Test attempts policies
DROP POLICY IF EXISTS "test_attempts_select_policy" ON test_attempts;
DROP POLICY IF EXISTS "test_attempts_insert_policy" ON test_attempts;
DROP POLICY IF EXISTS "test_attempts_update_policy" ON test_attempts;
DROP POLICY IF EXISTS "test_attempts_delete_policy" ON test_attempts;

-- Test answers policies
DROP POLICY IF EXISTS "test_answers_select_policy" ON test_answers;
DROP POLICY IF EXISTS "test_answers_insert_policy" ON test_answers;
DROP POLICY IF EXISTS "test_answers_update_policy" ON test_answers;
DROP POLICY IF EXISTS "test_answers_delete_policy" ON test_answers;

-- Test sessions policies
DROP POLICY IF EXISTS "test_sessions_select_policy" ON test_sessions;
DROP POLICY IF EXISTS "test_sessions_insert_policy" ON test_sessions;
DROP POLICY IF EXISTS "test_sessions_update_policy" ON test_sessions;
DROP POLICY IF EXISTS "test_sessions_delete_policy" ON test_sessions;

-- ========================================
-- 5. CREATE RLS POLICIES
-- ========================================

-- TESTS TABLE POLICIES
CREATE POLICY "tests_select_policy" ON tests
  FOR SELECT
  USING (
    status IN ('scheduled', 'active', 'completed') OR
    (auth.uid() = created_by) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

CREATE POLICY "tests_insert_policy" ON tests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "tests_update_policy" ON tests
  FOR UPDATE
  USING (
    (auth.uid() = created_by) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

CREATE POLICY "tests_delete_policy" ON tests
  FOR DELETE
  USING (
    (auth.uid() = created_by) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

-- QUESTIONS TABLE POLICIES
CREATE POLICY "questions_select_policy" ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = questions.test_id
        AND tests.status IN ('active', 'completed')
    ) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

CREATE POLICY "questions_insert_policy" ON questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "questions_update_policy" ON questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "questions_delete_policy" ON questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- TEST ATTEMPTS TABLE POLICIES
CREATE POLICY "test_attempts_select_policy" ON test_attempts
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

CREATE POLICY "test_attempts_insert_policy" ON test_attempts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "test_attempts_update_policy" ON test_attempts
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

CREATE POLICY "test_attempts_delete_policy" ON test_attempts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- TEST ANSWERS TABLE POLICIES
CREATE POLICY "test_answers_select_policy" ON test_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = test_answers.attempt_id
        AND test_attempts.user_id = auth.uid()
    ) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

CREATE POLICY "test_answers_insert_policy" ON test_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = test_answers.attempt_id
        AND test_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "test_answers_update_policy" ON test_answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = test_answers.attempt_id
        AND test_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "test_answers_delete_policy" ON test_answers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- TEST SESSIONS TABLE POLICIES
CREATE POLICY "test_sessions_select_policy" ON test_sessions
  FOR SELECT
  USING (true); -- All authenticated users can view sessions

CREATE POLICY "test_sessions_insert_policy" ON test_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "test_sessions_update_policy" ON test_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "test_sessions_delete_policy" ON test_sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ========================================
-- 6. CREATE TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to automatically calculate scheduled_end
CREATE OR REPLACE FUNCTION calculate_scheduled_end()
RETURNS TRIGGER AS $$
BEGIN
  NEW.scheduled_end = NEW.scheduled_start + (NEW.duration_minutes || ' minutes')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate scheduled_end
DROP TRIGGER IF EXISTS trigger_calculate_scheduled_end ON tests;
CREATE TRIGGER trigger_calculate_scheduled_end
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_scheduled_end();

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tests table updated_at
DROP TRIGGER IF EXISTS trigger_tests_updated_at ON tests;
CREATE TRIGGER trigger_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for test_sessions table updated_at
DROP TRIGGER IF EXISTS trigger_test_sessions_updated_at ON test_sessions;
CREATE TRIGGER trigger_test_sessions_updated_at
  BEFORE UPDATE ON test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. INSERT SAMPLE DATA
-- ========================================

-- Insert sample test (only if no tests exist)
INSERT INTO tests (title, description, subject, duration_minutes, scheduled_start, status, created_by)
SELECT 
  'NEET Mock Test - Physics & Chemistry',
  'Comprehensive mock test covering Physics and Chemistry topics for NEET preparation',
  'physics',
  180, -- 3 hours
  NOW() + INTERVAL '1 hour', -- Start in 1 hour
  'scheduled',
  (SELECT id FROM users WHERE is_admin = true LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tests);

-- Insert sample questions (only if no questions exist)
DO $$
DECLARE
  test_id_var UUID;
BEGIN
  -- Get the test ID
  SELECT id INTO test_id_var FROM tests LIMIT 1;
  
  IF test_id_var IS NOT NULL AND NOT EXISTS (SELECT 1 FROM questions) THEN
    -- Insert sample questions
    INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_index, points) VALUES
    (test_id_var, 'What is the SI unit of force?', 'Newton', 'Joule', 'Watt', 'Pascal', 0, 1, 1),
    (test_id_var, 'Which of the following is a noble gas?', 'Oxygen', 'Nitrogen', 'Helium', 'Carbon', 2, 2, 1),
    (test_id_var, 'What is the acceleration due to gravity on Earth?', '9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²', 0, 3, 1),
    (test_id_var, 'What is the chemical formula for water?', 'H2O', 'CO2', 'NaCl', 'CH4', 0, 4, 1),
    (test_id_var, 'Which law states that energy cannot be created or destroyed?', 'Newton''s First Law', 'Law of Conservation of Energy', 'Ohm''s Law', 'Boyle''s Law', 1, 5, 1);
  END IF;
END $$;

-- ========================================
-- 8. VERIFICATION
-- ========================================

-- Verify tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
ORDER BY table_name;

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
ORDER BY tablename;

-- Verify policies exist
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
GROUP BY tablename
ORDER BY tablename;

-- Verify sample data
SELECT 
  'Sample test created' as status,
  COUNT(*) as test_count
FROM tests
UNION ALL
SELECT 
  'Sample questions created' as status,
  COUNT(*) as question_count
FROM questions;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT '🎉 LIVE TEST SYSTEM SETUP COMPLETE!' as status
UNION ALL
SELECT '✅ All tables created with proper structure' as status
UNION ALL
SELECT '✅ RLS policies configured for security' as status
UNION ALL
SELECT '✅ Triggers and functions set up' as status
UNION ALL
SELECT '✅ Sample test and questions added' as status
UNION ALL
SELECT '' as status
UNION ALL
SELECT '🚀 Next steps:' as status
UNION ALL
SELECT '1. Restart your dev server' as status
UNION ALL
SELECT '2. Go to /admin to create more tests' as status
UNION ALL
SELECT '3. Go to /tests to see live tests' as status;