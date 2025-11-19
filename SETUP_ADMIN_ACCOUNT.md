# Setup Admin Account: teamneetblade@gmail.com

## Step 1: Create User in Supabase Auth (REQUIRED FIRST!)

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **psltdywuqaumlvfjyhya**
3. Navigate to: **Authentication** → **Users**
4. Click **"Add User"** button (or "Invite")
5. Fill in the form:
   - **Email**: `teamneetblade@gmail.com`
   - **Password**: Choose a strong password (you'll use this to login)
   - **Auto Confirm User**: ✅ CHECK THIS BOX (important!)
6. Click **"Create User"** or **"Send Invitation"**

## Step 2: Run Database Setup

Go to **Supabase Dashboard** → **SQL Editor** and run these commands:

### A. First, create the users table if it doesn't exist:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all data
CREATE POLICY "Admins can read all data" ON public.users
  FOR SELECT USING (is_admin = true);
```

### B. Then, make teamneetblade@gmail.com an admin:

```sql
-- Add admin columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Delete existing record if any
DELETE FROM public.users WHERE email = 'teamneetblade@gmail.com';

-- Create admin user record
INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT 
  id, 
  email, 
  'admin', 
  true, 
  NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com';

-- Verify it worked
SELECT id, email, username, is_admin 
FROM public.users 
WHERE email = 'teamneetblade@gmail.com';
```

You should see output like:
```
id: [some-uuid]
email: teamneetblade@gmail.com
username: admin
is_admin: true
```

## Step 3: Test Admin Login

1. Go to your app: http://localhost:5000/admin/login
2. Login with:
   - **Email**: teamneetblade@gmail.com
   - **Password**: [the password you set in Step 1]
3. You should be redirected to: http://localhost:5000/admin

## Troubleshooting

### Error: "No rows returned" when running SQL
**Solution**: You forgot to create the user in Supabase Auth first (Step 1)

### Error: "User not found" when logging in
**Solution**: 
1. Check the user exists in Authentication → Users
2. Make sure "Auto Confirm User" was checked
3. Re-run the SQL from Step 2B

### Error: "Not authorized" after login
**Solution**: Run this SQL to verify admin status:
```sql
SELECT email, is_admin FROM public.users WHERE email = 'teamneetblade@gmail.com';
```
If `is_admin` is false, run:
```sql
UPDATE public.users SET is_admin = true WHERE email = 'teamneetblade@gmail.com';
```

## Quick Checklist

- [ ] Created user in Supabase Auth with email teamneetblade@gmail.com
- [ ] Auto-confirmed the user (checkbox was checked)
- [ ] Ran SQL to create users table
- [ ] Ran SQL to make user admin
- [ ] Verified admin status in SQL query
- [ ] Successfully logged in at /admin/login
- [ ] Can access /admin page

## Admin URLs

- **Admin Login**: http://localhost:5000/admin/login
- **Admin Panel**: http://localhost:5000/admin
- **Regular Login**: http://localhost:5000/login (also works for admin)

---

**Need help?** Check the console for errors or verify each step was completed.
