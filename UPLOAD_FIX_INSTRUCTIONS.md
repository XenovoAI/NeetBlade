# Fix Upload Error - Simple Instructions

## Error You're Getting
```
Upload failed: new row violates row-level security policy
```

## The Fix (2 minutes)

### Step 1: Run This SQL Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/sql/new

2. Copy the **ENTIRE** contents of: `FIX_MATERIALS_TABLE_NOW.sql`

3. Paste into SQL Editor

4. Click **RUN**

5. You should see success messages like:
   ```
   ✅ Materials table updated
   ✅ RLS policies configured
   ✅ Storage bucket created
   ✅ Upload should work now!
   ```

### Step 2: Refresh Your App

1. Go back to: http://localhost:5000/admin
2. Press `Ctrl + Shift + R` (hard refresh)
3. Try uploading again
4. ✅ Should work!

---

## What This Script Does

1. **Adds missing columns** to materials table:
   - `price` (for payment)
   - `thumbnail_url` (for preview images)
   - `payment_link` (for Razorpay)

2. **Fixes RLS policies** to allow:
   - Anyone to read materials
   - Authenticated users to upload

3. **Creates storage bucket** named "materials"

4. **Fixes storage policies** to allow uploads

---

## Still Not Working?

### Option 1: Run Diagnostic
Run `DIAGNOSE_UPLOAD_ISSUE.sql` to see what's wrong

### Option 2: Check Authentication
Make sure you're logged in:
1. Open browser console (F12)
2. Type: `localStorage.getItem('neetblade-auth')`
3. Should show a token
4. If null, you're not logged in - login again

### Option 3: Check Browser Console
1. Open browser console (F12)
2. Try upload again
3. Look for the exact error message
4. Share it with me

---

## Quick Checklist

- [ ] Ran `FIX_MATERIALS_TABLE_NOW.sql` in Supabase SQL Editor
- [ ] Saw success messages
- [ ] Refreshed app (Ctrl + Shift + R)
- [ ] Logged in as admin
- [ ] Tried upload again

---

**The script is safe to run multiple times - it won't break anything!**
