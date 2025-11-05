# New Supabase Database Setup Instructions

## ✅ Completed Steps

1. **Environment Variables Updated**
   - `/app/client/.env` - Updated with new Supabase URL and Anon Key
   - `/app/.env` - Created with new DATABASE_URL and Service Role Key

2. **Database Schema Pushed**
   - Basic `users` table created via Drizzle ORM

## 🔧 Required Manual Steps in Supabase Dashboard

To complete the database migration, you need to run the following SQL scripts in your **Supabase SQL Editor**:

### Step 1: Create All Tables and Policies

Go to your Supabase Dashboard → SQL Editor and run these files in order:

1. **Basic Migration** (Materials, RLS policies)
   - File: `/app/SUPABASE_MIGRATION.sql`
   - This creates: materials table, RLS policies, indexes

2. **Test System Tables** (If you use the test feature)
   - File: `/app/TEST_SYSTEM_TABLES.sql`
   - This creates: tests, questions, test_attempts, answers tables

3. **Test System RLS** (If you use the test feature)
   - File: `/app/TEST_SYSTEM_RLS.sql`
   - This creates: RLS policies for test tables

### Step 2: Configure Storage Bucket (For File Uploads)

If your app uploads files (materials, images, etc.):

1. Go to: **Storage** → Create new bucket called `materials`
2. Set bucket to **Public**
3. Add these policies:

**Public Read Policy:**
```sql
bucket_id = 'materials'
```

**Authenticated Upload Policy:**
```sql
bucket_id = 'materials' AND auth.role() = 'authenticated'
```

**Authenticated Delete Policy:**
```sql
bucket_id = 'materials' AND auth.role() = 'authenticated'
```

### Step 3: Create Admin User (If needed)

If you need an admin account, you can:

1. Sign up through your app's registration
2. Or create directly in Supabase Dashboard → Authentication → Users
3. Use email: `teamneetblade@gmail.com` (or your preferred admin email)

## 🔑 New Credentials Summary

- **Supabase URL:** `https://zqkusddsddcfqhefjxhz.supabase.co`
- **Anon Key:** Configured in `/app/client/.env`
- **Service Role Key:** Configured in `/app/.env`
- **Database URL:** Configured in `/app/.env`

## ▶️ Next Steps

1. Run the SQL migration scripts in your Supabase dashboard
2. Set up storage bucket if needed
3. Restart your application:
   ```bash
   # If using supervisor
   sudo supervisorctl restart all
   
   # Or if running manually
   yarn dev
   ```

4. Test the connection by accessing your application

## 📝 Notes

- All sensitive credentials are stored in `.env` files (not committed to git)
- The basic schema (users table) has already been created
- Additional tables (materials, tests, etc.) need to be created via SQL scripts
- RLS policies ensure proper security for your data
