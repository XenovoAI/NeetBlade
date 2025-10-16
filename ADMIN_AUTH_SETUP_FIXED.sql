-- Admin Authentication Setup (FIXED)
-- Run this in Supabase SQL Editor

-- Step 1: Add admin columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Create the admin user record
-- First, delete if exists to avoid conflicts
DELETE FROM public.users WHERE email = 'teamneetblade@gmail.com';

-- Then insert the admin user
INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT 
  id, 
  email, 
  'admin', 
  true, 
  NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com';

-- Step 3: Verify the admin user was created
SELECT id, email, username, is_admin 
FROM public.users 
WHERE email = 'teamneetblade@gmail.com';
