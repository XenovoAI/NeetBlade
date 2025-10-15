-- Supabase Database Migration Script
-- Run this in your Supabase SQL Editor to ensure all tables and columns are properly set up

-- ========================================
-- 1. MATERIALS TABLE
-- ========================================

-- Create materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'physics',
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist (safe migration)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='materials' AND column_name='subject') THEN
    ALTER TABLE materials ADD COLUMN subject TEXT NOT NULL DEFAULT 'physics';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='materials' AND column_name='file_name') THEN
    ALTER TABLE materials ADD COLUMN file_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='materials' AND column_name='file_size') THEN
    ALTER TABLE materials ADD COLUMN file_size BIGINT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='materials' AND column_name='file_type') THEN
    ALTER TABLE materials ADD COLUMN file_type TEXT;
  END IF;
END $$;

-- ========================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on materials table
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON materials;
DROP POLICY IF EXISTS "Allow authenticated insert" ON materials;
DROP POLICY IF EXISTS "Allow authenticated delete" ON materials;
DROP POLICY IF EXISTS "Allow authenticated update" ON materials;

-- Create new policies
-- Policy: Allow anyone to read materials (for public study materials page)
CREATE POLICY "Allow public read access" ON materials
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert materials (for admin uploads)
CREATE POLICY "Allow authenticated insert" ON materials
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete materials (for admin delete)
CREATE POLICY "Allow authenticated delete" ON materials
  FOR DELETE
  USING (true);

-- Policy: Allow authenticated users to update materials
CREATE POLICY "Allow authenticated update" ON materials
  FOR UPDATE
  USING (true);

-- ========================================
-- 3. INDEXES (Optional but recommended)
-- ========================================

-- Create index on subject for faster filtering
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at DESC);

-- ========================================
-- 4. VERIFY SETUP
-- ========================================

-- Run this to verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- Run this to verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'materials';
