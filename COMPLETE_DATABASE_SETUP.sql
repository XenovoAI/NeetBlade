-- ========================================
-- COMPLETE DATABASE SETUP FOR NEETBLADE
-- Run this entire script in Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. CREATE MATERIALS TABLE
-- ========================================

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

-- Add missing columns if they don't exist
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
-- 2. CREATE USERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add admin columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- ========================================
-- 3. CREATE ORDERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_link TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, material_id)
);

-- ========================================
-- 4. CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_id ON orders(material_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ========================================
-- 5. ENABLE RLS ON ALL TABLES
-- ========================================

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. DROP ALL EXISTING POLICIES
-- ========================================

-- Materials policies
DROP POLICY IF EXISTS "Allow public read access" ON materials;
DROP POLICY IF EXISTS "Allow authenticated insert" ON materials;
DROP POLICY IF EXISTS "Allow authenticated delete" ON materials;
DROP POLICY IF EXISTS "Allow authenticated update" ON materials;

-- Users policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all data" ON public.users;

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;

-- ========================================
-- 7. CREATE MATERIALS TABLE POLICIES
-- ========================================

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
-- 8. CREATE USERS TABLE POLICIES
-- ========================================

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to read all data
CREATE POLICY "Admins can read all data" ON public.users
  FOR SELECT
  USING (is_admin = true);

-- ========================================
-- 9. CREATE ORDERS TABLE POLICIES
-- ========================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 10. CREATE STORAGE BUCKET
-- ========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ========================================
-- 11. CREATE STORAGE POLICIES
-- ========================================

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
-- 12. CREATE ADMIN USER
-- ========================================

-- Delete existing admin record if any
DELETE FROM public.users WHERE email = 'teamneetblade@gmail.com';

-- Create admin user record
-- NOTE: You must create the user in Supabase Auth first!
INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT 
  id, 
  email, 
  'admin', 
  true, 
  NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com';

-- ========================================
-- 13. VERIFICATION QUERIES
-- ========================================

-- Verify materials table
SELECT 'Materials table' as table_name, COUNT(*) as row_count FROM materials;

-- Verify users table
SELECT 'Users table' as table_name, COUNT(*) as row_count FROM public.users;

-- Verify orders table
SELECT 'Orders table' as table_name, COUNT(*) as row_count FROM orders;

-- Verify admin user
SELECT 
  'Admin user' as check_name,
  email, 
  username, 
  is_admin 
FROM public.users 
WHERE email = 'teamneetblade@gmail.com';

-- Verify storage bucket
SELECT 
  'Storage bucket' as check_name,
  id, 
  name, 
  public 
FROM storage.buckets 
WHERE id = 'materials';

-- Verify materials policies
SELECT 
  'Materials policies' as check_name,
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'materials';

-- Verify storage policies
SELECT 
  'Storage policies' as check_name,
  COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ========================================
-- SETUP COMPLETE!
-- ========================================

SELECT '✅ Database setup complete!' as status;
SELECT '✅ All tables created' as status;
SELECT '✅ All RLS policies configured' as status;
SELECT '✅ Storage bucket ready' as status;
SELECT '✅ Admin user configured' as status;
SELECT '' as status;
SELECT 'Next steps:' as status;
SELECT '1. Verify admin user exists in Authentication → Users' as status;
SELECT '2. Refresh your app at http://localhost:5000' as status;
SELECT '3. Login as admin and try uploading a material' as status;
