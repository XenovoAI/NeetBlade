-- Quick Admin Setup for teamneetblade@gmail.com
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all data" ON public.users;

-- Step 4: Create policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all data" ON public.users
  FOR SELECT USING (is_admin = true);

-- Step 5: Add admin columns (safe to run multiple times)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 6: Delete existing admin record if any
DELETE FROM public.users WHERE email = 'teamneetblade@gmail.com';

-- Step 7: Create admin user record
-- NOTE: This will only work if you've created the user in Supabase Auth first!
INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT 
  id, 
  email, 
  'admin', 
  true, 
  NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com';

-- Step 8: Verify admin was created
SELECT 
  id, 
  email, 
  username, 
  is_admin,
  created_at
FROM public.users 
WHERE email = 'teamneetblade@gmail.com';

-- You should see:
-- email: teamneetblade@gmail.com
-- username: admin
-- is_admin: true
