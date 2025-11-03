# Admin Guide - Real-Time Test System

## 🔑 Admin Login
- Go to: http://localhost:5000/admin
- Email: teamneetblade@gmail.com
- Check your email for verification link

## 📝 Creating a Live Test Series

### Step 1: Create a Test
1. Login to admin panel
2. Go to "Tests" tab
3. Click "Create New Test"
4. Fill in test details:
   - Title: "NEET Physics Mock Test 1"
   - Subject: "Physics"
   - Duration: 180 minutes (3 hours)
   - **Scheduled Start**: Set specific date/time
   - Status: "Scheduled"

### Step 2: Add Questions
1. After creating test, click edit button
2. Go to "Add New Questions" tab
3. Add questions with 4 options each
4. Mark correct answer (A, B, C, or D)
5. Set points for each question
6. Save questions

### Step 3: Schedule the Test
- Set `scheduled_start` to when test should unlock
- Example: Today at 3:00 PM
- Test will automatically unlock at that exact time
- All students can start simultaneously

## 📊 Real-Time Monitoring
1. Click monitoring icon (📊) for any test
2. See live participant count
3. Track completion rates
4. View individual student progress
5. No refresh needed - updates in real-time

## ⚡ Manual Controls
- **Schedule Test**: Change status to "scheduled"
- **Start Test**: Change status to "active"
- **Monitor**: Open real-time dashboard
- **Delete**: Remove test completely

## 🕐 Test Timing Example
To create a test that starts today at 3:00 PM:
1. Set scheduled_start: "2025-11-03T15:00:00"
2. Set duration_minutes: 180
3. Status: "scheduled"
4. Test automatically unlocks at 3:00 PM
5. Students can join from waiting room