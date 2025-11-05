# Fix API Route Precedence Issue

## Problem
- Frontend receives HTML instead of JSON when fetching `/api/tests`
- Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- Vite's catch-all route overrides API routes

## Solution
- Register API routes after Vite setup to ensure they take precedence

## Tasks
- [x] Update `server/routes.ts` to remove API route registration, only create server
- [x] Update `server/index.ts` to import and register API routes after Vite setup
- [ ] Test the fix by running the server and checking API responses
