-- FIX MATERIALS TABLE ONLY (No storage.objects modifications)
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
-- 2. ENABLE RLS ON MATERIALS
-- ========================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. DROP ALL EXISTING POLICIES ON MATERIALS
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
-- 4. CREATE NEW POLICIES FOR MATERIALS
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
-- 5. CREATE STORAGE BUCKET (if doesn't exist)
-- ========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ========================================
-- 6. VERIFY MATERIALS TABLE
-- ========================================

-- Check materials table structure
SELECT 
  'Materials columns' as info,
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- Check materials policies (should show 4)
SELECT 
  'Materials policies' as info,
  policyname, 
  cmd as operation
FROM pg_policies 
WHERE tablename = 'materials';

-- Check storage bucket
SELECT 
  'Storage bucket' as info,
  id, 
  name, 
  public 
FROM storage.buckets 
WHERE id = 'materials';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT '✅ Materials table updated with price, thumbnail_url, payment_link columns' as status
UNION ALL
SELECT '✅ RLS policies configured for materials table' as status
UNION ALL
SELECT '✅ Storage bucket created' as status
UNION ALL
SELECT '' as status
UNION ALL
SELECT '⚠️  IMPORTANT: You must configure storage policies manually!' as status
UNION ALL
SELECT 'Go to: Storage → materials bucket → Policies' as status
UNION ALL
SELECT 'See SETUP_STORAGE_POLICIES.md for instructions' as status;
