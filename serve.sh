#!/bin/bash
# Simple HTTP server for Wedding Venue Simulator

echo "🎊 Starting Wedding Venue Layout Simulator..."
echo "📍 Server will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
# Fallback to Python 2
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
# Try Node.js http-server if available
elif command -v npx &> /dev/null; then
    npx http-server -p 8000
else
    echo "❌ No suitable HTTP server found."
    echo "Please install Python or Node.js, or open index.html directly in your browser."
    exit 1
fi
