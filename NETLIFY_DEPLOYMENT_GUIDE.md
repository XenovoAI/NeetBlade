# Netlify Deployment Guide

## Setup Complete ✅

Your application has been configured for Netlify deployment with serverless functions.

## What Was Changed

1. **Added Netlify Functions**: Created serverless functions to replace Express API routes
   - `netlify/functions/tests.ts` - Handles test-related API calls
   - `netlify/functions/test-attempts.ts` - Handles test attempt API calls

2. **Updated Build Configuration**:
   - Added `build:netlify` script that builds both frontend and functions
   - Added `build:functions` script to compile TypeScript functions
   - Updated `netlify.toml` with proper redirects

3. **Added Dependencies**:
   - `@netlify/functions` for serverless function support

## Deployment Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will automatically detect the `netlify.toml` configuration
   - Click "Deploy site"

3. **Environment Variables**:
   Add these environment variables in Netlify dashboard (Site settings → Environment variables):
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - Any other environment variables from your `.env` file

## API Routes Mapping

Your frontend API calls will now work as follows:
- `/api/tests` → `/.netlify/functions/tests`
- `/api/tests/user/attempts` → `/.netlify/functions/tests/user/attempts`
- `/api/tests/attempts/*` → `/.netlify/functions/test-attempts/*`

## Testing Locally

To test the Netlify functions locally:
```bash
npm install -g netlify-cli
netlify dev
```

## Build Command

The build command is now: `npm run build:netlify`

This will:
1. Build the React frontend with Vite
2. Compile TypeScript functions to JavaScript
3. Copy redirect rules to the dist folder

## Notes

- All API routes have been converted to serverless functions
- CORS is properly configured in the functions
- Authentication middleware is preserved
- The same database service is used

Your application should now work perfectly on Netlify! 🚀