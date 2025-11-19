# Setup Storage Policies (Manual Steps)

## Why Manual?
You can't modify `storage.objects` table with SQL - you must use the Supabase Dashboard UI.

---

## Step 1: Run SQL Script First

1. Go to: **SQL Editor** in Supabase Dashboard
2. Copy and paste: **`FIX_MATERIALS_ONLY.sql`**
3. Click **RUN**
4. Should see success messages

---

## Step 2: Setup Storage Bucket Policies (UI)

### A. Navigate to Storage

1. Go to: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/storage/buckets
2. Click on **`materials`** bucket
3. Click **Policies** tab

### B. Create Policy 1: Public Read Access

1. Click **"New Policy"**
2. Choose **"For full customization"** (or "Custom")
3. Fill in:
   - **Policy name**: `Public Access`
   - **Allowed operation**: Check **SELECT** only
   - **Policy definition**: 
     ```sql
     bucket_id = 'materials'
     ```
   - **Target roles**: Leave as default (public)
4. Click **Save** or **Create Policy**

### C. Create Policy 2: Authenticated Upload

1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated users can upload`
   - **Allowed operation**: Check **INSERT** only
   - **Policy definition**:
     ```sql
     bucket_id = 'materials'
     ```
   - **Target roles**: Select **authenticated**
4. Click **Save**

### D. Create Policy 3: Authenticated Update

1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated users can update`
   - **Allowed operation**: Check **UPDATE** only
   - **Policy definition**:
     ```sql
     bucket_id = 'materials'
     ```
   - **Target roles**: Select **authenticated**
4. Click **Save**

### E. Create Policy 4: Authenticated Delete

1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Authenticated users can delete`
   - **Allowed operation**: Check **DELETE** only
   - **Policy definition**:
     ```sql
     bucket_id = 'materials'
     ```
   - **Target roles**: Select **authenticated**
4. Click **Save**

---

## Step 3: Verify Bucket is Public

1. Still in Storage → materials bucket
2. Click **Configuration** tab (or Settings)
3. Make sure **"Public bucket"** is **enabled/checked**
4. If not, enable it and save

---

## Step 4: Test Upload

1. Go to: http://localhost:5000/admin
2. Press `Ctrl + Shift + R` (hard refresh)
3. Try uploading a material
4. ✅ Should work now!

---

## Quick Visual Guide

```
Storage → materials bucket → Policies → New Policy

Policy 1: Public Access
├─ Operation: SELECT
├─ Definition: bucket_id = 'materials'
└─ Roles: public

Policy 2: Authenticated Upload
├─ Operation: INSERT
├─ Definition: bucket_id = 'materials'
└─ Roles: authenticated

Policy 3: Authenticated Update
├─ Operation: UPDATE
├─ Definition: bucket_id = 'materials'
└─ Roles: authenticated

Policy 4: Authenticated Delete
├─ Operation: DELETE
├─ Definition: bucket_id = 'materials'
└─ Roles: authenticated
```

---

## Alternative: Use Policy Templates

If Supabase offers templates, you can use:

1. **"Allow public read access"** template
   - Select this for SELECT operations

2. **"Allow authenticated users to upload"** template
   - Select this for INSERT operations

3. Customize the templates to use `bucket_id = 'materials'`

---

## Troubleshooting

### Can't find Policies tab?
- Make sure you clicked on the **materials** bucket first
- Look for tabs: Overview, Policies, Configuration

### Policy creation fails?
- Make sure the bucket exists first
- Try refreshing the page
- Make sure you're using the correct syntax

### Still getting RLS error after setup?
- Verify all 4 policies are created
- Check bucket is public
- Logout and login again
- Clear browser cache

---

## Checklist

- [ ] Ran `FIX_MATERIALS_ONLY.sql` in SQL Editor
- [ ] Created Policy 1: Public Access (SELECT)
- [ ] Created Policy 2: Authenticated Upload (INSERT)
- [ ] Created Policy 3: Authenticated Update (UPDATE)
- [ ] Created Policy 4: Authenticated Delete (DELETE)
- [ ] Verified bucket is public
- [ ] Refreshed app and tested upload

---

**After completing all steps, your upload should work!**
