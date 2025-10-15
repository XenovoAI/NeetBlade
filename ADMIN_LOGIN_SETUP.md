# Admin Authentication Setup Guide

## 🔐 Setting Up Admin Access for teamneetblade@gmail.com

Follow these steps to make the admin panel accessible only to teamneetblade@gmail.com:

---

## Step 1: Create Admin User in Supabase

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Fill in the details:
   - **Email**: `teamneetblade@gmail.com`
   - **Password**: Create a strong password (e.g., `AdminNEET@2025!`)
   - **Auto Confirm User**: ✅ Enable this
4. Click **"Create User"**

---

## Step 2: Mark User as Admin (SQL Method)

Go to **SQL Editor** and run this:

```sql
-- Add is_admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Mark teamneetblade@gmail.com as admin
INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT 
  id, 
  email, 
  'admin', 
  true, 
  NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, email = EXCLUDED.email;
```

---

## Step 3: Test Admin Login

1. **Logout** from any current session
2. Go to `/login`
3. Enter:
   - Email: `teamneetblade@gmail.com`
   - Password: `<the password you created>`
4. You should be redirected to `/admin`

---

## Step 4: Verify Protection

Try accessing `/admin` without logging in or with a different user:
- ❌ Should redirect to `/login?redirect=/admin`
- ❌ Non-admin users will see "Access Denied"

---

## How It Works

### 🔒 Protected Routes
- `/admin` - Only accessible by teamneetblade@gmail.com
- Automatically redirects to login if not authenticated
- Shows "Access Denied" for non-admin users

### 🎯 Authentication Flow
1. User visits `/admin`
2. System checks if user is logged in
3. System verifies email matches `teamneetblade@gmail.com`
4. If not admin → Redirect to home with error
5. If admin → Show admin dashboard

### 🚪 Logout
- Click the "Logout" button in admin dashboard header
- Automatically redirects to homepage
- Session is cleared from Supabase

---

## Security Features

✅ **Email-based admin check** - Only teamneetblade@gmail.com can access  
✅ **Session validation** - Checks for valid Supabase session  
✅ **Auto-redirect** - Non-admins are redirected away  
✅ **Loading states** - Shows verification message while checking  
✅ **Error handling** - Clear messages for unauthorized access  

---

## Troubleshooting

### "Access Denied" even with correct email
**Solution**: Make sure the user is created in Supabase Auth and the SQL script was run successfully.

### Stuck on loading screen
**Solution**: 
1. Check browser console for errors
2. Verify Supabase credentials in `.env` file
3. Check if auth.users table exists

### Can't login with admin credentials
**Solution**:
1. Go to Supabase → Authentication → Users
2. Verify teamneetblade@gmail.com exists
3. Check if email is confirmed
4. Reset password if needed

---

## Admin Dashboard Features

Once logged in as admin, you can:
- ✅ Upload study materials (PDF, videos)
- ✅ View all uploaded materials
- ✅ Delete materials
- ✅ See user counts and statistics
- ✅ Manage platform content

---

## Password Reset (If Needed)

If you forget the admin password:

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. Find `teamneetblade@gmail.com`
3. Click the three dots (•••)
4. Select **"Reset Password"**
5. Use the magic link sent to email OR
6. Manually set a new password in the dashboard

---

## Adding More Admins (Optional)

To add more admin emails in the future:

1. Update the code in `/app/client/src/hooks/useAdminAuth.ts`:

```typescript
const ADMIN_EMAILS = [
  "teamneetblade@gmail.com",
  "anotheradmin@example.com"
];

// Then change the check to:
if (ADMIN_EMAILS.includes(currentUser.email)) {
  setIsAdmin(true);
  // ...
}
```

2. Create the new user in Supabase Auth
3. Run the SQL to mark them as admin

---

## Quick Command Reference

### Create Admin User (SQL)
```sql
INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT id, email, 'admin', true, NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

### Check Admin Status (SQL)
```sql
SELECT id, email, username, is_admin 
FROM public.users 
WHERE email = 'teamneetblade@gmail.com';
```

### Remove Admin Access (SQL)
```sql
UPDATE public.users 
SET is_admin = false 
WHERE email = 'teamneetblade@gmail.com';
```

---

## ✅ Setup Complete!

Your admin panel is now secured and only accessible by **teamneetblade@gmail.com**. 

Test the login and start managing your NEET Blade platform! 🎉
