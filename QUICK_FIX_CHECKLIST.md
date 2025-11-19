# Quick Fix Checklist - Upload Error

## ❌ Current Error
`Storage error: new row violates row-level security policy`

## ✅ Solution (5 minutes)

### Step 1: Create Admin User in Supabase Auth
1. Go to: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/auth/users
2. Click **"Add User"**
3. Email: `teamneetblade@gmail.com`
4. Password: (choose one)
5. ✅ Check **"Auto Confirm User"**
6. Click **Create User**

### Step 2: Run Complete Database Setup
1. Go to: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/sql/new
2. Open file: **COMPLETE_DATABASE_SETUP.sql**
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run**

This will:
- ✅ Create all tables (materials, users, orders)
- ✅ Set up all RLS policies
- ✅ Create storage bucket
- ✅ Make you admin
- ✅ Fix upload permissions

### Step 3: Verify Setup
After running the SQL, you should see output like:
```
✅ Database setup complete!
✅ All tables created
✅ All RLS policies configured
✅ Storage bucket ready
✅ Admin user configured
```

### Step 4: Test Upload
1. Refresh your app: http://localhost:5000/admin
2. Login with: teamneetblade@gmail.com
3. Try uploading a material
4. ✅ Should work now!

---

## Alternative: Quick Fix Only (if tables already exist)

If you just need to fix RLS policies:

1. Go to SQL Editor
2. Run: **FIX_RLS_POLICIES.sql**
3. Refresh app
4. Try upload again

---

## Files Created for You

- **COMPLETE_DATABASE_SETUP.sql** - Full setup (recommended)
- **FIX_RLS_POLICIES.sql** - Just fix RLS policies
- **MAKE_ADMIN_QUICK.sql** - Just make admin user
- **FIX_UPLOAD_ERROR.md** - Detailed troubleshooting guide

---

## Still Having Issues?

Check **FIX_UPLOAD_ERROR.md** for detailed troubleshooting steps.
