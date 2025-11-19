# Fix Upload Error: RLS Policy Violation

## The Problem
You're getting: `new row violates row-level security policy`

This means the database is blocking your upload because of Row Level Security (RLS) policies.

## Quick Fix (5 minutes)

### Step 1: Run SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `FIX_RLS_POLICIES.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

This will:
- Fix materials table RLS policies
- Create storage bucket if needed
- Set up storage RLS policies
- Make bucket public

### Step 2: Verify Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Check if `materials` bucket exists
3. If not, create it:
   - Click **New Bucket**
   - Name: `materials`
   - ✅ Check **Public bucket**
   - Click **Create**

### Step 3: Check Storage Policies (Optional)

1. Go to **Storage** → **materials** bucket → **Policies**
2. You should see these policies:
   - ✅ Public Access (SELECT)
   - ✅ Authenticated users can upload (INSERT)
   - ✅ Authenticated users can delete (DELETE)

If they're missing, the SQL script should have created them. If not, add them manually:

**Policy 1: Public Access**
```sql
bucket_id = 'materials'
```
Allowed operations: SELECT

**Policy 2: Authenticated Upload**
```sql
bucket_id = 'materials' AND auth.role() = 'authenticated'
```
Allowed operations: INSERT

**Policy 3: Authenticated Delete**
```sql
bucket_id = 'materials' AND auth.role() = 'authenticated'
```
Allowed operations: DELETE

### Step 4: Test Upload

1. Refresh your app: http://localhost:5000/admin
2. Try uploading a material
3. It should work now!

## Still Not Working?

### Check 1: Are you logged in?
- Make sure you're logged in as admin
- Check browser console for auth errors

### Check 2: Verify materials table exists
Run in SQL Editor:
```sql
SELECT * FROM materials LIMIT 1;
```

### Check 3: Verify storage bucket exists
Run in SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'materials';
```
Should return: `id: materials, public: true`

### Check 4: Check RLS policies
Run in SQL Editor:
```sql
-- Check materials table policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'materials';

-- Check storage policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Check 5: Verify you're authenticated
Run in SQL Editor:
```sql
SELECT auth.uid(), auth.role();
```
Should return your user ID and 'authenticated'

## Common Issues

### "Storage bucket not found"
**Solution**: Create the bucket in Storage → New Bucket → name: `materials` → public: true

### "Permission denied for table materials"
**Solution**: Re-run the RLS policies from `FIX_RLS_POLICIES.sql`

### "Invalid JWT token"
**Solution**: 
1. Logout and login again
2. Check your .env files have correct Supabase credentials
3. Restart dev server

## Manual Policy Creation (if SQL fails)

If the SQL script doesn't work, create policies manually:

### Materials Table Policies

Go to **Database** → **Tables** → **materials** → **Policies**

1. **Allow public read access**
   - Command: SELECT
   - Using: `true`

2. **Allow authenticated insert**
   - Command: INSERT
   - With check: `true`
   - Target roles: authenticated

3. **Allow authenticated update**
   - Command: UPDATE
   - Using: `true`
   - With check: `true`
   - Target roles: authenticated

4. **Allow authenticated delete**
   - Command: DELETE
   - Using: `true`
   - Target roles: authenticated

---

**After fixing, refresh your app and try uploading again!**
