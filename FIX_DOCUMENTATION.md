# Tests Loading Fix - Documentation

## Problem
The "Live Tests" page was showing a JSON parsing error:
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This error occurred because the frontend was trying to fetch test data from `/api/tests` but receiving HTML instead of JSON.

## Root Cause Analysis

### Architecture Mismatch
The supervisor configuration was set up for a **FastAPI (Python) + React + MongoDB** stack:
- Backend: uvicorn server at `/app/backend` on port 8001
- Frontend: React at `/app/frontend` on port 3000

However, the actual application uses **Express/Node.js + React/Vite + Supabase**:
- Backend + Frontend: Single Express server with Vite at `/app` on port 5000
- Server code: `/app/server/index.ts`
- Client code: `/app/client/src/`

### Why Tests Weren't Loading
1. Supervisor tried to start uvicorn from `/app/backend` (doesn't exist)
2. Backend service failed to start
3. Frontend made API calls to `/api/tests`
4. No backend was running to handle the request
5. Request either failed or returned HTML error page
6. Frontend tried to parse HTML as JSON → JSON parsing error

## Solution Implemented

### 1. Started the Correct Backend
```bash
cd /app
yarn install
yarn dev  # Starts Express server with Vite on port 5000
```

This single command starts:
- Express API server handling `/api/*` routes
- Vite dev server for frontend
- Both served from the same origin (port 5000)

### 2. Verified API Endpoints
All test-related endpoints are working:
- `GET /api/tests` - List all tests ✅
- `GET /api/tests/:id` - Get specific test ✅
- `GET /api/tests/:id/questions` - Get test questions ✅
- `POST /api/tests` - Create test ✅
- `PUT /api/tests/:id` - Update test ✅
- `DELETE /api/tests/:id` - Delete test ✅

### 3. Created Startup Script
Created `/app/start-server.sh` for easy server management:
```bash
./start-server.sh
```

## Application Architecture

### Tech Stack
- **Backend**: Express.js (TypeScript)
- **Frontend**: React with Vite
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: Yarn

### Directory Structure
```
/app/
├── server/              # Express backend
│   ├── index.ts        # Main server file
│   ├── routes.ts       # Route registration
│   ├── simple-test-api.ts  # Test API endpoints
│   └── vite.ts         # Vite integration
├── client/             # React frontend
│   └── src/
│       ├── App.tsx
│       ├── pages/
│       │   └── LiveTestsPage.tsx
│       └── lib/
│           └── api.ts  # API configuration
├── package.json        # Dependencies & scripts
└── start-server.sh     # Startup script
```

### How It Works
1. **Server Startup**: `yarn dev` runs `tsx server/index.ts`
2. **Express Setup**: 
   - Registers API routes under `/api`
   - Mounts test API at `/api/tests`
   - Sets up Vite middleware for frontend
3. **Single Port**: Both API and frontend served on port 5000
4. **Development Mode**: Hot reload enabled for both backend and frontend

### API Base URL Configuration
The frontend API base URL is automatically configured in `/app/client/src/lib/api.ts`:
- Development: `http://localhost:5000`
- Production: Uses current window origin

## Test Data
The application includes a demo test:
- **Title**: NEET Physics Mock Test
- **Subject**: Physics
- **Duration**: 180 minutes
- **Status**: Scheduled
- **Sample Question**: "What is the SI unit of force?"

## Verification Steps
1. Backend running: `ps aux | grep tsx`
2. API responding: `curl http://localhost:5000/api/tests`
3. Frontend loading: Visit `http://localhost:5000/tests`
4. Check logs: `tail -f /tmp/neetblade-server.log`

## Future Considerations
1. **Supervisor Configuration**: The supervisor config at `/etc/supervisor/conf.d/supervisord.conf` is read-only and configured for the wrong stack. Consider:
   - Creating a custom supervisor config for this app, or
   - Using the startup script in a cron job or systemd service

2. **Production Deployment**: For production, use:
   ```bash
   yarn build  # Builds frontend and backend
   yarn start  # Runs production server
   ```

3. **Database**: Currently uses in-memory storage. Tests are reset on server restart. Consider connecting to persistent Supabase database for production.

## Troubleshooting

### If Tests Don't Load
1. Check if server is running:
   ```bash
   ps aux | grep tsx
   ```

2. Test API directly:
   ```bash
   curl http://localhost:5000/api/tests
   ```

3. Check logs:
   ```bash
   tail -f /tmp/neetblade-server.log
   ```

4. Restart server:
   ```bash
   pkill -f "tsx server"
   ./start-server.sh
   ```

### Common Issues
- **Port 5000 in use**: Kill the process using `lsof -ti:5000 | xargs kill -9`
- **Dependencies missing**: Run `yarn install`
- **CORS errors**: Backend has proper CORS setup in development mode

## Status
✅ **FIXED**: Tests are now loading correctly on the Live Tests page
✅ **VERIFIED**: All API endpoints working
✅ **STABLE**: Server running on port 5000
✅ **DOCUMENTED**: Solution and architecture documented
