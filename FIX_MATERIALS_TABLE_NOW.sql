-- IMMEDIATE FIX FOR UPLOAD ERROR
-- Copy and paste this into Supabase SQL Editor and click RUN

-- ========================================
-- 1. ADD MISSING COLUMNS TO MATERIALS TABLE
-- ========================================

-- Add price column
ALTER TABLE materials ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add thumbnail_url column
ALTER TABLE materials ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add payment_link column
ALTER TABLE materials ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- ========================================
-- 2. ENABLE RLS
-- ========================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. DROP ALL EXISTING POLICIES
-- ========================================

DROP POLICY IF EXISTS "Allow public read access" ON materials;
DROP POLICY IF EXISTS "Allow authenticated insert" ON materials;
DROP POLICY IF EXISTS "Allow authenticated delete" ON materials;
DROP POLICY IF EXISTS "Allow authenticated update" ON materials;
DROP POLICY IF EXISTS "Enable read access for all users" ON materials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON materials;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON materials;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON materials;

-- ========================================
-- 4. CREATE NEW POLICIES (PERMISSIVE)
-- ========================================

-- Allow ANYONE to read materials (public access)
CREATE POLICY "Allow public read access" ON materials
  FOR SELECT
  USING (true);

-- Allow AUTHENTICATED users to insert
CREATE POLICY "Allow authenticated insert" ON materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow AUTHENTICATED users to update
CREATE POLICY "Allow authenticated update" ON materials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow AUTHENTICATED users to delete
CREATE POLICY "Allow authenticated delete" ON materials
  FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- 5. FIX STORAGE BUCKET
-- ========================================

-- Create materials bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'materials')
  WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'materials');

-- ========================================
-- 6. VERIFY EVERYTHING
-- ========================================

-- Check materials table structure
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- Check materials policies (should show 4)
SELECT 
  policyname, 
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'materials';

-- Check storage bucket
SELECT 
  id, 
  name, 
  public 
FROM storage.buckets 
WHERE id = 'materials';

-- Check storage policies (should show 4)
SELECT 
  policyname, 
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT '✅ Materials table updated with price, thumbnail_url, payment_link columns' as status
UNION ALL
SELECT '✅ RLS policies configured for materials table' as status
UNION ALL
SELECT '✅ Storage bucket created and configured' as status
UNION ALL
SELECT '✅ Storage RLS policies configured' as status
UNION ALL
SELECT '' as status
UNION ALL
SELECT '🎉 Upload should work now! Refresh your app and try again.' as status;
