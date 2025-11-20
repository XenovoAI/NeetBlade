# Deployment Troubleshooting Guide

## Railway Errors - Common Fixes

### 1. Build Errors
If Railway shows build errors, try these fixes:

**Update package.json:**
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

**Simplify build process:**
- Remove `cross-env` dependency if causing issues
- Use simple `node dist/index.js` for start command

### 2. Port Issues
Make sure your server uses Railway's PORT:
```javascript
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0');
```

### 3. Environment Variables
In Railway dashboard, add:
- `NODE_ENV=production`
- `SUPABASE_URL=your-url`
- `SUPABASE_ANON_KEY=your-key`

## Alternative Platforms (If Railway Fails)

### Option 1: Render.com
1. Go to [render.com](https://render.com)
2. Connect GitHub repo
3. Choose "Web Service"
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables

### Option 2: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Vercel auto-detects Node.js
4. Add environment variables
5. Deploy

### Option 3: Heroku
1. Go to [heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Option 4: DigitalOcean App Platform
1. Go to [digitalocean.com/products/app-platform](https://digitalocean.com/products/app-platform)
2. Create app from GitHub
3. Configure build settings
4. Add environment variables

## Quick Fix for Any Platform

If you're having deployment issues, try this simplified approach:

1. **Remove complex dependencies:**
   ```bash
   npm uninstall cross-env
   ```

2. **Simplify start script:**
   ```json
   "start": "node dist/index.js"
   ```

3. **Add engines to package.json:**
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

4. **Test locally first:**
   ```bash
   npm run build
   npm start
   ```

## Share Your Error Logs

To help debug, please share:
1. **Build logs** from Railway/platform
2. **Runtime errors** from logs
3. **Specific error messages**

Then I can provide targeted fixes!

## Backup Plan: Static Deployment

If all else fails, we can deploy as static site with mock data:
1. Use Netlify with `npm run build:static`
2. App will work with sample data
3. No backend complexity