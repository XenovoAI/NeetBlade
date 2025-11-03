-- Real-Time Test System RLS Policies
-- Run this after creating the test system tables

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all test tables
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CLEANUP EXISTING POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tests_select_policy" ON tests;
DROP POLICY IF EXISTS "tests_insert_policy" ON tests;
DROP POLICY IF EXISTS "tests_update_policy" ON tests;
DROP POLICY IF EXISTS "tests_delete_policy" ON tests;

DROP POLICY IF EXISTS "questions_select_policy" ON questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON questions;
DROP POLICY IF EXISTS "questions_update_policy" ON questions;
DROP POLICY IF EXISTS "questions_delete_policy" ON questions;

DROP POLICY IF EXISTS "test_attempts_select_policy" ON test_attempts;
DROP POLICY IF EXISTS "test_attempts_insert_policy" ON test_attempts;
DROP POLICY IF EXISTS "test_attempts_update_policy" ON test_attempts;
DROP POLICY IF EXISTS "test_attempts_delete_policy" ON test_attempts;

DROP POLICY IF EXISTS "test_answers_select_policy" ON test_answers;
DROP POLICY IF EXISTS "test_answers_insert_policy" ON test_answers;
DROP POLICY IF EXISTS "test_answers_update_policy" ON test_answers;
DROP POLICY IF EXISTS "test_answers_delete_policy" ON test_answers;

DROP POLICY IF EXISTS "test_sessions_select_policy" ON test_sessions;
DROP POLICY IF EXISTS "test_sessions_insert_policy" ON test_sessions;
DROP POLICY IF EXISTS "test_sessions_update_policy" ON test_sessions;
DROP POLICY IF EXISTS "test_sessions_delete_policy" ON test_sessions;

-- ========================================
-- TESTS TABLE POLICIES
-- ========================================

-- Policy: Students can view active and scheduled tests
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

-- Policy: Admins can create tests
CREATE POLICY "tests_insert_policy" ON tests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Admins can update tests they created
CREATE POLICY "tests_update_policy" ON tests
  FOR UPDATE
  USING (
    (auth.uid() = created_by) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

-- Policy: Admins can delete tests they created
CREATE POLICY "tests_delete_policy" ON tests
  FOR DELETE
  USING (
    (auth.uid() = created_by) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

-- ========================================
-- QUESTIONS TABLE POLICIES
-- ========================================

-- Policy: Students can view questions for active/completed tests they have access to
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

-- Policy: Admins can create questions
CREATE POLICY "questions_insert_policy" ON questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Admins can update questions
CREATE POLICY "questions_update_policy" ON questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Admins can delete questions
CREATE POLICY "questions_delete_policy" ON questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ========================================
-- TEST_ATTEMPTS TABLE POLICIES
-- ========================================

-- Policy: Users can view their own test attempts
CREATE POLICY "test_attempts_select_policy" ON test_attempts
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

-- Policy: Users can create their own test attempts
CREATE POLICY "test_attempts_insert_policy" ON test_attempts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can update their own test attempts
CREATE POLICY "test_attempts_update_policy" ON test_attempts
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

-- Policy: Admins can delete test attempts
CREATE POLICY "test_attempts_delete_policy" ON test_attempts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ========================================
-- TEST_ANSWERS TABLE POLICIES
-- ========================================

-- Policy: Users can view their own test answers
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

-- Policy: Users can create their own test answers
CREATE POLICY "test_answers_insert_policy" ON test_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = test_answers.attempt_id
        AND test_attempts.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own test answers
CREATE POLICY "test_answers_update_policy" ON test_answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = test_answers.attempt_id
        AND test_attempts.user_id = auth.uid()
    )
  );

-- Policy: Admins can delete test answers
CREATE POLICY "test_answers_delete_policy" ON test_answers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ========================================
-- TEST_SESSIONS TABLE POLICIES
-- ========================================

-- Policy: All authenticated users can view test sessions (for monitoring)
CREATE POLICY "test_sessions_select_policy" ON test_sessions
  FOR SELECT
  USING (
    true -- All authenticated users can view sessions
  );

-- Policy: Admins can create test sessions
CREATE POLICY "test_sessions_insert_policy" ON test_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Admins can update test sessions
CREATE POLICY "test_sessions_update_policy" ON test_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Admins can delete test sessions
CREATE POLICY "test_sessions_delete_policy" ON test_sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ========================================
-- REAL-TIME SUBSCRIPTION POLICIES
-- ========================================

-- Enable real-time for test_attempts table
ALTER PUBLICATION supabase_realtime ADD TABLE test_attempts;

-- Enable real-time for test_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE test_sessions;

-- Policy for real-time subscriptions to test_attempts
CREATE POLICY "test_attempts_realtime_policy" ON test_attempts
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    ))
  );

-- Policy for real-time subscriptions to test_sessions
CREATE POLICY "test_sessions_realtime_policy" ON test_sessions
  FOR SELECT
  USING (
    true -- All authenticated users can subscribe to session updates
  );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
ORDER BY tablename;

-- Verify policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
ORDER BY tablename, policyname;

-- Verify real-time publication
SELECT
  pubname,
  tablename
FROM pg_publication_tables
WHERE tablename IN ('test_attempts', 'test_sessions')
ORDER BY tablename;