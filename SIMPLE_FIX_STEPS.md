# Simple Fix Steps - Upload Error

## Error
`Upload failed: new row violates row-level security policy`

---

## Fix in 3 Steps (5 minutes)

### ✅ Step 1: Run SQL (2 minutes)

1. Open: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/sql/new
2. Copy entire file: **`FIX_MATERIALS_ONLY.sql`**
3. Paste and click **RUN**
4. Should see ✅ success messages

---

### ✅ Step 2: Setup Storage Policies (3 minutes)

**Go to Storage:**
https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/storage/buckets

**Click:** `materials` bucket → **Policies** tab

**Create 4 policies:**

#### Policy 1: Public Read
- Click **"New Policy"**
- Name: `Public Access`
- Operation: **SELECT** ✓
- Definition: `bucket_id = 'materials'`
- Click **Save**

#### Policy 2: Upload
- Click **"New Policy"**
- Name: `Authenticated Upload`
- Operation: **INSERT** ✓
- Definition: `bucket_id = 'materials'`
- Target: **authenticated**
- Click **Save**

#### Policy 3: Update
- Click **"New Policy"**
- Name: `Authenticated Update`
- Operation: **UPDATE** ✓
- Definition: `bucket_id = 'materials'`
- Target: **authenticated**
- Click **Save**

#### Policy 4: Delete
- Click **"New Policy"**
- Name: `Authenticated Delete`
- Operation: **DELETE** ✓
- Definition: `bucket_id = 'materials'`
- Target: **authenticated**
- Click **Save**

**Make bucket public:**
- Click **Configuration** tab
- Enable **"Public bucket"**
- Save

---

### ✅ Step 3: Test Upload

1. Go to: http://localhost:5000/admin
2. Press `Ctrl + Shift + R` (hard refresh)
3. Try uploading
4. 🎉 Should work!

---

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/sql/new
- **Storage**: https://supabase.com/dashboard/project/psltdywuqaumlvfjyhya/storage/buckets
- **Your App**: http://localhost:5000/admin

---

## Need Help?

See **SETUP_STORAGE_POLICIES.md** for detailed screenshots and troubleshooting.
