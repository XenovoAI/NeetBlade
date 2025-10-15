# Admin Panel Setup Guide - NEET Blade

## 🎉 What's Been Fixed

Your admin panel has been fully upgraded with the following improvements:

### ✅ Enhanced Upload Modal
- **Better UI/UX**: Added proper labels, textarea for descriptions, and subject selection
- **Subject Selection**: Dropdown to choose Physics, Chemistry, or Biology
- **File Validation**: Checks file size (max 50MB) before upload
- **Progress Indicators**: Loading spinners and success messages
- **Error Handling**: Clear error messages if upload fails
- **File Info Display**: Shows selected file name and size

### ✅ Improved Admin Dashboard
- **Better Material Display**: Shows subject badges, file sizes, and dates
- **Loading States**: Proper loading indicators while fetching data
- **Delete Confirmation**: Asks before deleting materials
- **View Button**: Quick access to view uploaded files
- **Empty State**: Helpful messages when no materials exist

### ✅ Dynamic Study Materials Page
- **Live Data**: Now fetches materials from Supabase database
- **Subject Filtering**: Automatically groups materials by Physics, Chemistry, Biology
- **Search Functionality**: Search materials by title or description
- **File Type Icons**: Different icons for PDFs and videos
- **Download Buttons**: Direct download links for all materials
- **Empty States**: Helpful messages when no materials are available

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. Go to your **Supabase Dashboard** (https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Open the file `/app/SUPABASE_MIGRATION.sql` in this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute

This will:
- Ensure the `materials` table has all required columns
- Set up Row Level Security (RLS) policies
- Create indexes for better performance

### Step 2: Configure Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Find the `materials` bucket
3. Click on the bucket name
4. Go to **Policies** tab
5. Add the following policies:

#### Policy 1: Public Read
```
Name: Public read access
Allowed operations: SELECT
Policy definition: bucket_id = 'materials'
```

#### Policy 2: Authenticated Upload
```
Name: Authenticated users can upload
Allowed operations: INSERT
Policy definition: bucket_id = 'materials'
```

#### Policy 3: Authenticated Delete
```
Name: Authenticated users can delete
Allowed operations: DELETE
Policy definition: bucket_id = 'materials'
```

4. **Make bucket public**:
   - Click on bucket settings (gear icon)
   - Enable "Public bucket"
   - Save changes

### Step 3: Verify Environment Variables

Check that your `/app/client/.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://txurxtacfknuevcpnvhh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ These are already configured correctly in your project.

---

## 🧪 Testing the Admin Panel

### Test Upload Functionality

1. **Access Admin Panel**: Navigate to `http://localhost:5000/admin`

2. **Go to Materials Tab**: Click on the "Materials" tab

3. **Upload a Test Material**:
   - Click "Upload Material" button
   - Fill in the form:
     - **Title**: e.g., "Physics - Laws of Motion"
     - **Subject**: Select "Physics"
     - **Description**: e.g., "Comprehensive notes on Newton's laws"
     - **File**: Select a PDF or video file
   - Click "Upload"

4. **Verify Upload**:
   - You should see a success message
   - The material should appear in the materials table
   - Note the subject badge, file size, and upload date

5. **Test Public Access**:
   - Navigate to `http://localhost:5000/materials`
   - Select the appropriate subject tab (Physics, Chemistry, Biology)
   - You should see the uploaded material
   - Click "Download" to verify the file is accessible

6. **Test Delete**:
   - Go back to admin panel (`/admin`)
   - Click the delete button (trash icon) next to a material
   - Confirm deletion
   - Material should be removed from the list

### Test Search Functionality

1. Go to `/materials`
2. Type in the search box
3. Materials should filter based on title or description

---

## 📋 Features Overview

### Admin Panel (`/admin`)
- **Dashboard Tab**: Overview of users, tests, materials, and attempts
- **Users Tab**: View and manage registered users
- **Materials Tab**: Upload, view, and delete study materials
- **Tests Tab**: Create and manage tests (placeholder for now)

### Study Materials Page (`/materials`)
- **Subject Tabs**: Filter by Physics, Chemistry, Biology
- **Search**: Find materials quickly
- **Download**: One-click download for all materials
- **Material Info**: See file size, subject, and upload date

---

## 🔧 Troubleshooting

### Upload Fails with "Upload failed: ..."
**Cause**: Storage bucket policy issue or authentication problem

**Solution**:
1. Verify storage bucket policies are set up correctly
2. Make sure the bucket is public or has proper authentication
3. Check browser console for detailed error messages

### Materials Not Showing on Public Page
**Cause**: RLS policies blocking read access

**Solution**:
1. Verify the "Allow public read access" policy exists on the materials table
2. Run the SQL: `SELECT * FROM materials;` in Supabase SQL Editor
3. If you see data, the issue is with RLS policies

### "Failed to load study materials"
**Cause**: Database connection issue or table doesn't exist

**Solution**:
1. Run the migration SQL script again
2. Check Supabase dashboard for any issues
3. Verify environment variables are correct

### Upload Succeeds but File Shows as Broken
**Cause**: Storage bucket not public or file path issue

**Solution**:
1. Make sure storage bucket is set to public
2. Verify the public URL is correct in the database
3. Try accessing the URL directly in browser

---

## 🎯 Next Steps

### Optional Enhancements
1. **Authentication**: Add admin login system
2. **File Preview**: Add inline PDF/video preview
3. **Categories**: Add more granular categorization (e.g., chapters)
4. **Analytics**: Track downloads and popular materials
5. **Bulk Upload**: Upload multiple files at once

### Security Recommendations
1. **Add Authentication**: Protect admin panel with login
2. **Validate File Types**: Restrict to specific file types
3. **Scan Files**: Add virus scanning for uploaded files
4. **Rate Limiting**: Prevent abuse of upload functionality

---

## 📊 Database Schema

The `materials` table now has the following structure:

| Column       | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | UUID      | Primary key (auto-generated)         |
| title        | TEXT      | Material title                       |
| description  | TEXT      | Material description (optional)      |
| url          | TEXT      | Public URL to the file               |
| subject      | TEXT      | Physics, Chemistry, or Biology       |
| file_name    | TEXT      | Original file name                   |
| file_size    | BIGINT    | File size in bytes                   |
| file_type    | TEXT      | MIME type (e.g., application/pdf)    |
| created_at   | TIMESTAMPTZ | Upload timestamp                   |

---

## 🐛 Known Issues

None currently! If you encounter any issues, please check the troubleshooting section above.

---

## 📞 Support

If you need help:
1. Check browser console for error messages
2. Check Supabase logs in the Dashboard
3. Verify all setup steps have been completed
4. Review the SQL migration script output

---

## ✨ Summary

Your NEET Blade admin panel is now fully functional with:
- ✅ Material upload with file validation
- ✅ Subject categorization (Physics, Chemistry, Biology)
- ✅ Public study materials page with live data
- ✅ Search and filter functionality
- ✅ Delete and view operations
- ✅ Proper error handling and loading states
- ✅ Row Level Security policies
- ✅ Responsive design with Tailwind CSS

**Enjoy your upgraded admin panel!** 🎉
