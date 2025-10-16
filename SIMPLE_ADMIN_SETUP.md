# Simple Admin Setup Guide (Step-by-Step)

## ✅ Follow These Steps Exactly

### Step 1: Create Admin User in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** button
3. Fill in:
   - **Email**: `teamneetblade@gmail.com`
   - **Password**: `AdminNEET@2025!` (or create your own strong password)
   - **Auto Confirm User**: ✅ **Check this box** (IMPORTANT!)
4. Click **"Create User"**
5. **Save the password** somewhere safe!

### Step 2: Add Admin Columns to Users Table

Go to **SQL Editor** and run this first:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
```

Click **"Run"** and wait for success message.

### Step 3: Mark User as Admin

Now run this in **SQL Editor**:

```sql
DELETE FROM public.users WHERE email = 'teamneetblade@gmail.com';

INSERT INTO public.users (id, email, username, is_admin, created_at)
SELECT id, email, 'admin', true, NOW()
FROM auth.users
WHERE email = 'teamneetblade@gmail.com';
```

Click **"Run"** and you should see "Success. 1 row(s) affected".

### Step 4: Verify It Worked

Run this to check:

```sql
SELECT id, email, username, is_admin 
FROM public.users 
WHERE email = 'teamneetblade@gmail.com';
```

You should see:
- email: `teamneetblade@gmail.com`
- username: `admin`
- is_admin: `true`

### Step 5: Test Admin Login

1. Open your site and go to `/login`
2. Enter:
   - Email: `teamneetblade@gmail.com`
   - Password: (the one you created in Step 1)
3. Click **"Sign In"**
4. You should be redirected to `/admin` dashboard!

---

## 🔧 Troubleshooting

### Error: "relation auth.users does not exist"
**Solution**: The auth.users table should exist. If not, check you're connected to the right Supabase project.

### Error: "no rows returned"
**Solution**: Make sure you created the user in Step 1 first. Go to Authentication → Users to verify.

### Can't login / Invalid credentials
**Solution**: 
1. Go to Authentication → Users
2. Find teamneetblade@gmail.com
3. Click the three dots → Reset password
4. Set a new password manually

### User created but still can't access admin
**Solution**: Run Step 3 again to ensure is_admin is set to true.

---

## 📝 Quick Reference

**Admin Email**: teamneetblade@gmail.com (hardcoded in system)  
**Password**: Whatever you set in Supabase Auth  
**Admin URL**: `/admin`  
**Login URL**: `/login`

---

## ✅ Success Checklist

- [ ] Created user in Supabase Auth with email teamneetblade@gmail.com
- [ ] Auto-confirmed the user (checkbox was checked)
- [ ] Ran ALTER TABLE commands to add columns
- [ ] Ran INSERT command to add admin record
- [ ] Verified with SELECT query (saw is_admin = true)
- [ ] Tested login at `/login`
- [ ] Successfully accessed `/admin` dashboard

If all boxes are checked, you're done! 🎉
