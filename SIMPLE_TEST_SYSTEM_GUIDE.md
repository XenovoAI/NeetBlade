# Simple Test System - User Guide

## ✅ WORKING - Simple Manual Test Upload System

Your basic test system is now fully functional! You can manually upload test series with questions.

## 🚀 How to Use

### Step 1: Access the Upload Page
1. Start the server: `cd /app && ./start-server.sh`
2. Open browser: http://localhost:5000/upload-test
3. Or click "Upload Test" in the navigation menu

### Step 2: Fill Test Details
- **Test Title** *: e.g., "NEET Physics Mock Test"
- **Subject** *: e.g., "Physics", "Chemistry", "Biology"
- **Duration** *: In minutes (e.g., 180 for 3 hours)
- **Description**: Brief description of the test

### Step 3: Add Questions
1. Fill in the question text
2. Add 4 options (A, B, C, D)
3. Select the correct answer from dropdown
4. Click "Add Question" to add more questions
5. Click trash icon to remove unwanted questions

### Step 4: Submit
- Click "Create Test" button
- You'll see "✅ Test created successfully!" message
- Form will reset for next test

### Step 5: View Tests
- Go to http://localhost:5000/tests
- All uploaded tests will be displayed
- Students can click "View Test" to take the test

## 📸 Screenshots

### Upload Page Features:
- ✅ Clean, simple form interface
- ✅ Test details section (title, subject, duration, description)
- ✅ Questions section with add/remove buttons
- ✅ Multiple choice options (A, B, C, D)
- ✅ Correct answer selector
- ✅ Success/error messages
- ✅ Form validation

### Tests Display:
- ✅ Card layout showing all tests
- ✅ Test title and description
- ✅ Subject badge
- ✅ Status badge (Scheduled/Active/Completed)
- ✅ Duration display
- ✅ "View Test" button

## 🎯 Example Test

**Test Details:**
- Title: NEET Chemistry Mock Test
- Subject: Chemistry
- Duration: 120 minutes
- Description: Complete Chemistry mock test covering all topics

**Sample Question:**
- Question: What is the atomic number of Carbon?
- Option A: 6 ✓ (Correct)
- Option B: 8
- Option C: 12
- Option D: 14

## ✨ Features

### Current Features:
- ✅ Manual test upload with form
- ✅ Add multiple questions per test
- ✅ Multiple choice questions (4 options)
- ✅ Select correct answer
- ✅ Test details (title, subject, duration, description)
- ✅ Tests display on Live Tests page
- ✅ Real-time validation
- ✅ Success/error notifications
- ✅ Form reset after submission

### What Works:
- ✅ Create unlimited tests
- ✅ Add unlimited questions per test
- ✅ Tests appear immediately on tests page
- ✅ All data stored and accessible via API
- ✅ Clean, professional UI

## 🔧 Technical Details

### API Endpoints Used:
- `POST /api/tests` - Create new test
- `POST /api/tests/:id/questions` - Add questions to test
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get specific test
- `GET /api/tests/:id/questions` - Get test questions

### Data Format:
```json
{
  "test": {
    "title": "Test Title",
    "subject": "Subject Name",
    "duration_minutes": 180,
    "description": "Description",
    "status": "scheduled"
  },
  "questions": [
    {
      "question_text": "Question?",
      "option_a": "Option A",
      "option_b": "Option B",
      "option_c": "Option C",
      "option_d": "Option D",
      "correct_option": 0
    }
  ]
}
```

## 🎨 UI Elements

### Navigation:
- "Upload Test" link in navbar (highlighted in orange)
- Easy access from any page

### Form Layout:
- Test Details card
- Questions section with expandable cards
- Add/Remove question buttons
- Submit button at bottom

### Styling:
- Clean, modern design
- Orange accent color for CTAs
- Card-based layout
- Responsive design

## 📝 Usage Tips

1. **Test Title**: Be descriptive (e.g., "NEET Physics - Mechanics Chapter")
2. **Subject**: Use consistent naming (Physics, Chemistry, Biology)
3. **Duration**: Standard NEET timing is 180 minutes
4. **Questions**: Add at least 5-10 questions per test
5. **Options**: Make sure all 4 options are filled
6. **Correct Answer**: Double-check before submitting

## ⚡ Quick Actions

### Create a Test:
```
1. Go to /upload-test
2. Fill test details
3. Add questions
4. Click "Create Test"
```

### View All Tests:
```
1. Go to /tests
2. Browse available tests
3. Click "View Test"
```

### Check API:
```bash
# List all tests
curl http://localhost:5000/api/tests

# Get specific test
curl http://localhost:5000/api/tests/1

# Get test questions
curl http://localhost:5000/api/tests/1/questions
```

## 🔍 Verification

### Test Upload Working:
✅ Form loads at /upload-test
✅ All fields accept input
✅ Add Question button works
✅ Remove Question button works
✅ Submit creates test successfully
✅ Success message appears
✅ Form resets after submit

### Tests Display Working:
✅ Tests page loads at /tests
✅ All uploaded tests visible
✅ Test cards show correct info
✅ Subject and status badges display
✅ Duration shows correctly
✅ View Test button present

## 🎉 Current Status

**System Status**: ✅ FULLY WORKING

**Tests Created**: 2
1. NEET Physics Mock Test (180 min, Physics)
2. NEET Chemistry Mock Test (120 min, Chemistry)

**Features Available**:
- Manual test upload ✅
- Multiple questions ✅
- Tests display ✅
- Real-time updates ✅
- Form validation ✅

## 📌 Important Notes

- **Data Storage**: Tests are stored in memory (will reset on server restart)
- **No Authentication**: Anyone can upload tests currently
- **Simple System**: Focused on core functionality
- **Easy to Use**: No complex setup required

## 🚦 Starting the System

```bash
# Start server
cd /app
./start-server.sh

# Verify it's running
curl http://localhost:5000/api/tests

# Access upload page
# http://localhost:5000/upload-test

# View tests
# http://localhost:5000/tests
```

---

**Last Updated**: November 7, 2025
**Status**: ✅ All features working correctly
