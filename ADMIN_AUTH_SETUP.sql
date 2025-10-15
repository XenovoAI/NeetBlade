-- Admin Authentication Setup
-- Run this in Supabase SQL Editor

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add email column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Create admin user if doesn't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'teamneetblade@gmail.com',
  crypt('AdminPassword123!', gen_salt('bf')), -- You should change this password
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Set teamneetblade@gmail.com as admin in public.users table
INSERT INTO public.users (id, username, email, is_admin)
SELECT id, 'admin', email, true
FROM auth.users
WHERE email = 'teamneetblade@gmail.com'
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
