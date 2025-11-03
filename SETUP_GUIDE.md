# Real-Time Test System Setup Guide

## 1. Database Setup

### Run these SQL commands in your Supabase SQL Editor:

```sql
-- Step 1: Create test tables
-- Copy and paste the contents of TEST_SYSTEM_TABLES.sql

-- Step 2: Set up security policies
-- Copy and paste the contents of TEST_SYSTEM_RLS.sql
```

## 2. Environment Variables

Add these to your `.env` file:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
WS_PORT=5050
```

## 3. Start the Application

```bash
# Install dependencies
npm install

# Start in development
npm run dev
```

The system will start with:
- Main server on port 5000
- WebSocket server on port 5050
- Test scheduler automatically running

## 4. Admin Features

### Creating Tests:
1. Login as admin (teamneetblade@gmail.com)
2. Go to Admin panel → Tests tab
3. Click "Create New Test"
4. Fill in test details and schedule
5. Add questions
6. Set status to "scheduled"

### Test Scheduling:
- Set `scheduled_start` to when test should unlock
- Set `duration_minutes` for test length
- System automatically handles unlock/lock timing

## 5. Student Experience

### Test Access:
1. Go to Live Tests page
2. See scheduled tests with countdown timers
3. "Join Waiting Room" before scheduled time
4. Test automatically unlocks at scheduled time
5. All participants start simultaneously

## 6. Real-Time Monitoring

### Admin can monitor:
- Live participant count
- Completion rates
- Individual student progress
- Test session statistics

No page refresh needed - all updates happen in real-time!