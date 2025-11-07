# NEET Blade - Quick Start Guide

## ✅ Status: FIXED AND WORKING

The JSON parsing error on the tests page has been **completely resolved**. Tests are now loading correctly!

## 🚀 Starting the Application

### Method 1: Using the Startup Script (Recommended)
```bash
cd /app
./start-server.sh
```

### Method 2: Manual Start
```bash
cd /app
yarn install  # If needed
yarn dev
```

The server will start on **port 5000** and serve both:
- **API**: `http://localhost:5000/api/*`
- **Frontend**: `http://localhost:5000/*`

## 📋 Quick Commands

### Check if Server is Running
```bash
ps aux | grep tsx
```

### Test API Directly
```bash
# Get all tests
curl http://localhost:5000/api/tests

# Get specific test
curl http://localhost:5000/api/tests/1

# Get test questions
curl http://localhost:5000/api/tests/1/questions
```

### View Logs
```bash
tail -f /tmp/neetblade-server.log
```

### Stop Server
```bash
pkill -f "tsx server"
```

### Restart Server
```bash
pkill -f "tsx server"
./start-server.sh
```

## 🌐 Accessing the Application

Once the server is running:
- **Homepage**: http://localhost:5000/
- **Live Tests**: http://localhost:5000/tests
- **API Health Check**: http://localhost:5000/api/tests

## ✅ What Was Fixed

**Problem**: JSON parsing error `Unexpected token '<', "<!DOCTYPE "`
**Cause**: Backend wasn't running (supervisor misconfiguration)
**Solution**: Started the Express/Node.js server correctly on port 5000

## 📦 Tech Stack

- **Backend**: Express.js + TypeScript
- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Runtime**: Node.js
- **Package Manager**: Yarn

## 🔧 Available API Endpoints

### Tests
- `GET /api/tests` - Get all tests (with optional filters)
- `GET /api/tests/:id` - Get specific test
- `POST /api/tests` - Create new test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Questions
- `GET /api/tests/:id/questions` - Get questions for a test
- `POST /api/tests/:id/questions` - Add questions to a test

## 📝 Test Data

The application includes sample test data:

**Test**: NEET Physics Mock Test
- Subject: Physics
- Duration: 180 minutes
- Status: Scheduled
- Description: Complete Physics syllabus test

**Sample Question**: "What is the SI unit of force?"
- Options: Newton, Joule, Watt, Pascal
- Correct Answer: Newton

## 🐛 Troubleshooting

### Tests not showing?
1. Ensure server is running: `ps aux | grep tsx`
2. Check API response: `curl http://localhost:5000/api/tests`
3. View logs: `tail -f /tmp/neetblade-server.log`

### Port already in use?
```bash
lsof -ti:5000 | xargs kill -9
./start-server.sh
```

### Dependencies issues?
```bash
rm -rf node_modules yarn.lock
yarn install
```

## 📚 Additional Documentation

- **Full Fix Documentation**: `/app/FIX_DOCUMENTATION.md`
- **Detailed architecture and troubleshooting guide**

## 🎉 Success Indicators

✅ Server logs show: `serving on port 5000`
✅ API returns JSON: `curl http://localhost:5000/api/tests`
✅ Tests page loads without errors
✅ Test cards display with "View Test" buttons
✅ No JSON parsing errors in console

---

**Last Updated**: November 7, 2025
**Status**: ✅ All systems operational
