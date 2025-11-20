# Netlify Functions Troubleshooting

## ✅ Functions Setup Complete

Your Netlify Functions have been rewritten to be self-contained and should work properly now.

## What Was Fixed

1. **Removed External Dependencies**: Functions no longer import from `server/services/testService`
2. **Self-Contained Services**: Each function now has its own simplified service class
3. **Added Debugging**: Functions now log requests for easier troubleshooting
4. **Added Health Check**: Test function health at `/.netlify/functions/tests/health`

## Testing Your Deployment

After deploying to Netlify, you can test the functions:

1. **Health Check**: Visit `https://your-site.netlify.app/.netlify/functions/tests/health`
2. **API Test**: Visit `https://your-site.netlify.app/api/tests` (should redirect to function)

## Environment Variables Required

Make sure these are set in your Netlify dashboard:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Function Logs

To view function logs in Netlify:
1. Go to your site dashboard
2. Click "Functions" tab
3. Click on a function to see its logs
4. Look for console.log outputs for debugging

## API Routes Mapping

- `/api/tests` → `/.netlify/functions/tests`
- `/api/tests/:id` → `/.netlify/functions/tests/:id`
- `/api/tests/:id/questions` → `/.netlify/functions/tests/:id/questions`
- `/api/tests/user/attempts` → `/.netlify/functions/tests/user/attempts`
- `/api/tests/attempts/*` → `/.netlify/functions/test-attempts/*`

## Common Issues

1. **Still getting HTML instead of JSON**: 
   - Check function logs for errors
   - Verify environment variables are set
   - Test the health check endpoint

2. **Function not found**:
   - Ensure build completed successfully
   - Check that functions are in the correct directory
   - Verify netlify.toml redirects are correct

3. **Database connection issues**:
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY
   - Check Supabase project is active
   - Test database connection in Supabase dashboard

## Next Steps

1. **Deploy to Netlify** with the updated code
2. **Set environment variables** in Netlify dashboard
3. **Test the health check** endpoint first
4. **Check function logs** if issues persist

Your functions should now work correctly! 🚀