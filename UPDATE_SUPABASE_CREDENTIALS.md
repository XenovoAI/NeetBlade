# Update Supabase Credentials

## Step 1: Create New Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for it to initialize (~2 minutes)

## Step 2: Get Your Credentials
1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long JWT token starting with `eyJ...`

## Step 3: Update Environment Files

### Update `client/.env`:
```env
VITE_SUPABASE_URL=YOUR_PROJECT_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### Update `.env` (root):
```env
VITE_SUPABASE_URL=YOUR_PROJECT_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

## Step 4: Run Database Setup

Go to Supabase Dashboard → SQL Editor and run these files in order:

1. **SUPABASE_MIGRATION.sql** - Creates materials table and RLS policies
2. **TEST_SYSTEM_TABLES.sql** - Creates test system tables
3. **SUPABASE_ORDERS_SCHEMA.sql** - Creates orders/payments tables
4. **ADMIN_AUTH_SETUP_FIXED.sql** - Sets up admin authentication

## Step 5: Setup Storage Bucket

1. Go to Storage → Create new bucket
2. Name it: `materials`
3. Make it **public**
4. Add policies (see SUPABASE_SETUP.md)

## Step 6: Restart Dev Server

Stop the current server (Ctrl+C) and run:
```bash
npm run dev
```

Your app should now connect to the new Supabase project!
