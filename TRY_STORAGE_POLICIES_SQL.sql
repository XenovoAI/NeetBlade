-- TRY THIS: Storage Policies via SQL
-- If you get "must be owner" error, you MUST use the Dashboard UI instead
-- See STORAGE_POLICY_SCREENSHOTS.md for UI instructions

-- ========================================
-- STORAGE BUCKET POLICIES
-- ========================================

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;

-- Create new policies
-- Policy 1: Allow public to read files
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'materials');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'materials');

-- Policy 3: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'materials');

-- Policy 4: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'materials')
  WITH CHECK (bucket_id = 'materials');

-- ========================================
-- VERIFY POLICIES
-- ========================================

SELECT 
  'Storage policies created' as status,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Allow%';

-- ========================================
-- SUCCESS
-- ========================================

SELECT '✅ Storage policies created!' as result
UNION ALL
SELECT '✅ Now refresh your app and try uploading' as result;
