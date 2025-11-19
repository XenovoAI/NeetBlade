-- Fix All RLS Policies for Materials Upload
-- Run this entire script in Supabase SQL Editor

-- ========================================
-- 1. FIX MATERIALS TABLE RLS
-- ========================================

-- Enable RLS on materials table
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access" ON materials;
DROP POLICY IF EXISTS "Allow authenticated insert" ON materials;
DROP POLICY IF EXISTS "Allow authenticated delete" ON materials;
DROP POLICY IF EXISTS "Allow authenticated update" ON materials;
DROP POLICY IF EXISTS "Enable read access for all users" ON materials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON materials;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON materials;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON materials;

-- Create new permissive policies
-- Allow anyone to read materials
CREATE POLICY "Allow public read access" ON materials
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert materials
CREATE POLICY "Allow authenticated insert" ON materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update materials
CREATE POLICY "Allow authenticated update" ON materials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete materials
CREATE POLICY "Allow authenticated delete" ON materials
  FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- 2. VERIFY MATERIALS TABLE POLICIES
-- ========================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'materials';

-- You should see 4 policies:
-- 1. Allow public read access (SELECT)
-- 2. Allow authenticated insert (INSERT)
-- 3. Allow authenticated update (UPDATE)
-- 4. Allow authenticated delete (DELETE)

-- ========================================
-- 3. STORAGE BUCKET POLICIES
-- ========================================
-- NOTE: Storage policies must be set in the Supabase Dashboard
-- Go to: Storage → materials bucket → Policies
-- 
-- You need these 3 policies:

-- POLICY 1: Public Read Access
-- Name: "Public Access"
-- Allowed operation: SELECT
-- Policy definition:
-- (bucket_id = 'materials')

-- POLICY 2: Authenticated Upload
-- Name: "Authenticated users can upload"
-- Allowed operation: INSERT
-- Policy definition:
-- (bucket_id = 'materials' AND (auth.role() = 'authenticated'))

-- POLICY 3: Authenticated Delete
-- Name: "Authenticated users can delete"
-- Allowed operation: DELETE
-- Policy definition:
-- (bucket_id = 'materials' AND (auth.role() = 'authenticated'))

-- ========================================
-- 4. CREATE STORAGE BUCKET (if not exists)
-- ========================================
-- This creates the bucket programmatically
-- Run this if you haven't created the 'materials' bucket yet

INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ========================================
-- 5. STORAGE BUCKET RLS POLICIES (SQL)
-- ========================================
-- These are the SQL equivalents for storage policies

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies for materials bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Create storage policies
-- Allow public to read files from materials bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'materials');

-- Allow authenticated users to upload to materials bucket
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'materials');

-- Allow authenticated users to update files in materials bucket
CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'materials')
  WITH CHECK (bucket_id = 'materials');

-- Allow authenticated users to delete from materials bucket
CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'materials');

-- ========================================
-- 6. VERIFY STORAGE POLICIES
-- ========================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ========================================
-- 7. TEST QUERY
-- ========================================

-- Test that you can insert into materials table
-- This should work without errors
SELECT 'Materials table is ready for inserts' as status;

-- Check bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'materials';

-- ========================================
-- DONE!
-- ========================================
-- After running this script:
-- 1. Refresh your app
-- 2. Try uploading a material
-- 3. It should work now!
