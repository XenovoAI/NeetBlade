# Storage Policy Setup - Exact Steps

## Current Error
```
Storage error: new row violates row-level security policy
```

This means the storage bucket policies are NOT set up yet.

---

## EXACT Steps to Fix (3 minutes)

### Step 1: Go to Storage Policies

1. Open this URL: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/storage/buckets/materials

2. You should see the **materials** bucket

3. Click on **"Policies"** button/tab (usually on the right side or top)

---

### Step 2: Create Policy for Upload (INSERT)

1. Click **"New Policy"** button

2. You'll see options - choose **"For full customization"** or **"Custom policy"**

3. Fill in the form:
   ```
   Policy Name: Allow authenticated uploads
   
   Allowed Operations: 
   ☐ SELECT
   ☑ INSERT  ← CHECK THIS ONE
   ☐ UPDATE
   ☐ DELETE
   
   Policy Definition (WITH CHECK):
   (bucket_id = 'materials'::text)
   
   Target Roles: authenticated
   ```

4. Click **"Review"** then **"Save policy"**

---

### Step 3: Create Policy for Read (SELECT)

1. Click **"New Policy"** again

2. Choose **"For full customization"**

3. Fill in:
   ```
   Policy Name: Allow public read
   
   Allowed Operations:
   ☑ SELECT  ← CHECK THIS ONE
   ☐ INSERT
   ☐ UPDATE
   ☐ DELETE
   
   Policy Definition (USING):
   (bucket_id = 'materials'::text)
   
   Target Roles: public (or leave default)
   ```

4. Click **"Review"** then **"Save policy"**

---

### Step 4: Create Policy for Delete (DELETE)

1. Click **"New Policy"** again

2. Choose **"For full customization"**

3. Fill in:
   ```
   Policy Name: Allow authenticated delete
   
   Allowed Operations:
   ☐ SELECT
   ☐ INSERT
   ☐ UPDATE
   ☑ DELETE  ← CHECK THIS ONE
   
   Policy Definition (USING):
   (bucket_id = 'materials'::text)
   
   Target Roles: authenticated
   ```

4. Click **"Review"** then **"Save policy"**

---

### Step 5: Verify Bucket is Public

1. While still in the materials bucket, look for **"Configuration"** or **"Settings"** tab

2. Find the option **"Public bucket"**

3. Make sure it's **ENABLED/CHECKED** ✓

4. If not, enable it and click **Save**

---

### Step 6: Verify Policies Were Created

You should now see **3 policies** listed:
- ✅ Allow authenticated uploads (INSERT)
- ✅ Allow public read (SELECT)
- ✅ Allow authenticated delete (DELETE)

---

### Step 7: Test Upload

1. Go back to your app: http://localhost:5000/admin

2. **Hard refresh**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

3. Try uploading a file

4. 🎉 Should work now!

---

## Alternative: Use SQL for Storage Policies (Advanced)

If the UI doesn't work, try running this in SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'materials');

-- Policy 2: Authenticated upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'materials');

-- Policy 3: Authenticated delete
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'materials');
```

**BUT** you might get "must be owner" error. If so, you MUST use the UI.

---

## Troubleshooting

### "Can't find Policies button"
- Make sure you clicked on the **materials** bucket first
- Look for tabs at the top: Overview, Policies, Configuration
- Try refreshing the Supabase dashboard page

### "Policy creation fails"
- Make sure you're using the exact syntax: `(bucket_id = 'materials'::text)`
- Make sure you selected the correct operation (INSERT, SELECT, DELETE)
- Make sure you selected the correct target role (authenticated or public)

### "Still getting RLS error after creating policies"
1. Verify all 3 policies are listed in the Policies tab
2. Make sure bucket is public (Configuration tab)
3. Hard refresh your app (Ctrl + Shift + R)
4. Try logging out and back in
5. Clear browser cache and cookies

---

## Quick Checklist

- [ ] Opened Storage → materials bucket → Policies
- [ ] Created "Allow authenticated uploads" policy (INSERT)
- [ ] Created "Allow public read" policy (SELECT)
- [ ] Created "Allow authenticated delete" policy (DELETE)
- [ ] Verified bucket is public (Configuration tab)
- [ ] Hard refreshed app (Ctrl + Shift + R)
- [ ] Tested upload

---

## Direct Links

- **Storage Policies**: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/storage/buckets/materials
- **SQL Editor**: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/sql/new
- **Your App**: http://localhost:5000/admin
