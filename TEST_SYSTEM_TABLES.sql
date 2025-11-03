-- Real-Time Test System Database Migration
-- Run this in your Supabase SQL Editor to create test-related tables

-- ========================================
-- 1. TESTS TABLE
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

-- ========================================
-- 2. QUESTIONS TABLE
-- ========================================

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

-- ========================================
-- 3. TEST_ATTEMPTS TABLE
-- ========================================

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

-- ========================================
-- 4. TEST_ANSWERS TABLE
-- ========================================

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

-- ========================================
-- 5. TEST_SESSIONS TABLE
-- ========================================

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
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

-- Tests table indexes
CREATE INDEX IF NOT EXISTS idx_tests_scheduled_start ON tests(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);

-- Questions table indexes
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(test_id, order_index);

-- Test attempts indexes
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_test_attempts_created_at ON test_attempts(created_at);

-- Test answers indexes
CREATE INDEX IF NOT EXISTS idx_test_answers_attempt_id ON test_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_question_id ON test_answers(question_id);

-- Test sessions indexes
CREATE INDEX IF NOT EXISTS idx_test_sessions_test_id ON test_sessions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_status ON test_sessions(session_status);

-- ========================================
-- 7. TRIGGERS AND FUNCTIONS
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

-- Function to update session statistics when attempts change
CREATE OR REPLACE FUNCTION update_test_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New attempt started, increment active participants
    UPDATE test_sessions
    SET active_participants = active_participants + 1,
        session_status = CASE
          WHEN session_status = 'waiting' THEN 'active'
          ELSE session_status
        END,
        actual_start_time = CASE
          WHEN actual_start_time IS NULL THEN NOW()
          ELSE actual_start_time
        END
    WHERE test_id = NEW.test_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Attempt completed or timed out
    IF OLD.status = 'in_progress' AND NEW.status IN ('completed', 'timed_out') THEN
      UPDATE test_sessions
      SET active_participants = active_participants - 1,
          completed_participants = completed_participants + 1,
          actual_end_time = CASE
            WHEN active_participants <= 1 THEN NOW()
            ELSE actual_end_time
          END,
          session_status = CASE
            WHEN active_participants <= 1 THEN 'ended'
            ELSE session_status
          END
      WHERE test_id = NEW.test_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Attempt deleted (should be rare)
    UPDATE test_sessions
    SET active_participants = GREATEST(active_participants - 1, 0)
    WHERE test_id = OLD.test_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session statistics
DROP TRIGGER IF EXISTS trigger_update_test_session_stats ON test_attempts;
CREATE TRIGGER trigger_update_test_session_stats
  AFTER INSERT OR UPDATE OR DELETE ON test_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_test_session_stats();

-- ========================================
-- 8. VERIFICATION QUERIES
-- ========================================

-- Verify table structures
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
ORDER BY table_name, ordinal_position;

-- Verify indexes
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tests', 'questions', 'test_attempts', 'test_answers', 'test_sessions')
ORDER BY tablename, indexname;

-- Verify triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('tests', 'test_attempts', 'test_sessions')
ORDER BY event_object_table, trigger_name;