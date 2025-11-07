#!/bin/bash
# Startup script for NEET Blade application
# This script starts the Express/Vite dev server which serves both API and frontend

cd /app

# Kill any existing processes on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    yarn install
fi

# Start the dev server in background
echo "Starting NEET Blade server..."
nohup yarn dev > /tmp/neetblade-server.log 2>&1 &

# Wait for server to start
sleep 5

# Check if server is running
if curl -s http://localhost:5000/api/tests > /dev/null; then
    echo "✅ Server started successfully on port 5000"
    echo "📊 API endpoint: http://localhost:5000/api/tests"
    echo "🌐 Frontend: http://localhost:5000"
else
    echo "❌ Server failed to start. Check logs at /tmp/neetblade-server.log"
    exit 1
fi
