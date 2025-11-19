-- DIAGNOSTIC SCRIPT - Run this to see what's wrong
-- Copy and paste into Supabase SQL Editor

-- ========================================
-- 1. CHECK IF MATERIALS TABLE EXISTS
-- ========================================

SELECT 
  'Materials table exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'materials'
  ) THEN '✅ YES' ELSE '❌ NO - Run FIX_MATERIALS_TABLE_NOW.sql' END as result;

-- ========================================
-- 2. CHECK MATERIALS TABLE COLUMNS
-- ========================================

SELECT 
  'Required columns' as check_name,
  column_name,
  data_type,
  CASE WHEN column_name IN ('price', 'thumbnail_url', 'payment_link') 
    THEN '✅ NEW' ELSE '📝 EXISTING' END as status
FROM information_schema.columns 
WHERE table_name = 'materials'
ORDER BY ordinal_position;

-- ========================================
-- 3. CHECK RLS IS ENABLED
-- ========================================

SELECT 
  'RLS enabled on materials' as check_name,
  CASE WHEN relrowsecurity THEN '✅ YES' ELSE '❌ NO' END as result
FROM pg_class 
WHERE relname = 'materials';

-- ========================================
-- 4. CHECK MATERIALS TABLE POLICIES
-- ========================================

SELECT 
  'Materials policies' as check_name,
  policyname,
  cmd as operation,
  roles::text,
  CASE 
    WHEN cmd = 'SELECT' AND qual = 'true' THEN '✅ Public read OK'
    WHEN cmd = 'INSERT' AND roles::text LIKE '%authenticated%' THEN '✅ Auth insert OK'
    WHEN cmd = 'UPDATE' AND roles::text LIKE '%authenticated%' THEN '✅ Auth update OK'
    WHEN cmd = 'DELETE' AND roles::text LIKE '%authenticated%' THEN '✅ Auth delete OK'
    ELSE '⚠️ Check policy'
  END as status
FROM pg_policies 
WHERE tablename = 'materials';

-- ========================================
-- 5. CHECK STORAGE BUCKET EXISTS
-- ========================================

SELECT 
  'Storage bucket' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'materials'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING - Run FIX_MATERIALS_TABLE_NOW.sql' END as result;

-- ========================================
-- 6. CHECK STORAGE BUCKET IS PUBLIC
-- ========================================

SELECT 
  'Storage bucket public' as check_name,
  CASE WHEN public THEN '✅ YES' ELSE '❌ NO - Make it public' END as result
FROM storage.buckets 
WHERE id = 'materials';

-- ========================================
-- 7. CHECK STORAGE POLICIES
-- ========================================

SELECT 
  'Storage policies' as check_name,
  policyname,
  cmd as operation,
  roles::text,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ Public read OK'
    WHEN cmd = 'INSERT' AND roles::text LIKE '%authenticated%' THEN '✅ Auth upload OK'
    WHEN cmd = 'UPDATE' AND roles::text LIKE '%authenticated%' THEN '✅ Auth update OK'
    WHEN cmd = 'DELETE' AND roles::text LIKE '%authenticated%' THEN '✅ Auth delete OK'
    ELSE '⚠️ Check policy'
  END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ========================================
-- 8. CHECK IF YOU'RE AUTHENTICATED
-- ========================================

SELECT 
  'Current user' as check_name,
  COALESCE(auth.uid()::text, '❌ NOT AUTHENTICATED') as user_id,
  COALESCE(auth.role(), '❌ NO ROLE') as role;

-- ========================================
-- 9. SUMMARY
-- ========================================

SELECT 
  '📊 DIAGNOSTIC SUMMARY' as summary,
  '' as details
UNION ALL
SELECT 
  'If you see ❌ anywhere above, run FIX_MATERIALS_TABLE_NOW.sql',
  ''
UNION ALL
SELECT 
  'If everything shows ✅ but upload still fails:',
  ''
UNION ALL
SELECT 
  '1. Make sure you are logged in',
  ''
UNION ALL
SELECT 
  '2. Check browser console for exact error',
  ''
UNION ALL
SELECT 
  '3. Try logging out and back in',
  '';
