# 📚 Complete Procedure: Creating & Uploading Tests

## 🔑 Step 1: Admin Login

1. **Open your browser**
   - Go to: `http://localhost:5000/admin`
   - Email: `teamneetblade@gmail.com`

2. **Verify your email**
   - Check your email for verification link
   - Click the verification link
   - Return to admin panel

## 📝 Step 2: Create a New Test

### Basic Test Information:
1. **Click "Create New Test" button**
2. **Fill in test details:**

   ```
   Test Title: "NEET Physics Full Mock Test"
   Description: "Complete Physics syllabus test with 180 questions"
   Subject: "Physics"
   Duration: 180 (minutes = 3 hours)
   Scheduled Start: [Pick date and time]
   Initial Status: "Scheduled"
   ```

3. **Example Scheduling:**
   - For today at 4:00 PM: `2025-11-03T16:00:00`
   - For tomorrow at 10:00 AM: `2025-11-04T10:00:00`
   - Test will automatically unlock at this exact time!

## ❓ Step 3: Add Questions

### After creating test:
1. **Click the Edit button** (pencil icon) on your test
2. **Click "Manage Questions"**
3. **Switch to "Add New Questions" tab**

### Add Multiple Choice Questions:
```
Question 1:
Question Text: "What is the SI unit of force?"
Option A: Newton
Option B: Joule
Option C: Watt
Option D: Pascal
Correct Answer: A (option 0)
Points: 1

Question 2:
Question Text: "Which organelle is known as the powerhouse of the cell?"
Option A: Nucleus
Option B: Mitochondria
Option C: Ribosome
Option D: Golgi apparatus
Correct Answer: B (option 1)
Points: 1
```

4. **Click "Add Question"** for more questions
5. **Click "Save Questions"** when done

## ⏰ Step 4: Schedule & Launch Test

### Test Status Flow:
1. **Draft** → Creating test
2. **Scheduled** → Test scheduled for future
3. **Active** → Test is running now
4. **Completed** → Test has ended

### Manual Scheduling:
1. **Click calendar icon** to make test "Scheduled"
2. **Click play icon** to start test immediately
3. **Test automatically becomes "Active" at scheduled time**

## 👥 Step 5: Monitor Live Test

### Real-Time Monitoring:
1. **Click bar chart icon** on your test
2. **See live dashboard:**
   - Active participants count
   - Completed participants
   - Completion rate percentage
   - Individual student progress

### Monitor Features:
- **No refresh needed** - updates in real-time
- **See students joining** as they start
- **Track completion** as students finish
- **View individual progress** details

## 🎯 Step 6: Student Experience

### For Students to Take Test:
1. **Go to**: `http://localhost:5000/live-tests`
2. **See your test** with countdown timer
3. **Click "Join Waiting Room"** (for scheduled tests)
4. **Test automatically unlocks** at scheduled time
5. **All students start simultaneously**
6. **Real-time progress tracking**

## 📊 Step 7: Results & Analytics

### After Test Completion:
- **Immediate score calculation**
- **Detailed performance analytics**
- **Compare with other students**
- **Track improvement over time**

## 🚀 Quick Test Example

### Create a Test That Starts in 5 Minutes:

1. **Admin Panel** → Tests → "Create New Test"
2. **Test Details:**
   ```
   Title: "Quick Physics Test"
   Subject: "Physics"
   Duration: 30 minutes
   Scheduled Start: [Current time + 5 minutes]
   Status: "Scheduled"
   ```
3. **Add 5 sample questions**
4. **Save test**
5. **As student**: Go to live-tests page
6. **See countdown**: "Starts in 5 minutes"
7. **Join waiting room**
8. **Watch test auto-unlock** exactly at scheduled time!

## 🛠️ Advanced Features

### Test Series Management:
- **Create multiple tests** for a series
- **Schedule different subjects** at different times
- **Batch upload questions** from CSV (future feature)
- **Set different durations** for different tests

### Question Bank:
- **Reuse questions** across multiple tests
- **Categorize by difficulty**
- **Tag by topics/chapters**
- **Randomize question order**

## 🔧 Troubleshooting

### Common Issues:
1. **Test not appearing?**
   - Check status is "Scheduled" or "Active"
   - Verify scheduled_start time is in the future

2. **Can't join test?**
   - Ensure test status is "Active"
   - Check you're logged in as student
   - Verify scheduled time has arrived

3. **Real-time updates not working?**
   - WebSocket server needs to be enabled
   - Check internet connection
   - Refresh page if needed

## 📈 Best Practices

### For Admins:
1. **Schedule tests in advance** (at least 1 hour)
2. **Test with small groups first**
3. **Have backup questions ready**
4. **Monitor system during live tests**
5. **Start with shorter tests** (30-60 minutes)

### For Test Creation:
1. **Clear, unambiguous questions**
2. **Proper difficulty progression**
3. **Balanced option choices**
4. **Proofread all content**
5. **Test your questions before going live**

## 🎉 Success Checklist

Before going live with a test:
- [ ] Admin login working
- [ ] Test created with questions
- [ ] Scheduled start time set correctly
- [ ] Students can see test in live-tests page
- [ ] Waiting room countdown working
- [ ] Test unlocks at scheduled time
- [ ] All features tested successfully

Your real-time test system is now ready to use! 🚀