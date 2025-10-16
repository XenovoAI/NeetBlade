#!/bin/bash

echo "======================================"
echo "   NEET BLADE ADMIN FIX DEPLOYMENT   "
echo "======================================"
echo ""

# Check if in git repo
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Please initialize git first with: git init"
    exit 1
fi

echo "📋 Checking git status..."
git status --short

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Fix admin panel: hooks violation + separate admin login"

echo ""
echo "🚀 Pushing to remote..."
git push origin main || git push origin master

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Wait 2-3 minutes for Netlify to rebuild"
echo "2. Clear browser cache (Ctrl+Shift+Delete)"
echo "3. Go to yourdomain.com/admin/login"
echo "4. Login and access admin panel!"
echo ""
echo "======================================"
