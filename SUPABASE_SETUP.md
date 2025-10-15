# Supabase RLS Policies Setup

To enable the admin panel to upload materials successfully, you need to configure Row Level Security (RLS) policies in your Supabase database.

## Step 1: Run SQL Commands in Supabase SQL Editor

Go to your Supabase Dashboard → SQL Editor and run the following commands:

```sql
-- Enable RLS on materials table
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read materials (for public study materials page)
CREATE POLICY "Allow public read access" ON materials
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert materials (for admin uploads)
CREATE POLICY "Allow authenticated insert" ON materials
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete materials (for admin delete)
CREATE POLICY "Allow authenticated delete" ON materials
  FOR DELETE
  USING (true);

-- Policy: Allow authenticated users to update materials
CREATE POLICY "Allow authenticated update" ON materials
  FOR UPDATE
  USING (true);
```

## Step 2: Configure Storage Bucket Policies

Go to Storage → materials bucket → Policies:

### Policy 1: Public Read Access
- **Policy Name**: Public read access
- **Allowed Operations**: SELECT
- **Policy Definition**:
```sql
bucket_id = 'materials'
```

### Policy 2: Authenticated Upload
- **Policy Name**: Authenticated users can upload
- **Allowed Operations**: INSERT
- **Policy Definition**:
```sql
bucket_id = 'materials' AND auth.role() = 'authenticated'
```

### Policy 3: Authenticated Delete
- **Policy Name**: Authenticated users can delete
- **Allowed Operations**: DELETE
- **Policy Definition**:
```sql
bucket_id = 'materials' AND auth.role() = 'authenticated'
```

## Step 3: Make Storage Bucket Public

1. Go to Storage → materials bucket
2. Click on the bucket settings (gear icon)
3. Enable "Public bucket" option
4. Save changes

## Alternative: Quick Testing Setup (Less Secure)

If you want to quickly test without authentication, you can disable RLS temporarily:

```sql
-- Disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
```

And make the storage bucket public with unrestricted access.

## Verification

After setting up the policies:
1. Go to your admin panel at `/admin`
2. Click on "Materials" tab
3. Click "Upload Material" button
4. Fill in title, description, and select a file
5. Click "Upload"
6. Material should appear in the materials list
7. Visit `/materials` page to see the uploaded material
